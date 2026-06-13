<?php

namespace App\Events;

use App\Models\Task;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskAssignedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $task;
    public $assigneeIds;
    public $assignedBy;

    public function __construct(Task $task, array $assigneeIds, User $assignedBy)
    {
        $this->task = $task;
        $this->assigneeIds = $assigneeIds;
        $this->assignedBy = $assignedBy;
    }

    public function broadcastOn(): array
    {
        return array_map(function ($userId) {
            return new PrivateChannel('user.' . $userId);
        }, $this->assigneeIds);
    }
    
    public function broadcastWith(): array
    {
        return [
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'assigned_by' => [
                'id' => $this->assignedBy->id,
                'name' => $this->assignedBy->name,
            ],
            'message' => "You have been assigned to task: {$this->task->title}",
            'action_url' => "/tasks/{$this->task->id}",
            'type' => 'TaskAssigned'
        ];
    }
}
