<?php

namespace App\Observers;

use App\Helpers\ActivityLogger;
use App\Models\TaskAssignment;
use App\Enums\AssignmentStatus;
use App\Events\TaskStatusChangedEvent;

class TaskAssignmentObserver
{
    public function updated(TaskAssignment $assignment): void
    {
        if ($assignment->isDirty('status')) {
            $oldStatus = $assignment->getOriginal('status');
            $newStatus = $assignment->status;
            
            // Log activity
            $description = "Changed assignment status from {$oldStatus->value} to {$newStatus->value}";
            ActivityLogger::log(
                $assignment->task_id, 
                auth()->id() ?? $assignment->user_id, 
                ActivityLogger::ACTION_STATUS_CHANGED, 
                $description, 
                $oldStatus->value, 
                $newStatus->value
            );

            // Compute overall task status
            $assignment->task->computeOverallStatus();

            // Fire event
            event(new TaskStatusChangedEvent($assignment->task, $assignment, $oldStatus->value, $newStatus->value));
        }
    }
}
