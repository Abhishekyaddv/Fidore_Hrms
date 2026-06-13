<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', [\App\Models\TaskComment::class, $this->route('task')]);
    }

    public function rules(): array
    {
        return [
            'body' => 'required|string',
            'parent_comment_id' => 'nullable|exists:task_comments,id',
            'mentions' => 'nullable|array',
            'mentions.*' => 'exists:users,id',
        ];
    }
}
