<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\UserLocation;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    private function calculateDistance($lat1, $lon1, $lat2, $lon2) {
        $earthRadius = 6371000; // in meters
        
        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lonDelta / 2) * sin($lonDelta / 2);
             
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return $earthRadius * $c;
    }
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

        $officeLocation = \App\Models\OfficeLocation::first();
        if (!$officeLocation) {
            return back()->withErrors(['punch_in' => 'Attendance is currently disabled until admin configures the office location.']);
        }

        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ], [
            'latitude.required' => 'Location access is required to punch in.',
            'longitude.required' => 'Location access is required to punch in.',
        ]);

        $distance = $this->calculateDistance(
            $officeLocation->latitude, 
            $officeLocation->longitude, 
            $request->latitude, 
            $request->longitude
        );

        if ($distance > $officeLocation->radius_meters) {
            return back()->withErrors(['punch_in' => 'You must be within ' . $officeLocation->radius_meters . ' meters of the office to punch in. You are currently ' . round($distance) . ' meters away.']);
        }

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
            $userLocation = UserLocation::create([
                'user_id' => $user->id,
                'attendance_id' => $attendance->id,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'type' => 'punch_in',
            ]);
            \App\Jobs\FetchLocationAddress::dispatch($userLocation);
        }

        return back()->with('success', 'Punched in successfully.');
    }

    public function punchOut(Request $request)
    {
        $officeLocation = \App\Models\OfficeLocation::first();
        if (!$officeLocation) {
            return back()->withErrors(['punch_out' => 'Attendance is currently disabled until admin configures the office location.']);
        }

        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ], [
            'latitude.required' => 'Location access is required to punch out.',
            'longitude.required' => 'Location access is required to punch out.',
        ]);

        $distance = $this->calculateDistance(
            $officeLocation->latitude, 
            $officeLocation->longitude, 
            $request->latitude, 
            $request->longitude
        );

        if ($distance > $officeLocation->radius_meters) {
            return back()->withErrors(['punch_out' => 'You must be within ' . $officeLocation->radius_meters . ' meters of the office to punch out. You are currently ' . round($distance) . ' meters away.']);
        }

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

        if ($request->filled('latitude') && $request->filled('longitude')) {
            $userLocation = UserLocation::create([
                'user_id' => $user->id,
                'attendance_id' => $attendance->id,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'type' => 'punch_out',
            ]);
            \App\Jobs\FetchLocationAddress::dispatch($userLocation);
        }

        return back()->with('success', 'Punched out successfully.');
    }
}
