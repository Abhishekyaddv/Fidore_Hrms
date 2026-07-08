<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Attendance;
use Carbon\Carbon;
use App\Notifications\AutoPunchOutNotification;

class AutoPunchOut extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:auto-punch-out';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically punches out employees who have been logged in for more than 8 hours.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();

        // Get attendances for today and yesterday
        $attendances = Attendance::with('user')
            ->whereIn('date', [$now->toDateString(), $now->copy()->subDay()->toDateString()])
            ->whereNull('punch_out')
            ->get();

        foreach ($attendances as $attendance) {
            $history = is_array($attendance->punch_history) ? $attendance->punch_history : [];

            if (empty($history)) {
                continue;
            }

            $lastIndex = count($history) - 1;
            $lastSession = $history[$lastIndex];

            if ($lastSession['out'] === null) {
                $inTime = Carbon::parse($lastSession['in']);

                // If logged in for 8 hours or more
                if ($now->diffInMinutes($inTime) >= 8 * 60) {
                    $outTime = $inTime->copy()->addHours(8);
                    
                    // Close the session
                    $history[$lastIndex]['out'] = $outTime->toIso8601String();

                    // Recalculate total minutes
                    $totalMinutes = 0;
                    foreach ($history as $session) {
                        if ($session['out']) {
                            $in = Carbon::parse($session['in']);
                            $out = Carbon::parse($session['out']);
                            $totalMinutes += $in->diffInMinutes($out);
                        }
                    }

                    $attendance->update([
                        'punch_out' => $outTime,
                        'punch_history' => $history,
                        'total_logged_minutes' => $totalMinutes,
                    ]);

                    // Send Web Push Notification
                    if ($attendance->user) {
                        $attendance->user->notify(new AutoPunchOutNotification());
                    }

                    $this->info("Auto punched out user ID {$attendance->user_id} for attendance date {$attendance->date}");
                }
            }
        }
        
        $this->info("Auto punch out check completed.");
    }
}
