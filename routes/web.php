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

            $latestLocation = \App\Models\UserLocation::where('user_id', $user->id)->latest()->first();

            $totalEmployees = \App\Models\User::where('role', '!=', 'superadmin')->count();
            $newEmployeesThisMonth = \App\Models\User::where('role', '!=', 'superadmin')->where('created_at', '>=', now()->startOfMonth())->count();

            // Today's attendance stats
            $presentCount = \App\Models\Attendance::whereHas('user', function ($q) {
                $q->where('role', '!=', 'superadmin');
            })->where('date', now()->toDateString())
                ->whereNotNull('punch_in')
                ->count();

            $attendancesToday = \App\Models\Attendance::with('user')->whereHas('user', function ($q) {
                $q->where('role', '!=', 'superadmin');
            })->where('date', now()->toDateString())
                ->whereNotNull('punch_in')
                ->get();
                
            $activeEmployees = $attendancesToday->filter(function ($att) {
                return is_null($att->punch_out);
            })->map(function ($att) {
                return [
                    'id' => $att->user->id,
                    'name' => $att->user->name,
                    'email' => $att->user->email,
                    'role' => $att->user->role,
                    'avatar' => $att->user->avatar,
                    'punch_in' => $att->punch_in,
                ];
            })->values();
            $lateCount = $attendancesToday->filter(function ($att) {
                return $att->punch_in ? $att->punch_in->format('H:i:s') > '09:30:00' : false;
            })->count();

            $absentCount = max(0, $totalEmployees - $presentCount);
            $presentPercentage = $totalEmployees > 0 ? round(($presentCount / $totalEmployees) * 100) : 0;

            $officeLocation = \App\Models\OfficeLocation::first();

            return Inertia::render('Admin/Dashboard', [
                'nextEmployeeId' => $nextEmployeeId,
                'employees' => \App\Models\User::whereIn('role', ['employee', 'hr', 'superadmin'])->get(),
                'todayAttendance' => $todayAttendance,
                'latestLocation' => $latestLocation,
                'officeLocation' => $officeLocation,
                'stats' => [
                    'totalEmployees' => $totalEmployees,
                    'newEmployeesThisMonth' => $newEmployeesThisMonth,
                    'presentCount' => $presentCount,
                    'lateCount' => $lateCount,
                    'absentCount' => $absentCount,
                    'presentPercentage' => $presentPercentage,
                ],
                'activeEmployees' => $activeEmployees,
            ]);
        }

        $user->load(['reportingManager']);
        $todayAttendance = \App\Models\Attendance::where('user_id', $user->id)
            ->where('date', now()->toDateString())
            ->first();

        $latestLocation = \App\Models\UserLocation::where('user_id', $user->id)->latest()->first();

        $startOfMonth = now()->startOfMonth()->toDateString();
        $endOfMonth = now()->endOfMonth()->toDateString();

        $monthAttendances = \App\Models\Attendance::where('user_id', $user->id)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->get();

        $officeLocation = \App\Models\OfficeLocation::first();

        return Inertia::render('Employee/Dashboard', [
            'employee' => $user,
            'todayAttendance' => $todayAttendance,
            'latestLocation' => $latestLocation,
            'officeLocation' => $officeLocation,
            'monthAttendances' => $monthAttendances,
        ]);
    })->name('dashboard')->middleware(\App\Http\Middleware\CheckBearerToken::class);

    Route::prefix('admin')->name('admin.')->middleware(\App\Http\Middleware\CheckBearerToken::class)->group(function () {

        Route::resource('employees', \App\Http\Controllers\Admin\EmployeeController::class);
        
        Route::post('employees/{id}/regularize', [\App\Http\Controllers\Admin\EmployeeController::class, 'regularizeAttendance'])->name('employees.regularize');
        Route::get('employees/{id}/attendance', [\App\Http\Controllers\Admin\EmployeeController::class, 'getAttendanceCalendar'])->name('employees.attendance');
        
        Route::post('office-location', [\App\Http\Controllers\Admin\OfficeLocationController::class, 'store'])->name('office-location.store');
    });

    // Attendance
    Route::post('attendance/punch-in', [\App\Http\Controllers\Employee\AttendanceController::class, 'punchIn'])->name('attendance.punch-in')->middleware(\App\Http\Middleware\CheckBearerToken::class);
    Route::post('attendance/punch-out', [\App\Http\Controllers\Employee\AttendanceController::class, 'punchOut'])->name('attendance.punch-out')->middleware(\App\Http\Middleware\CheckBearerToken::class);

    Route::get('profile', [\App\Http\Controllers\ProfileController::class, 'show'])->name('profile.show');
    Route::post('profile', [\App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update_info');
    Route::post('profile/avatar', [\App\Http\Controllers\ProfileController::class, 'updateAvatar'])->name('profile.update_avatar');
    Route::post('profile/password', [\App\Http\Controllers\ProfileController::class, 'updatePassword'])->name('profile.update_password');
    // Tasks
    Route::get('/tasks', function () {
        return Inertia::render('Tasks/Index');
    })->name('tasks.index')->middleware(\App\Http\Middleware\CheckBearerToken::class);
    
    Route::get('/tasks/create', function () {
        return Inertia::render('Tasks/Create');
    })->name('tasks.create')->middleware(\App\Http\Middleware\CheckBearerToken::class);

    Route::get('/tasks/leaderboard', function () {
        return Inertia::render('Tasks/Leaderboard');
    })->name('tasks.leaderboard')->middleware(\App\Http\Middleware\CheckBearerToken::class);
    
    Route::get('/tasks/{id}', function ($id) {
        return Inertia::render('Tasks/Show', ['taskId' => $id]);
    })->name('tasks.show')->middleware(\App\Http\Middleware\CheckBearerToken::class);

    Route::get('/tasks/{id}/edit', function ($id) {
        return Inertia::render('Tasks/Edit', ['taskId' => $id]);
    })->name('tasks.edit')->middleware(\App\Http\Middleware\CheckBearerToken::class);

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
