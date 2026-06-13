<?php

namespace App\Policies;

use App\Models\TaskAssignment;
use App\Models\User;

class TaskAssignmentPolicy
{
    public function updateStatus(User $user, TaskAssignment $taskAssignment): bool
    {
        return $user->id === $taskAssignment->user_id || $user->hasAdminAccess();
    }
}
