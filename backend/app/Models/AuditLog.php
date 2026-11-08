<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role',
        'action',
        'entity_type',
        'entity_id',
        'ip_address',
        'user_agent',
        'old_values',
        'new_values',
        'details',
        'hmac_hash',
    ];

    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper to log system events with cryptographic integrity check.
     */
    public static function logEvent(
        string $action,
        ?User $user = null,
        ?string $entityType = null,
        ?int $entityId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $details = null
    ): self {
        $userId = $user?->id ?? auth()->id();
        $role = $user?->account_type ?? (auth()->user()?->account_type ?? 'system');
        $ip = request()?->ip() ?? '127.0.0.1';
        $agent = request()?->userAgent() ?? 'CLI/System';

        $secret = config('app.key', 'dharohar-secure-key');
        $payload = json_encode([$action, $userId, $entityType, $entityId, $details]);
        $hash = hash_hmac('sha256', $payload, $secret);

        return self::create([
            'user_id' => $userId,
            'role' => $role,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'ip_address' => $ip,
            'user_agent' => substr($agent, 0, 500),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'details' => $details,
            'hmac_hash' => $hash,
        ]);
    }
}
