<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'punch_in',
        'punch_out',
        'minutes_late',
        'punch_history',
        'total_logged_minutes',
        'is_regularized',
        'regularized_by',
    ];

    protected $casts = [
        'date' => 'date',
        'punch_in' => 'datetime',
        'punch_out' => 'datetime',
        'punch_history' => 'array',
        'is_regularized' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
