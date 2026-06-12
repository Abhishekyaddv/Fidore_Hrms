<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OfficeLocation;
use Illuminate\Http\Request;

class OfficeLocationController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'radius_meters' => 'nullable|integer|min:10',
            'address' => 'nullable|string',
        ]);

        $officeLocation = OfficeLocation::first();
        
        if ($officeLocation) {
            $officeLocation->update([
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'radius_meters' => $request->input('radius_meters', 50),
                'address' => $request->address,
            ]);
        } else {
            $officeLocation = OfficeLocation::create([
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'radius_meters' => $request->input('radius_meters', 50),
                'address' => $request->address,
            ]);
        }

        // Fetch address synchronously if not provided
        if (!$officeLocation->address || $officeLocation->wasChanged(['latitude', 'longitude'])) {
            $lat = round($request->latitude, 4);
            $lon = round($request->longitude, 4);
            $cacheKey = "address_{$lat}_{$lon}";
            
            $address = \Illuminate\Support\Facades\Cache::rememberForever($cacheKey, function () use ($lat, $lon) {
                $response = \Illuminate\Support\Facades\Http::withHeaders([
                    'User-Agent' => 'HRMS-App/1.0',
                ])->get('https://nominatim.openstreetmap.org/reverse', [
                    'format' => 'json',
                    'lat' => $lat,
                    'lon' => $lon,
                ]);

                if ($response->successful() && $response->json('display_name')) {
                    return $response->json('display_name');
                }
                return null;
            });

            if ($address) {
                $officeLocation->update(['address' => $address]);
            }
        }

        return back()->with('success', 'Office location updated successfully.');
    }
}
