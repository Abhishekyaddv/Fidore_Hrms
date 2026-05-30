<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function punchIn(Request $request)
    {
        $user = $request->user();
        $today = now()->toDateString();

        $attendance = Attendance::firstOrCreate(
            ['user_id' => $user->id, 'date' => $today]
        );

        if ($attendance->punch_in) {
            return back()->withErrors(['punch_in' => 'Already punched in for today.']);
        }

        $timing = \App\Models\OfficeTiming::first();
        $minutesLate = 0;
        
        if ($timing && $timing->start_time) {
            $currentTime = now();
            $expectedTime = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $today . ' ' . $timing->start_time);
            if ($currentTime->gt($expectedTime)) {
                $minutesLate = $currentTime->diffInMinutes($expectedTime);
            }
        }

        $attendance->update([
            'punch_in' => now(),
            'minutes_late' => $minutesLate,
        ]);

        return back()->with('success', 'Punched in successfully.');
    }

    public function punchOut(Request $request)
    {
        $user = $request->user();
        $today = now()->toDateString();

        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if (!$attendance || !$attendance->punch_in) {
            return back()->withErrors(['punch_out' => 'You must punch in first.']);
        }

        if ($attendance->punch_out) {
            return back()->withErrors(['punch_out' => 'Already punched out for today.']);
        }

        $attendance->update([
            'punch_out' => now(),
        ]);

        return back()->with('success', 'Punched out successfully.');
    }
}
