<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\Casts\PageContactSubmissionStatus;

class PageContactSubmission extends Model
{
    protected $fillable = [
        'page_id',
        'user_id',
        'name',
        'phone',
        'email',
        'subject',
        'message',
        'status',
        'admin_note',
        'handled_by',
        'read_at',
        'answered_at',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => PageContactSubmissionStatus::class,
            'read_at' => 'datetime',
            'answered_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function handler(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'handled_by'
        );
    }

    public function scopeNew($query)
    {
        return $query->where('status', PageContactSubmissionStatus::NEW->value);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [
            PageContactSubmissionStatus::NEW->value,
            PageContactSubmissionStatus::READ->value,
            PageContactSubmissionStatus::ANSWERED->value
        ]);
    }

    public function markAsRead(?int $adminId = null): void
    {
        if ($this->status !== PageContactSubmissionStatus::NEW->value) {
            return;
        }

        $this->update([
            'status' => 'read',
            'read_at' => now(),
            'handled_by' => $adminId,
        ]);
    }

    public function markAsAnswered(?int $adminId = null): void
    {
        $this->update([
            'status' => PageContactSubmissionStatus::ANSWERED->value,
            'answered_at' => now(),
            'handled_by' => $adminId,
        ]);
    }

    public function close(?int $adminId = null): void
    {
        $this->update([
            'status' => PageContactSubmissionStatus::CLOSED->value,
            'closed_at' => now(),
            'handled_by' => $adminId,
        ]);
    }
}
