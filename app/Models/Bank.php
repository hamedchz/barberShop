<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bank extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'code',
        'icon',
        'color',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active'  => 'bool',
        'sort_order' => 'int',
    ];

    // ============================================
    // Scopeها
    // ============================================

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * جستجوی بانکها (برای Select2 AJAX)
     */
    public static function search(?string $search = null, int $limit = 50): array
    {
        $query = static::active()->ordered();

        if ($search && trim($search)) {
            $query->where('name', 'like', "%{$search}%");
        }

        return $query->limit($limit)->get()->map(fn($b) => [
            'id'    => $b->id,
            'name'  => $b->name,
            'slug'  => $b->slug,
            'icon'  => $b->icon ? asset('storage/' . $b->icon) : null,
        ])->toArray();
    }

    // ============================================
    // دسترسی سریع
    // ============================================

    public static function getActiveList(): array
    {
        return static::active()
            ->ordered()
            ->get()
            ->map(fn($b) => [
                'id'    => $b->id,
                'name'  => $b->name,
                'slug'  => $b->slug,
                'code'  => $b->code,
                'icon'  => $b->icon ? asset('storage/' . $b->icon) : null,
                'color' => $b->color,
            ])
            ->toArray();
    }
}
