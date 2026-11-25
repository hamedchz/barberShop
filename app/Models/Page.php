<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\Casts\PageStatus;

class Page extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'featured_image',
        'status',
        'show_in_header',
        'show_in_footer',
        'header_order',
        'footer_order',
        'seo_title',
        'seo_description',
        'published_at',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'status' => PageStatus::class,
            'published_at' => 'datetime',
            'show_in_header' => 'boolean',
            'show_in_footer' => 'boolean',
            'header_order' => 'integer',
            'footer_order' => 'integer',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function sections(): HasMany
    {
        return $this->hasMany(PageSection::class)
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    public function activeSections(): HasMany
    {
        return $this->hasMany(PageSection::class)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopePublished($query)
    {
        return $query
            ->where('status', PageStatus::PUBLISHED)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }


    public function scopeDraft($query)
    {
        return $query->where('status', PageStatus::DRAFT);
    }

    public function scopeArchived($query)
    {
        return $query->where('status', PageStatus::ARCHIVED);
    }

    public function scopeInHeader(Builder $query): Builder
    {
        return $query
            ->published()
            ->where('show_in_header', true)
            ->orderBy('header_order')
            ->orderBy('id');
    }

    public function scopeInFooter(Builder $query): Builder
    {
        return $query
            ->published()
            ->where('show_in_footer', true)
            ->orderBy('footer_order')
            ->orderBy('id');
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isPublished(): bool
    {
        return $this->status === 'published'
            && $this->published_at !== null
            && $this->published_at->lte(now());
    }
}
