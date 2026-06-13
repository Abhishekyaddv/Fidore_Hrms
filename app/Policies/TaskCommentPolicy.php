<?php

namespace App\Policies;

use App\Models\TaskComment;
use App\Models\User;
use App\Models\Task;

class TaskCommentPolicy
{
    public function viewAny(User $user, Task $task): bool
    {
        return $user->hasAdminAccess() || $task->assignments()->where('user_id', $user->id)->exists();
    }

    public function create(User $user, Task $task): bool
    {
        return $user->hasAdminAccess() || $task->assignments()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, TaskComment $taskComment): bool
    {
        return $user->id === $taskComment->user_id || $user->hasAdminAccess();
    }

    public function delete(User $user, TaskComment $taskComment): bool
    {
        return $user->id === $taskComment->user_id || $user->hasAdminAccess();
    }
}
