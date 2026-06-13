<?php

namespace App\Models;

use App\Enums\NotificationType;
use Illuminate\Database\Eloquent\Model;

class NotificationPreference extends Model
{
    protected $fillable = [
        'user_id',
        'notification_type',
        'in_app',
        'email',
    ];

    protected $casts = [
        'in_app' => 'boolean',
        'email' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
