<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('taskComment'));
    }

    public function rules(): array
    {
        return [
            'body' => 'required|string',
        ];
    }
}
