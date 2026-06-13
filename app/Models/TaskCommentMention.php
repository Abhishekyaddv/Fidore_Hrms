<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskCommentMention extends Model
{
    protected $fillable = [
        'comment_id',
        'mentioned_user_id',
    ];

    public function comment()
    {
        return $this->belongsTo(TaskComment::class, 'comment_id');
    }

    public function mentionedUser()
    {
        return $this->belongsTo(User::class, 'mentioned_user_id');
    }
}
