<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Enums\Casts\UserStatus;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasRoles, SoftDeletes;
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */

    protected $fillable = [
        'name',
        'phone',
        'phone_verified_at',
        'password',
        'status',
        'is_admin',
        'slug',
        'last_activity_at',
        'last_login_at',
        'avatar'
    ];
    protected function casts(): array
    {
        return [
            'phone_verified_at' => 'datetime',
            'last_activity_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'status' => UserStatus::class,
            'is_admin' => 'bool'
        ];
    }
    protected $attributes = [
        'is_admin' => false,
        'status' => UserStatus::PENDING->value,
    ];
    public function isOnline(): bool
    {
        return Cache::has('user-is-online-' . $this->id);
    }

    public function lastActivity(): ?string
    {
        return Cache::get('user-is-online-' . $this->id);
    }
    public function avatarBig(): string
    {
        return Storage::url($this->avatar);
    }

    public function avatar(): string
    {
        // If the user doesn't have avatar, we will return default avatar
        if (empty($this->avatar)) {
            return asset('img/avatar.png');
        }

        if (Storage::exists('thumbnails/' . $this->avatar)) {
            return Storage::url('thumbnails/' . $this->avatar);
        } else {
            return $this->avatarBig();
        }
    }
}
