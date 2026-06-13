<?php

namespace App\Observers;

use App\Helpers\ActivityLogger;
use App\Models\Task;
use App\Enums\TaskStatus;
use App\Events\TaskCompletedEvent;

class TaskObserver
{
    public function updated(Task $task): void
    {
        if ($task->isDirty('status')) {
            $oldStatus = $task->getOriginal('status');
            $newStatus = $task->status;
            
            if ($newStatus === TaskStatus::Completed && $oldStatus !== TaskStatus::Completed) {
                // Log activity
                ActivityLogger::log(
                    $task->id,
                    auth()->id(),
                    ActivityLogger::ACTION_STATUS_CHANGED,
                    "Task marked as completed",
                    $oldStatus->value,
                    $newStatus->value
                );
                
                // Fire event
                event(new TaskCompletedEvent($task, auth()->user()));
            }
        }
    }
}
