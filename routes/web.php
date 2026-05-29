<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
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

            return Inertia::render('Admin/Dashboard', [
                'designations' => $designations,
                'nextEmployeeId' => $nextEmployeeId,
            ]);
        }

        $user->load('designation');
        return Inertia::render('Employee/Dashboard', [
            'employee' => $user,
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
    });

    // Employee My Leaves
    Route::get('my-leaves', [\App\Http\Controllers\Employee\MyLeavesController::class, 'index'])->name('my-leaves.index')->middleware(\App\Http\Middleware\CheckBearerToken::class);
    Route::post('my-leaves', [\App\Http\Controllers\Employee\MyLeavesController::class, 'store'])->name('my-leaves.store')->middleware(\App\Http\Middleware\CheckBearerToken::class);

    Route::get('profile', [\App\Http\Controllers\ProfileController::class, 'show'])->name('profile.show');
    Route::post('profile', [\App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update_info');
    Route::post('profile/avatar', [\App\Http\Controllers\ProfileController::class, 'updateAvatar'])->name('profile.update_avatar');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
