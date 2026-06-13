<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users', function () {
        return \App\Models\User::select('id', 'name', 'email', 'avatar', 'role')->get();
    });

    // Tasks
    Route::get('/tasks', [\App\Http\Controllers\Api\TaskController::class, 'index']);
    Route::get('/tasks/{task}', [\App\Http\Controllers\Api\TaskController::class, 'show']);
    
    // Admin only task routes
    Route::post('/tasks', [\App\Http\Controllers\Api\TaskController::class, 'store']);
    Route::put('/tasks/{task}', [\App\Http\Controllers\Api\TaskController::class, 'update']);
    Route::delete('/tasks/{task}', [\App\Http\Controllers\Api\TaskController::class, 'destroy']);
    Route::post('/tasks/{task}/extend-deadline', [\App\Http\Controllers\Api\TaskController::class, 'extendDeadline']);
    Route::post('/tasks/{task}/reassign', [\App\Http\Controllers\Api\TaskController::class, 'reassign']);
    Route::post('/tasks/{task}/force-complete', [\App\Http\Controllers\Api\TaskController::class, 'forceComplete']);
    Route::post('/tasks/{task}/archive', [\App\Http\Controllers\Api\TaskController::class, 'archive']);

    // Leaderboard
    Route::get('/leaderboard', [\App\Http\Controllers\Api\LeaderboardController::class, 'index']);

    // Employee assignments
    Route::patch('/tasks/{task}/assignments/{taskAssignment}/status', [\App\Http\Controllers\Api\TaskAssignmentController::class, 'updateStatus']);

    // Subtasks
    Route::patch('/tasks/{task}/subtasks/{subtask}/toggle', [\App\Http\Controllers\Api\SubtaskController::class, 'toggle']);

    // Comments
    Route::post('/tasks/{task}/comments', [\App\Http\Controllers\Api\TaskCommentController::class, 'store']);
    Route::put('/tasks/{task}/comments/{taskComment}', [\App\Http\Controllers\Api\TaskCommentController::class, 'update']);
    Route::delete('/tasks/{task}/comments/{taskComment}', [\App\Http\Controllers\Api\TaskCommentController::class, 'destroy']);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [\App\Http\Controllers\Api\NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
});
