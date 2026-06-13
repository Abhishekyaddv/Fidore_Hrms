<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaskComment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'task_id',
        'user_id',
        'body',
        'parent_comment_id',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parentComment()
    {
        return $this->belongsTo(TaskComment::class, 'parent_comment_id');
    }

    public function replies()
    {
        return $this->hasMany(TaskComment::class, 'parent_comment_id');
    }

    public function mentions()
    {
        return $this->hasMany(TaskCommentMention::class, 'comment_id');
    }
}
