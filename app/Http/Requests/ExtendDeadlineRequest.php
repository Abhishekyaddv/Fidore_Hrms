<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExtendDeadlineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('extendDeadline', $this->route('task'));
    }

    public function rules(): array
    {
        return [
            'new_deadline' => 'required|date|after:now',
            'reason' => 'required|string',
        ];
    }
}
