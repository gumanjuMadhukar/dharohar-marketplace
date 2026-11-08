<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiveMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'live_room_id',
        'user_id',
        'user_name',
        'user_role',
        'message',
        'badge',
        'is_pinned',
        'is_system',
    ];

    protected function casts(): array
    {
        return [
            'is_pinned' => 'boolean',
            'is_system' => 'boolean',
        ];
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(LiveRoom::class, 'live_room_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
