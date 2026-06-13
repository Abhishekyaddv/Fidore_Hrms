<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'dob',
        'gender',
        'phone',
        'employee_id',
        'joining_date',
        'employment_type',
        'bio',
        'avatar',
        'emergency_contact',
        'reporting_manager_id',
    ];

    /**
     * Check if the user is a superadmin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'superadmin';
    }

    /**
     * Check if the user has administrative/HR access.
     */
    public function hasAdminAccess(): bool
    {
        return $this->role === 'superadmin' || $this->role === 'hr';
    }

    /**
     * Get the reporting manager of the user.
     */
    public function reportingManager()
    {
        return $this->belongsTo(User::class, 'reporting_manager_id');
    }

    /**
     * Get the attendances of the user.
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function subtasks()
    {
        return $this->hasMany(Subtask::class);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
