<?php

namespace App\Events;

use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskBlockedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $task;
    public $assignment;
    public $blockedBy;

    public function __construct(Task $task, TaskAssignment $assignment, User $blockedBy)
    {
        $this->task = $task;
        $this->assignment = $assignment;
        $this->blockedBy = $blockedBy;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('task.' . $this->task->id),
            new PrivateChannel('admin.notifications'),
        ];
    }
    
    public function broadcastWith(): array
    {
        return [
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'blocked_by' => [
                'id' => $this->blockedBy->id,
                'name' => $this->blockedBy->name,
            ],
            'message' => "Task blocked: {$this->task->title} by {$this->blockedBy->name}",
            'action_url' => "/tasks/{$this->task->id}",
            'type' => 'TaskBlocked'
        ];
    }
}
