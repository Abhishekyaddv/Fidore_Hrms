<?php

namespace App\Http\Requests;

use App\Enums\CompletionMode;
use App\Enums\TaskPriority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Task::class);
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => ['required', new Enum(TaskPriority::class)],
            'completion_mode' => ['required', new Enum(CompletionMode::class)],
            'deadline' => 'nullable|date|after:now',
            'is_recurring' => 'boolean',
            'recurrence_rule' => 'nullable|string',
            'parent_task_id' => 'nullable|exists:tasks,id',
            'assignees' => 'required|array|min:1',
            'assignees.*' => 'exists:users,id',
            'subtasks' => 'nullable|array',
            'subtasks.*.user_id' => 'required|exists:users,id',
            'subtasks.*.title' => 'required|string|max:255',
        ];
    }
}
