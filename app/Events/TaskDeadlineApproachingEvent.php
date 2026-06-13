<?php

namespace App\Events;

use App\Models\Task;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskDeadlineApproachingEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $task;
    public $assigneeIds;

    public function __construct(Task $task, array $assigneeIds)
    {
        $this->task = $task;
        $this->assigneeIds = $assigneeIds;
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
            'deadline' => $this->task->deadline->toIso8601String(),
            'message' => "Deadline approaching for task: {$this->task->title}",
            'action_url' => "/tasks/{$this->task->id}",
            'type' => 'TaskDeadlineApproaching'
        ];
    }
}
