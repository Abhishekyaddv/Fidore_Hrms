<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subtask;
use App\Models\Task;
use Illuminate\Http\Request;

class SubtaskController extends Controller
{
    public function toggle(Request $request, Task $task, Subtask $subtask)
    {
        // Ensure the subtask belongs to the task
        if ($subtask->task_id !== $task->id) {
            abort(404);
        }

        // Only the assigned user or an admin can toggle the subtask
        if ($request->user()->id !== $subtask->user_id && !$request->user()->hasAdminAccess()) {
            abort(403, 'You are not authorized to update this subtask.');
        }

        $subtask->update([
            'is_completed' => !$subtask->is_completed
        ]);

        return response()->json([
            'message' => 'Subtask toggled successfully',
            'subtask' => $subtask
        ]);
    }
}
