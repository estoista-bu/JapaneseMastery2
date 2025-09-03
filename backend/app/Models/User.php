<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
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

    /**
     * Get all stats for the user.
     */
    public function stats(): HasMany
    {
        return $this->hasMany(UserStats::class);
    }

    /**
     * Get stats for a specific content type.
     */
    public function getStatsByContentType(string $contentType): ?UserStats
    {
        return $this->stats()->where('content_type', $contentType)->first();
    }

    /**
     * Get or create stats for a specific content type.
     */
    public function getOrCreateStatsByContentType(string $contentType): UserStats
    {
        return UserStats::getOrCreateStats($this->id, $contentType);
    }

    /**
     * Get the groups that this user belongs to
     */
    public function groups()
    {
        return $this->belongsToMany(UserGroup::class, 'group_members', 'user_id', 'user_group_id')
                    ->withTimestamps();
    }

    /**
     * Get the user's profile
     */
    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }
}
