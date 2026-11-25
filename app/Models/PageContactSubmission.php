<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class PageContactSubmission extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'email',
        'subject',
        'message',
        'status',
        'ip_address',
    ];

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeNew(Builder $query): Builder
    {
        return $query->where('status', 'new');
    }

    public function scopeUnread(Builder $query): Builder
    {
        return $query->whereIn('status', ['new']);
    }
}
