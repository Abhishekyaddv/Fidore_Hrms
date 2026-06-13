<?php

namespace App\Http\Requests;

use App\Enums\AssignmentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateTaskAssignmentStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('updateStatus', $this->route('taskAssignment'));
    }

    public function rules(): array
    {
        return [
            'status' => ['required', new Enum(AssignmentStatus::class)],
        ];
    }
}
