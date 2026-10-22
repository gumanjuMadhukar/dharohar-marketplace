<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Auction extends Model
{
    protected $fillable = [
        'product_id',
        'store_id',
        'title',
        'description',
        'starting_price',
        'reserve_price',
        'current_price',
        'bid_increment',
        'starts_at',
        'ends_at',
        'status',
        'winner_id',
        'auto_extend',
        'extend_minutes',
    ];

    protected function casts(): array
    {
        return [
            'starting_price' => 'decimal:2',
            'reserve_price' => 'decimal:2',
            'current_price' => 'decimal:2',
            'bid_increment' => 'decimal:2',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'auto_extend' => 'boolean',
            'extend_minutes' => 'integer',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('status', 'upcoming');
    }

    public function scopeEnded($query)
    {
        return $query->where('status', 'ended');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'winner_id');
    }

    public function bids(): HasMany
    {
        return $this->hasMany(Bid::class)->orderBy('amount', 'desc');
    }

    public function latestBid()
    {
        return $this->hasOne(Bid::class)->latestOfMany();
    }
}
