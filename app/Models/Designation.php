<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Designation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'role',
    ];

    /**
     * Get the users associated with the designation.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
