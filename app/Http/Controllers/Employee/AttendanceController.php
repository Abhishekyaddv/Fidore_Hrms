<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\UserLocation;
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

        $history = is_array($attendance->punch_history) ? $attendance->punch_history : [];
        if (!empty($history) && end($history)['out'] === null) {
            return back()->withErrors(['punch_in' => 'Already punched in.']);
        }

        $request->validate([
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $now = now();
        $history[] = [
            'in' => $now->toIso8601String(),
            'out' => null,
        ];

        $updateData = [
            'punch_history' => $history,
        ];

        if (!$attendance->punch_in) {
            $updateData['punch_in'] = $now;
            $updateData['minutes_late'] = 0;
        }

        $attendance->update($updateData);

        if ($request->filled('latitude') && $request->filled('longitude')) {
            UserLocation::create([
                'user_id' => $user->id,
                'attendance_id' => $attendance->id,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'type' => 'punch_in',
            ]);
        }

        return back()->with('success', 'Punched in successfully.');
    }

    public function punchOut(Request $request)
    {
        $user = $request->user();
        $today = now()->toDateString();

        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if (!$attendance) {
            return back()->withErrors(['punch_out' => 'You must punch in first.']);
        }

        $history = is_array($attendance->punch_history) ? $attendance->punch_history : [];
        if (empty($history) || end($history)['out'] !== null) {
            return back()->withErrors(['punch_out' => 'You are not currently punched in.']);
        }

        $now = now();
        $lastIndex = count($history) - 1;
        $history[$lastIndex]['out'] = $now->toIso8601String();

        $totalMinutes = 0;
        foreach ($history as $session) {
            if ($session['out']) {
                $inTime = \Carbon\Carbon::parse($session['in']);
                $outTime = \Carbon\Carbon::parse($session['out']);
                $totalMinutes += $inTime->diffInMinutes($outTime);
            }
        }

        $attendance->update([
            'punch_out' => $now,
            'punch_history' => $history,
            'total_logged_minutes' => $totalMinutes,
        ]);

        return back()->with('success', 'Punched out successfully.');
    }
}
