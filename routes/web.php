<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        $user = request()->user();
        if ($user->hasAdminAccess()) {
            // Fetch designations for the dropdown
            $designations = \App\Models\Designation::all();

            // Calculate next sequential employee ID
            $lastSeq = \App\Models\User::whereNotNull('employee_id')
                ->where('employee_id', 'like', 'EMP-%')
                ->get()
                ->map(function ($user) {
                    return (int) str_replace('EMP-', '', $user->employee_id);
                })
                ->max();
            $nextSeq = ($lastSeq ?: 0) + 1;
            $nextEmployeeId = 'EMP-' . $nextSeq;

            $todayAttendance = \App\Models\Attendance::where('user_id', $user->id)
                ->where('date', now()->toDateString())
                ->first();

            $totalEmployees = \App\Models\User::count();
            $newEmployeesThisMonth = \App\Models\User::where('created_at', '>=', now()->startOfMonth())->count();
            $pendingLeaves = \App\Models\LeaveRequest::where('status', 'pending')->count();

            // Today's attendance stats
            $presentCount = \App\Models\Attendance::where('date', now()->toDateString())
                ->whereNotNull('punch_in')
                ->count();

            $leaveCount = \App\Models\LeaveRequest::where('status', 'approved')
                ->whereDate('start_date', '<=', now()->toDateString())
                ->whereDate('end_date', '>=', now()->toDateString())
                ->count();

            $attendancesToday = \App\Models\Attendance::where('date', now()->toDateString())
                ->whereNotNull('punch_in')
                ->get();
            $lateCount = $attendancesToday->filter(function ($att) {
                return $att->punch_in ? $att->punch_in->format('H:i:s') > '09:30:00' : false;
            })->count();

            $absentCount = max(0, $totalEmployees - $presentCount - $leaveCount);
            $presentPercentage = $totalEmployees > 0 ? round(($presentCount / $totalEmployees) * 100) : 0;

            $recentLeaveRequests = \App\Models\LeaveRequest::with(['user.designation'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            return Inertia::render('Admin/Dashboard', [
                'designations' => $designations,
                'nextEmployeeId' => $nextEmployeeId,
                'todayAttendance' => $todayAttendance,
                'stats' => [
                    'totalEmployees' => $totalEmployees,
                    'newEmployeesThisMonth' => $newEmployeesThisMonth,
                    'pendingLeaves' => $pendingLeaves,
                    'presentCount' => $presentCount,
                    'leaveCount' => $leaveCount,
                    'lateCount' => $lateCount,
                    'absentCount' => $absentCount,
                    'presentPercentage' => $presentPercentage,
                ],
                'recentLeaveRequests' => $recentLeaveRequests,
            ]);
        }

        $user->load('designation');
        $todayAttendance = \App\Models\Attendance::where('user_id', $user->id)
            ->where('date', now()->toDateString())
            ->first();

        $startOfMonth = now()->startOfMonth()->toDateString();
        $endOfMonth = now()->endOfMonth()->toDateString();

        $monthAttendances = \App\Models\Attendance::where('user_id', $user->id)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->get();

        $holidays = \App\Models\Holiday::getHolidaysInRange($startOfMonth, $endOfMonth);

        $leaveRequests = \App\Models\LeaveRequest::where('user_id', $user->id)
            ->where(function ($query) use ($startOfMonth, $endOfMonth) {
                $query->whereBetween('start_date', [$startOfMonth, $endOfMonth])
                    ->orWhereBetween('end_date', [$startOfMonth, $endOfMonth])
                    ->orWhere(function ($q) use ($startOfMonth, $endOfMonth) {
                        $q->where('start_date', '<=', $startOfMonth)
                          ->where('end_date', '>=', $endOfMonth);
                    });
            })->get();

        return Inertia::render('Employee/Dashboard', [
            'employee' => $user,
            'todayAttendance' => $todayAttendance,
            'monthAttendances' => $monthAttendances,
            'holidays' => $holidays,
            'leaveRequests' => $leaveRequests,
        ]);
    })->name('dashboard')->middleware(\App\Http\Middleware\CheckBearerToken::class);

    Route::prefix('admin')->name('admin.')->middleware(\App\Http\Middleware\CheckBearerToken::class)->group(function () {

        Route::resource('designations', \App\Http\Controllers\Admin\DesignationController::class);
        Route::resource('employees', \App\Http\Controllers\Admin\EmployeeController::class);
        
        // Admin Leave Management
        Route::get('leaves', [\App\Http\Controllers\Admin\LeaveManagementController::class, 'index'])->name('leaves.index');
        Route::post('leaves/holidays', [\App\Http\Controllers\Admin\LeaveManagementController::class, 'storeHoliday'])->name('leaves.holidays.store');
        Route::delete('leaves/holidays/{holiday}', [\App\Http\Controllers\Admin\LeaveManagementController::class, 'destroyHoliday'])->name('leaves.holidays.destroy');
        Route::post('leaves/policies', [\App\Http\Controllers\Admin\LeaveManagementController::class, 'storePolicy'])->name('leaves.policies.store');

        Route::patch('leaves/requests/{leaveRequest}', [\App\Http\Controllers\Admin\LeaveManagementController::class, 'updateRequestStatus'])->name('leaves.requests.update');
        Route::delete('leaves/requests/{leaveRequest}', [\App\Http\Controllers\Admin\LeaveManagementController::class, 'destroyRequest'])->name('leaves.requests.destroy');
    });

    // Employee My Leaves
    Route::get('my-leaves', [\App\Http\Controllers\Employee\MyLeavesController::class, 'index'])->name('my-leaves.index')->middleware(\App\Http\Middleware\CheckBearerToken::class);
    Route::post('my-leaves', [\App\Http\Controllers\Employee\MyLeavesController::class, 'store'])->name('my-leaves.store')->middleware(\App\Http\Middleware\CheckBearerToken::class);
    Route::delete('my-leaves/{leaveRequest}', [\App\Http\Controllers\Employee\MyLeavesController::class, 'destroy'])->name('my-leaves.destroy')->middleware(\App\Http\Middleware\CheckBearerToken::class);

    // Attendance
    Route::post('attendance/punch-in', [\App\Http\Controllers\Employee\AttendanceController::class, 'punchIn'])->name('attendance.punch-in')->middleware(\App\Http\Middleware\CheckBearerToken::class);
    Route::post('attendance/punch-out', [\App\Http\Controllers\Employee\AttendanceController::class, 'punchOut'])->name('attendance.punch-out')->middleware(\App\Http\Middleware\CheckBearerToken::class);

    Route::get('profile', [\App\Http\Controllers\ProfileController::class, 'show'])->name('profile.show');
    Route::post('profile', [\App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update_info');
    Route::post('profile/avatar', [\App\Http\Controllers\ProfileController::class, 'updateAvatar'])->name('profile.update_avatar');
});



Route::get('/test-mail', function () {

    Mail::raw('This is a test email from Laravel.', function ($message) {
        $message->to('ay6293347@gmail.com')
                ->subject('Laravel Mail Test');
    });

    return 'Mail Sent';
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
