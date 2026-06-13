<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateTaskAssignmentStatusRequest;
use App\Http\Resources\TaskAssignmentResource;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Enums\AssignmentStatus;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TaskAssignmentController extends Controller
{
    use AuthorizesRequests;

    public function updateStatus(UpdateTaskAssignmentStatusRequest $request, Task $task, TaskAssignment $taskAssignment)
    {
        if ($taskAssignment->task_id !== $task->id) {
            abort(404);
        }

        $newStatus = $request->status;

        $updateData = ['status' => $newStatus];

        if ($newStatus === AssignmentStatus::InProgress->value && !$taskAssignment->started_at) {
            $updateData['started_at'] = now();
        }

        if ($newStatus === AssignmentStatus::Completed->value && !$taskAssignment->completed_at) {
            $updateData['completed_at'] = now();
        }

        $taskAssignment->update($updateData);

        return new TaskAssignmentResource($taskAssignment);
    }
}
