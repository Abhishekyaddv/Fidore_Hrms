<?php

namespace App\Events;

use App\Models\Task;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskOverdueEvent implements ShouldBroadcast
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
        $channels = array_map(function ($userId) {
            return new PrivateChannel('user.' . $userId);
        }, $this->assigneeIds);
        
        $channels[] = new PrivateChannel('admin.notifications');
        return $channels;
    }
    
    public function broadcastWith(): array
    {
        return [
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'message' => "Task overdue: {$this->task->title}",
            'action_url' => "/tasks/{$this->task->id}",
            'type' => 'TaskOverdue'
        ];
    }
}
