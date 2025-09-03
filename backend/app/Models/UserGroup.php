<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserGroup extends Model
{
    use HasFactory;

    protected $table = 'user_group';

    protected $fillable = [
        'name',
        'description'
    ];

    /**
     * Get the users that belong to this group
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'group_members', 'user_group_id', 'user_id')
                    ->withTimestamps();
    }

    /**
     * Get the number of users in this group
     */
    public function getUserCountAttribute()
    {
        return $this->users()->count();
    }
}
