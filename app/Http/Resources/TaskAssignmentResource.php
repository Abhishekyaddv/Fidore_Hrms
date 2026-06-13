<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'task_id' => $this->task_id,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'avatar' => $this->user->avatar,
                ];
            }),
            'status' => $this->status,
            'assigned_by' => $this->assigned_by,
            'assigned_at' => $this->assigned_at,
            'started_at' => $this->started_at,
            'completed_at' => $this->completed_at,
        ];
    }
}
