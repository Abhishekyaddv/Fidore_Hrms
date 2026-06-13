<?php

namespace App\Events;

use App\Models\Task;
use App\Models\TaskAssignment;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskStatusChangedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $task;
    public $assignment;
    public $oldStatus;
    public $newStatus;

    public function __construct(Task $task, ?TaskAssignment $assignment, $oldStatus, $newStatus)
    {
        $this->task = $task;
        $this->assignment = $assignment;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('task.' . $this->task->id),
        ];
    }
    
    public function broadcastWith(): array
    {
        return [
            'task_id' => $this->task->id,
            'assignment_id' => $this->assignment ? $this->assignment->id : null,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'type' => 'TaskStatusChanged'
        ];
    }
}
