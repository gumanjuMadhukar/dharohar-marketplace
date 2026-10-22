<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Store extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'logo',
        'banner',
        'address',
        'city',
        'state',
        'country',
        'phone',
        'email',
        'website',
        'policies',
        'is_verified',
        'is_active',
        'rating',
        'total_sales',
        'commission_rate',
    ];

    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
            'is_active' => 'boolean',
            'rating' => 'decimal:2',
            'total_sales' => 'integer',
            'commission_rate' => 'decimal:2',
        ];
    }

    // ── Scopes ────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    // ── Relationships ─────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function managers(): HasMany
    {
        return $this->hasMany(StoreManager::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function auctions(): HasMany
    {
        return $this->hasMany(Auction::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function followers()
    {
        return $this->belongsToMany(User::class, 'store_followers')
            ->withTimestamps();
    }

    public function coupons(): HasMany
    {
        return $this->hasMany(Coupon::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class);
    }
}

