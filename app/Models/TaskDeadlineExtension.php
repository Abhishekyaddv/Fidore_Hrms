<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskDeadlineExtension extends Model
{
    protected $fillable = [
        'task_id',
        'extended_by',
        'old_deadline',
        'new_deadline',
        'reason',
    ];

    protected $casts = [
        'old_deadline' => 'datetime',
        'new_deadline' => 'datetime',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function extendedBy()
    {
        return $this->belongsTo(User::class, 'extended_by');
    }
}
