<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('task.{taskId}', function ($user, $taskId) {
    return $user->hasAdminAccess() || $user->taskAssignments()->where('task_id', $taskId)->exists();
});

Broadcast::channel('admin.notifications', function ($user) {
    return $user->hasAdminAccess();
});
