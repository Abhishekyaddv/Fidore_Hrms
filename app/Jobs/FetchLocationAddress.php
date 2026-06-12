<?php

namespace App\Jobs;

use App\Models\UserLocation;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FetchLocationAddress implements ShouldQueue
{
    use Queueable;

    public $userLocation;

    /**
     * The number of times the job may be attempted.
     */
    public $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(UserLocation $userLocation)
    {
        $this->userLocation = $userLocation;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Round coordinates to 4 decimal places (~11 meters accuracy)
            $lat = round($this->userLocation->latitude, 4);
            $lon = round($this->userLocation->longitude, 4);
            
            // Create a unique cache key for these coordinates
            $cacheKey = "address_{$lat}_{$lon}";

            // Check if address is already cached forever
            $address = Cache::rememberForever($cacheKey, function () use ($lat, $lon) {
                $response = Http::withHeaders([
                    'User-Agent' => 'HRMS-App/1.0',
                ])->get('https://nominatim.openstreetmap.org/reverse', [
                    'format' => 'json',
                    'lat' => $lat,
                    'lon' => $lon,
                ]);

                // Respect Nominatim's strict 1 request per second policy
                sleep(1);

                if ($response->successful() && $response->json('display_name')) {
                    return $response->json('display_name');
                }

                // If API fails or rate-limits, throw exception to trigger backoff
                if ($response->status() === 429 || $response->status() >= 500) {
                    throw new \Exception('Nominatim API rate limit or server error.');
                }

                return null;
            });

            if ($address) {
                $this->userLocation->update([
                    'address' => $address
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to fetch address for UserLocation ID ' . $this->userLocation->id . ': ' . $e->getMessage());
            
            // Release the job back to the queue with exponential backoff
            $this->release(10 * $this->attempts());
        }
    }
}
