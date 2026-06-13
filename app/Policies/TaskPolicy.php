<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAdminAccess();
    }

    public function view(User $user, Task $task): bool
    {
        return $user->hasAdminAccess() || $task->assignments()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->hasAdminAccess();
    }

    public function update(User $user, Task $task): bool
    {
        return $user->hasAdminAccess();
    }

    public function delete(User $user, Task $task): bool
    {
        return $user->hasAdminAccess();
    }

    public function extendDeadline(User $user, Task $task): bool
    {
        return $user->hasAdminAccess();
    }

    public function reassign(User $user, Task $task): bool
    {
        return $user->hasAdminAccess();
    }
}
