<?php

namespace App\Http\Controllers\Api;

use App\Events\TaskCommentAddedEvent;
use App\Helpers\ActivityLogger;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskCommentRequest;
use App\Http\Requests\UpdateTaskCommentRequest;
use App\Http\Resources\TaskCommentResource;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskCommentMention;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TaskCommentController extends Controller
{
    use AuthorizesRequests;

    public function store(StoreTaskCommentRequest $request, Task $task)
    {
        $comment = TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'body' => $request->body,
            'parent_comment_id' => $request->parent_comment_id,
        ]);

        ActivityLogger::log($task->id, $request->user()->id, ActivityLogger::ACTION_COMMENT_ADDED, 'Added a comment');

        $mentionIds = $request->mentions ?? [];
        foreach ($mentionIds as $mentionId) {
            TaskCommentMention::create([
                'comment_id' => $comment->id,
                'mentioned_user_id' => $mentionId,
            ]);
        }

        event(new TaskCommentAddedEvent($comment, $task, $mentionIds));

        return new TaskCommentResource($comment->load('user'));
    }

    public function update(UpdateTaskCommentRequest $request, Task $task, TaskComment $taskComment)
    {
        if ($taskComment->task_id !== $task->id) abort(404);
        
        $taskComment->update(['body' => $request->body]);
        return new TaskCommentResource($taskComment->load('user'));
    }

    public function destroy(Task $task, TaskComment $taskComment)
    {
        $this->authorize('delete', $taskComment);
        if ($taskComment->task_id !== $task->id) abort(404);
        
        $taskComment->delete();
        return response()->noContent();
    }
}
