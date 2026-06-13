<?php

namespace App\Events;

use App\Models\TaskComment;
use App\Models\Task;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskCommentAddedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $comment;
    public $task;
    public $mentionUserIds;

    public function __construct(TaskComment $comment, Task $task, array $mentionUserIds = [])
    {
        $this->comment = $comment;
        $this->task = $task;
        $this->mentionUserIds = $mentionUserIds;
    }

    public function broadcastOn(): array
    {
        $channels = [new PrivateChannel('task.' . $this->task->id)];
        
        foreach ($this->mentionUserIds as $userId) {
            $channels[] = new PrivateChannel('user.' . $userId);
        }
        
        return $channels;
    }
    
    public function broadcastWith(): array
    {
        $user = $this->comment->user;
        return [
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'comment_id' => $this->comment->id,
            'author' => [
                'id' => $user->id,
                'name' => $user->name,
            ],
            'message' => "{$user->name} commented on task: {$this->task->title}",
            'action_url' => "/tasks/{$this->task->id}#comment-{$this->comment->id}",
            'type' => 'TaskCommentAdded'
        ];
    }
}
