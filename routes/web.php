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
            return redirect()->route('admin.dashboard');
        }

        $user->load('designation');
        return Inertia::render('Employee/Dashboard', [
            'employee' => $user,
        ]);
    })->name('dashboard');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', function () {
            // Check basic role manually for now since strict middleware is coming later
            if (!request()->user()?->hasAdminAccess()) {
                abort(403);
            }

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
        })->name('dashboard');

        Route::resource('designations', \App\Http\Controllers\Admin\DesignationController::class);
        Route::resource('employees', \App\Http\Controllers\Admin\EmployeeController::class);
    });

    Route::get('profile', [\App\Http\Controllers\ProfileController::class, 'show'])->name('profile.show');
    Route::post('profile', [\App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update_info');
    Route::post('profile/avatar', [\App\Http\Controllers\ProfileController::class, 'updateAvatar'])->name('profile.update_avatar');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
