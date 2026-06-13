<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReassignTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('reassign', $this->route('task'));
    }

    public function rules(): array
    {
        return [
            'old_user_id' => 'required|exists:users,id',
            'new_user_id' => 'required|exists:users,id',
            'reason' => 'nullable|string',
        ];
    }
}
