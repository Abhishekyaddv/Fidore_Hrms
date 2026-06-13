<?php

namespace App\Models;

use App\Enums\CompletionMode;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'priority',
        'status',
        'completion_mode',
        'created_by',
        'deadline',
        'is_recurring',
        'recurrence_rule',
        'parent_task_id',
        'archived_at',
    ];

    protected $casts = [
        'priority' => TaskPriority::class,
        'status' => TaskStatus::class,
        'completion_mode' => CompletionMode::class,
        'deadline' => 'datetime',
        'archived_at' => 'datetime',
        'is_recurring' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignments()
    {
        return $this->hasMany(TaskAssignment::class);
    }

    public function assignees()
    {
        return $this->belongsToMany(User::class, 'task_assignments')->withPivot('status', 'assigned_by', 'assigned_at', 'started_at', 'completed_at', 'removed_at', 'removal_reason')->withTimestamps();
    }

    public function comments()
    {
        return $this->hasMany(TaskComment::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(TaskActivityLog::class);
    }

    public function deadlineExtensions()
    {
        return $this->hasMany(TaskDeadlineExtension::class);
    }

    public function employeeSubtasks()
    {
        return $this->hasMany(Subtask::class);
    }

    public function parentTask()
    {
        return $this->belongsTo(Task::class, 'parent_task_id');
    }

    public function subtasks()
    {
        return $this->hasMany(Task::class, 'parent_task_id');
    }

    public function computeOverallStatus()
    {
        // Don't auto-compute if it's cancelled, overdue, or archived
        if (in_array($this->status, [TaskStatus::Cancelled, TaskStatus::Overdue]) || $this->archived_at) {
            return;
        }

        $assignments = $this->assignments()->where('status', '!=', \App\Enums\AssignmentStatus::Removed)->get();
        
        if ($assignments->isEmpty()) {
            return;
        }

        $completedCount = $assignments->where('status', \App\Enums\AssignmentStatus::Completed)->count();
        $inProgressCount = $assignments->where('status', \App\Enums\AssignmentStatus::InProgress)->count();

        $newStatus = TaskStatus::Pending;

        if ($this->completion_mode === CompletionMode::AnyOneCompletes) {
            if ($completedCount > 0) {
                $newStatus = TaskStatus::Completed;
            } elseif ($inProgressCount > 0) {
                $newStatus = TaskStatus::InProgress;
            }
        } else {
            // AllMustComplete
            if ($completedCount === $assignments->count()) {
                $newStatus = TaskStatus::Completed;
            } elseif ($inProgressCount > 0 || $completedCount > 0) {
                $newStatus = TaskStatus::InProgress;
            }
        }

        if ($this->status !== $newStatus) {
            $this->status = $newStatus;
            $this->save();
        }
    }

    public function isOverdue()
    {
        if ($this->status === TaskStatus::Completed || $this->status === TaskStatus::Cancelled) {
            return false;
        }
        
        return $this->deadline && $this->deadline->isPast();
    }
}
