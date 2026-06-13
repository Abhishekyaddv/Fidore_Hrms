<?php

namespace App\Http\Controllers\Api;

use App\Enums\AssignmentStatus;
use App\Enums\TaskStatus;
use App\Events\TaskAssignedEvent;
use App\Helpers\ActivityLogger;
use App\Http\Controllers\Controller;
use App\Http\Requests\ExtendDeadlineRequest;
use App\Http\Requests\ReassignTaskRequest;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\TaskDeadlineExtension;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $query = Task::with(['creator', 'assignments.user', 'employeeSubtasks.user']);

        if (!$request->user()->hasAdminAccess()) {
            $query->whereHas('assignments', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        return TaskResource::collection($query->latest()->paginate(10));
    }

    public function store(StoreTaskRequest $request)
    {
        $task = Task::create(array_merge(
            $request->validated(),
            ['created_by' => $request->user()->id]
        ));

        ActivityLogger::log($task->id, $request->user()->id, ActivityLogger::ACTION_CREATED, 'Created task: ' . $task->title);

        $assigneeIds = $request->assignees;
        foreach ($assigneeIds as $userId) {
            TaskAssignment::create([
                'task_id' => $task->id,
                'user_id' => $userId,
                'assigned_by' => $request->user()->id,
            ]);
            
            ActivityLogger::log($task->id, $request->user()->id, ActivityLogger::ACTION_ASSIGNED, 'Assigned task to user ID: ' . $userId);
        }

        event(new TaskAssignedEvent($task, $assigneeIds, $request->user()));

        if ($request->has('subtasks') && is_array($request->subtasks)) {
            foreach ($request->subtasks as $subtask) {
                $task->employeeSubtasks()->create([
                    'user_id' => $subtask['user_id'],
                    'title' => $subtask['title'],
                    'is_completed' => false,
                ]);
            }
        }

        return new TaskResource($task->load(['creator', 'assignments.user', 'employeeSubtasks.user']));
    }

    public function show(Task $task)
    {
        $this->authorize('view', $task);
        return new TaskResource($task->load(['creator', 'assignments.user', 'employeeSubtasks.user', 'comments.user', 'comments.replies', 'activityLogs.user']));
    }

    public function update(UpdateTaskRequest $request, Task $task)
    {
        $task->update($request->validated());

        if ($request->has('assignees') && is_array($request->assignees)) {
            $newAssigneeIds = collect($request->assignees);
            $currentAssignments = $task->assignments()->pluck('user_id');
            
            // Users to add
            $usersToAdd = $newAssigneeIds->diff($currentAssignments);
            foreach ($usersToAdd as $userId) {
                TaskAssignment::create([
                    'task_id' => $task->id,
                    'user_id' => $userId,
                    'assigned_by' => $request->user()->id,
                ]);
                ActivityLogger::log($task->id, $request->user()->id, ActivityLogger::ACTION_ASSIGNED, 'Assigned task to user ID: ' . $userId);
            }
            
            // Users to remove
            $usersToRemove = $currentAssignments->diff($newAssigneeIds);
            if ($usersToRemove->isNotEmpty()) {
                $task->assignments()->whereIn('user_id', $usersToRemove)->delete();
                foreach ($usersToRemove as $userId) {
                    ActivityLogger::log($task->id, $request->user()->id, ActivityLogger::ACTION_REMOVED, 'Removed assignment for user ID: ' . $userId);
                }
            }
        }

        return new TaskResource($task->load(['creator', 'assignments.user', 'employeeSubtasks.user']));
    }

    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);
        $task->delete();
        return response()->noContent();
    }

    public function extendDeadline(ExtendDeadlineRequest $request, Task $task)
    {
        $oldDeadline = $task->deadline;
        $task->update(['deadline' => $request->new_deadline]);

        TaskDeadlineExtension::create([
            'task_id' => $task->id,
            'extended_by' => $request->user()->id,
            'old_deadline' => $oldDeadline,
            'new_deadline' => $request->new_deadline,
            'reason' => $request->reason,
        ]);

        ActivityLogger::log($task->id, $request->user()->id, ActivityLogger::ACTION_DEADLINE_EXTENDED, 'Extended deadline to: ' . $request->new_deadline);

        return new TaskResource($task);
    }

    public function reassign(ReassignTaskRequest $request, Task $task)
    {
        $oldAssignment = $task->assignments()->where('user_id', $request->old_user_id)->firstOrFail();
        $oldAssignment->update([
            'status' => AssignmentStatus::Removed,
            'removed_at' => now(),
            'removal_reason' => $request->reason,
        ]);

        TaskAssignment::create([
            'task_id' => $task->id,
            'user_id' => $request->new_user_id,
            'assigned_by' => $request->user()->id,
        ]);

        ActivityLogger::log($task->id, $request->user()->id, ActivityLogger::ACTION_REASSIGNED, "Reassigned from user {$request->old_user_id} to {$request->new_user_id}");

        event(new TaskAssignedEvent($task, [$request->new_user_id], $request->user()));

        return new TaskResource($task->load('assignments.user'));
    }

    public function forceComplete(Request $request, Task $task)
    {
        $this->authorize('update', $task);
        $task->update(['status' => TaskStatus::Completed]);
        return new TaskResource($task);
    }

    public function archive(Request $request, Task $task)
    {
        $this->authorize('delete', $task);
        $task->update(['archived_at' => now()]);
        ActivityLogger::log($task->id, $request->user()->id, ActivityLogger::ACTION_ARCHIVED, 'Task archived');
        return new TaskResource($task);
    }
}
