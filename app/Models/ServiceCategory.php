<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ServiceCategory extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'icon',
        'color',
        'min_price',
        'max_price',
        'suggested_duration',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'min_price' => 'integer',
        'max_price' => 'integer',
        'suggested_duration' => 'integer',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'image_url',
        'services_count',
    ];

    // ============================================
    // Boot
    // ============================================

    protected static function booted(): void
    {
        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = static::generateUniqueSlug($category->name);
            }
        });
    }

    protected static function generateUniqueSlug(string $name): string
    {
        $slug = Str::slug($name);
        $original = $slug;
        $counter = 1;

        while (static::where('slug', $slug)->exists()) {
            $slug = "{$original}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    // ============================================
    // Relationships
    // ============================================

    /**
     * خدمات آرایشگران که از این دسته‌بندی استفاده می‌کنند
     */
    public function services()
    {
        return $this->hasMany(Service::class, 'category_id');
    }

    /**
     * فقط خدمات فعال
     */
    public function activeServices()
    {
        return $this->services()->where('is_active', true);
    }

    // ============================================
    // Scopes
    // ============================================

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    // ============================================
    // Accessors
    // ============================================

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }

        return asset('storage/' . $this->image);
    }

    public function getServicesCountAttribute(): int
    {
        if (array_key_exists('services_count', $this->attributes)) {
            return (int) $this->attributes['services_count'];
        }

        return $this->activeServices()->count();
    }
}
