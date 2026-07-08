<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Attendance;
use Carbon\Carbon;
use App\Notifications\PunchInReminderNotification;

class PunchInReminder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:punch-in-reminder';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send push notification to employees who have not punched in yet today.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today()->toDateString();
        
        // Find users who do NOT have an attendance record for today with a punch_in
        $usersToRemind = User::whereIn('role', ['employee', 'hr'])
            ->whereDoesntHave('attendances', function ($query) use ($today) {
                $query->where('date', $today)->whereNotNull('punch_in');
            })
            ->get();

        foreach ($usersToRemind as $user) {
            $user->notify(new PunchInReminderNotification());
            $this->info("Sent punch in reminder to user ID {$user->id}");
        }

        $this->info("Punch in reminder check completed.");
    }
}

