<?php

namespace App\Events;

use App\Models\Task;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskCompletedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $task;
    public $completedBy;

    public function __construct(Task $task, ?User $completedBy)
    {
        $this->task = $task;
        $this->completedBy = $completedBy;
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
            'completed_by' => $this->completedBy ? [
                'id' => $this->completedBy->id,
                'name' => $this->completedBy->name,
            ] : null,
            'message' => "Task completed: {$this->task->title}",
            'action_url' => "/tasks/{$this->task->id}",
            'type' => 'TaskCompleted'
        ];
    }
}
