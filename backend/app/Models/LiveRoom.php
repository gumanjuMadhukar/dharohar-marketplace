<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LiveRoom extends Model
{
    use HasFactory;

    protected $fillable = [
        'host_id',
        'store_id',
        'title',
        'slug',
        'description',
        'category',
        'cover_image',
        'stream_url',
        'stream_key',
        'status',
        'current_lot_id',
        'viewer_count',
        'likes_count',
        'shares_count',
        'chat_enabled',
        'slow_mode_seconds',
        'scheduled_at',
        'started_at',
        'ended_at',
    ];

    protected function casts(): array
    {
        return [
            'chat_enabled' => 'boolean',
            'viewer_count' => 'integer',
            'likes_count' => 'integer',
            'shares_count' => 'integer',
            'slow_mode_seconds' => 'integer',
            'scheduled_at' => 'datetime',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function lots(): HasMany
    {
        return $this->hasMany(LiveLot::class)->orderBy('lot_number');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(LiveMessage::class)->latest();
    }

    public function currentLot(): BelongsTo
    {
        return $this->belongsTo(LiveLot::class, 'current_lot_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'live');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('status', 'scheduled');
    }
}
