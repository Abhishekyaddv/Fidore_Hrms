<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'priority' => $this->priority,
            'status' => $this->status,
            'completion_mode' => $this->completion_mode,
            'deadline' => $this->deadline,
            'is_recurring' => $this->is_recurring,
            'recurrence_rule' => $this->recurrence_rule,
            'created_by' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                ];
            }),
            'assignments' => TaskAssignmentResource::collection($this->whenLoaded('assignments')),
            'subtasks' => $this->whenLoaded('employeeSubtasks'),
            'comments' => TaskCommentResource::collection($this->whenLoaded('comments')),
            'activity_logs' => $this->whenLoaded('activityLogs'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
