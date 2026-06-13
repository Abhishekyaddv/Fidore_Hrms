<?php

namespace App\Helpers;

use App\Models\TaskActivityLog;

class ActivityLogger
{
    public const ACTION_CREATED = 'task_created';
    public const ACTION_STATUS_CHANGED = 'status_changed';
    public const ACTION_ASSIGNED = 'assigned';
    public const ACTION_REASSIGNED = 'reassigned';
    public const ACTION_COMMENT_ADDED = 'comment_added';
    public const ACTION_DEADLINE_EXTENDED = 'deadline_extended';
    public const ACTION_ARCHIVED = 'archived';
    
    public static function log($taskId, $userId, $action, $description, $oldValue = null, $newValue = null)
    {
        return TaskActivityLog::create([
            'task_id' => $taskId,
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'old_value' => $oldValue,
            'new_value' => $newValue,
        ]);
    }
}
