<?php

namespace App\Http\Requests;

use App\Enums\CompletionMode;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('task'));
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'priority' => ['sometimes', new Enum(TaskPriority::class)],
            'status' => ['sometimes', new Enum(TaskStatus::class)],
            'completion_mode' => ['sometimes', new Enum(CompletionMode::class)],
            'deadline' => 'nullable|date',
            'is_recurring' => 'boolean',
            'recurrence_rule' => 'nullable|string',
            'assignees' => 'nullable|array',
            'assignees.*' => 'exists:users,id',
        ];
    }
}
