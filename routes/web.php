<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('Employee/Dashboard');
    })->name('dashboard');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', function () {
            // Check basic role manually for now since strict middleware is coming later
            if (request()->user()?->role !== 'superadmin' && request()->user()?->role !== 'admin') {
                abort(403);
            }
            return Inertia::render('Admin/Dashboard');
        })->name('dashboard');

        Route::resource('designations', \App\Http\Controllers\Admin\DesignationController::class);
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
