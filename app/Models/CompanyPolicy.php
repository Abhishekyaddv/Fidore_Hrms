<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CompanyPolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'category',
        'status',
        'audience',
        'document_path',
        'icon',
    ];
}
