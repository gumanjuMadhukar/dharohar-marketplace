<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\LiveLot;
use App\Models\LiveMessage;
use App\Models\LiveRoom;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LiveRoomController extends Controller
{
    /**
     * List all live and scheduled streaming rooms.
     */
    public function index(Request $request)
    {
        $query = LiveRoom::with(['host:id,name,avatar,account_type', 'store:id,name,slug,logo,city', 'currentLot.highestBidder:id,name,avatar'])
            ->withCount('lots');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $rooms = $query->orderByRaw("CASE WHEN status = 'live' THEN 1 WHEN status = 'scheduled' THEN 2 ELSE 3 END")
            ->latest('started_at')
            ->paginate($request->input('per_page', 12));

        return response()->json([
            'success' => true,
            'rooms' => $rooms,
        ]);
    }

    /**
     * Get full details of a specific live room.
     */
    public function show(string $slugOrId)
    {
        $room = LiveRoom::with([
            'host:id,name,avatar,account_type,bio',
            'store:id,name,slug,logo,city,rating',
            'currentLot.highestBidder:id,name,avatar',
            'lots' => fn($q) => $q->with('highestBidder:id,name,avatar')->orderBy('lot_number'),
            'messages' => fn($q) => $q->latest()->limit(60),
        ])->where('id', $slugOrId)->orWhere('slug', $slugOrId)->firstOrFail();

        // Increment viewer counter
        $room->increment('viewer_count');

        // Reverse messages so newest are at the bottom of the feed
        $messages = $room->messages->reverse()->values();

        return response()->json([
            'success' => true,
            'room' => $room,
            'messages' => $messages,
        ]);
    }

    /**
     * Create a new live broadcast room.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'cover_image' => 'nullable|string',
            'stream_url' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
            'store_id' => 'nullable|exists:stores,id',
        ]);

        $user = $request->user();

        $room = LiveRoom::create([
            'host_id' => $user->id,
            'store_id' => $validated['store_id'] ?? $user->stores()->first()?->id,
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . Str::random(5),
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? 'Heritage Craft',
            'cover_image' => $validated['cover_image'] ?? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
            'stream_url' => $validated['stream_url'] ?? null,
            'stream_key' => 'live_' . Str::random(24),
            'status' => $request->boolean('start_now') ? 'live' : 'scheduled',
            'started_at' => $request->boolean('start_now') ? now() : null,
            'scheduled_at' => $validated['scheduled_at'] ?? now(),
        ]);

        AuditLog::logEvent(
            action: 'LIVE_ROOM_CREATED',
            user: $user,
            entityType: 'LiveRoom',
            entityId: $room->id,
            details: "Live room '{$room->title}' created with status {$room->status}."
        );

        return response()->json([
            'success' => true,
            'message' => 'Live room created successfully.',
            'room' => $room,
        ], 201);
    }

    /**
     * Update room status (live, paused, ended).
     */
    public function updateStatus(Request $request, int $id)
    {
        $room = LiveRoom::findOrFail($id);
        $user = $request->user();

        // Check permission (host, staff, admin)
        if ($room->host_id !== $user->id && !in_array($user->account_type, ['admin', 'staff'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized to update this stream.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:scheduled,live,paused,ended',
        ]);

        $oldStatus = $room->status;
        $room->status = $validated['status'];

        if ($validated['status'] === 'live' && !$room->started_at) {
            $room->started_at = now();
        } elseif ($validated['status'] === 'ended') {
            $room->ended_at = now();
        }

        $room->save();

        AuditLog::logEvent(
            action: 'STREAM_STATUS_CHANGED',
            user: $user,
            entityType: 'LiveRoom',
            entityId: $room->id,
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => $room->status],
            details: "Stream status transitioned from {$oldStatus} to {$room->status}."
        );

        return response()->json([
            'success' => true,
            'message' => "Live room is now {$room->status}.",
            'room' => $room,
        ]);
    }

    /**
     * Add auction lot to a room.
     */
    public function addLot(Request $request, int $roomId)
    {
        $room = LiveRoom::findOrFail($roomId);
        $user = $request->user();

        if ($room->host_id !== $user->id && !in_array($user->account_type, ['admin', 'staff'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'product_id' => 'nullable|exists:products,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'starting_price' => 'required|numeric|min:1',
            'reserve_price' => 'nullable|numeric|gte:starting_price',
            'bid_increment' => 'nullable|numeric|min:10',
        ]);

        $nextNumber = ($room->lots()->max('lot_number') ?? 0) + 1;

        $lot = LiveLot::create([
            'live_room_id' => $room->id,
            'product_id' => $validated['product_id'] ?? null,
            'lot_number' => $nextNumber,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'image_url' => $validated['image_url'] ?? null,
            'starting_price' => $validated['starting_price'],
            'current_price' => $validated['starting_price'],
            'reserve_price' => $validated['reserve_price'] ?? null,
            'bid_increment' => $validated['bid_increment'] ?? 500,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => "Lot #{$lot->lot_number} added successfully.",
            'lot' => $lot,
        ], 201);
    }

    /**
     * Activate a lot as the current live bidding item.
     */
    public function activateLot(Request $request, int $roomId, int $lotId)
    {
        $room = LiveRoom::findOrFail($roomId);
        $user = $request->user();

        if ($room->host_id !== $user->id && !in_array($user->account_type, ['admin', 'staff'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $lot = LiveLot::where('live_room_id', $room->id)->findOrFail($lotId);

        // Deactivate previous active lot if any
        LiveLot::where('live_room_id', $room->id)
            ->where('status', 'active')
            ->update(['status' => 'pending']);

        $lot->update([
            'status' => 'active',
            'ends_at' => now()->addMinutes(3),
        ]);

        $room->update(['current_lot_id' => $lot->id]);

        // Send system announcement
        LiveMessage::create([
            'live_room_id' => $room->id,
            'user_name' => 'Dharohar Live Auctioneer',
            'user_role' => 'admin',
            'message' => "🔔 Lot #{$lot->lot_number}: '{$lot->title}' is now ON THE FLOOR! Starting at Rs. " . number_format($lot->starting_price),
            'badge' => 'Auctioneer',
            'is_system' => true,
        ]);

        AuditLog::logEvent(
            action: 'LOT_ACTIVATED',
            user: $user,
            entityType: 'LiveLot',
            entityId: $lot->id,
            details: "Lot #{$lot->lot_number} activated with floor price Rs. {$lot->starting_price}."
        );

        return response()->json([
            'success' => true,
            'message' => "Lot #{$lot->lot_number} is now active.",
            'lot' => $lot->load('highestBidder'),
        ]);
    }

    /**
     * Place a live real-time bid with concurrency safeguard and anti-sniping extension.
     */
    public function bid(Request $request, int $roomId)
    {
        $room = LiveRoom::findOrFail($roomId);
        $user = $request->user();

        if ($room->status !== 'live') {
            return response()->json(['success' => false, 'message' => 'Live bidding is only open when stream is active.'], 422);
        }

        $currentLot = $room->currentLot;
        if (!$currentLot || $currentLot->status !== 'active') {
            return response()->json(['success' => false, 'message' => 'No active lot on the floor right now.'], 422);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        $bidAmount = (float) $validated['amount'];

        // DB Transaction with lock to prevent race conditions
        $result = DB::transaction(function () use ($currentLot, $user, $bidAmount, $room) {
            $lockedLot = LiveLot::where('id', $currentLot->id)->lockForUpdate()->first();

            $minAllowed = (float) $lockedLot->current_price + (float) $lockedLot->bid_increment;

            // If it's the very first bid and no bidder yet, starting price is accepted
            if (!$lockedLot->highest_bidder_id && $bidAmount >= (float) $lockedLot->starting_price) {
                $minAllowed = (float) $lockedLot->starting_price;
            }

            if ($bidAmount < $minAllowed) {
                return [
                    'success' => false,
                    'message' => "Bid too low. Minimum allowed bid is Rs. " . number_format($minAllowed),
                ];
            }

            if ($lockedLot->highest_bidder_id === $user->id) {
                return [
                    'success' => false,
                    'message' => 'You are already holding the highest bid!',
                ];
            }

            // Anti-sniping: extend clock if less than 60 seconds remaining
            $extended = false;
            if ($lockedLot->ends_at && now()->diffInSeconds($lockedLot->ends_at, false) < 60) {
                $lockedLot->ends_at = now()->addSeconds(120);
                $extended = true;
            }

            $lockedLot->current_price = $bidAmount;
            $lockedLot->highest_bidder_id = $user->id;
            $lockedLot->save();

            // Create broadcast message
            LiveMessage::create([
                'live_room_id' => $room->id,
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_role' => $user->account_type,
                'message' => "⚡ Placed high bid of Rs. " . number_format($bidAmount) . ($extended ? " (Anti-sniping +2m clock extension!)" : ""),
                'badge' => 'High Bidder',
                'is_system' => false,
            ]);

            return [
                'success' => true,
                'message' => 'Bid placed successfully!',
                'lot' => $lockedLot->fresh(['highestBidder:id,name,avatar']),
                'extended' => $extended,
            ];
        });

        if (!$result['success']) {
            return response()->json($result, 422);
        }

        AuditLog::logEvent(
            action: 'LIVE_BID_ACCEPTED',
            user: $user,
            entityType: 'LiveLot',
            entityId: $currentLot->id,
            details: "User {$user->name} placed leading bid of Rs. {$bidAmount} on Lot #{$currentLot->lot_number}."
        );

        return response()->json($result);
    }

    /**
     * Hammer down lot / declare SOLD.
     */
    public function hammerLot(Request $request, int $roomId, int $lotId)
    {
        $room = LiveRoom::findOrFail($roomId);
        $user = $request->user();

        if ($room->host_id !== $user->id && !in_array($user->account_type, ['admin', 'staff'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $lot = LiveLot::where('live_room_id', $room->id)->with('highestBidder')->findOrFail($lotId);

        $lot->update(['status' => 'hammered']);

        $winnerName = $lot->highestBidder ? $lot->highestBidder->name : 'Unsold (No bids)';
        $finalPrice = number_format($lot->current_price);

        LiveMessage::create([
            'live_room_id' => $room->id,
            'user_name' => 'Auctioneer Gavel',
            'user_role' => 'admin',
            'message' => "🔨 GAVEL DOWN! Lot #{$lot->lot_number} SOLD to {$winnerName} for Rs. {$finalPrice}! Congratulations! 🎉",
            'badge' => 'SOLD',
            'is_pinned' => true,
            'is_system' => true,
        ]);

        AuditLog::logEvent(
            action: 'LOT_HAMMERED_SOLD',
            user: $user,
            entityType: 'LiveLot',
            entityId: $lot->id,
            details: "Lot #{$lot->lot_number} hammered down to {$winnerName} at Rs. {$lot->current_price}."
        );

        return response()->json([
            'success' => true,
            'message' => "Lot #{$lot->lot_number} hammered down!",
            'lot' => $lot,
        ]);
    }

    /**
     * Pass lot unsold.
     */
    public function passLot(Request $request, int $roomId, int $lotId)
    {
        $room = LiveRoom::findOrFail($roomId);
        $user = $request->user();

        if ($room->host_id !== $user->id && !in_array($user->account_type, ['admin', 'staff'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $lot = LiveLot::where('live_room_id', $room->id)->findOrFail($lotId);
        $lot->update(['status' => 'passed']);

        LiveMessage::create([
            'live_room_id' => $room->id,
            'user_name' => 'Auctioneer Gavel',
            'user_role' => 'admin',
            'message' => "Lot #{$lot->lot_number} has been passed by the auctioneer.",
            'badge' => 'Passed',
            'is_system' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Lot #{$lot->lot_number} passed.",
            'lot' => $lot,
        ]);
    }

    /**
     * Post a chat comment.
     */
    public function sendMessage(Request $request, int $roomId)
    {
        $room = LiveRoom::findOrFail($roomId);
        $user = $request->user();

        if (!$room->chat_enabled && !in_array($user->account_type, ['admin', 'staff', 'seller'])) {
            return response()->json(['success' => false, 'message' => 'Chat is temporarily disabled by host.'], 422);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:400',
        ]);

        // Badge determination
        $badge = match ($user->account_type) {
            'admin' => 'Platform Admin',
            'staff' => 'Moderator',
            'seller' => 'Master Artisan',
            'creator' => 'Heritage Creator',
            'student' => 'Student Creator',
            default => 'Bidder',
        };

        if ($room->host_id === $user->id) {
            $badge = 'Host / Artisan';
        }

        $message = LiveMessage::create([
            'live_room_id' => $room->id,
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_role' => $user->account_type,
            'message' => $validated['message'],
            'badge' => $badge,
        ]);

        return response()->json([
            'success' => true,
            'message' => $message,
        ], 201);
    }

    /**
     * Send reaction / like.
     */
    public function toggleLike(int $roomId)
    {
        $room = LiveRoom::findOrFail($roomId);
        $room->increment('likes_count');

        return response()->json([
            'success' => true,
            'likes_count' => $room->likes_count,
        ]);
    }

    /**
     * Increment share counter.
     */
    public function toggleShare(int $roomId)
    {
        $room = LiveRoom::findOrFail($roomId);
        $room->increment('shares_count');

        return response()->json([
            'success' => true,
            'shares_count' => $room->shares_count,
        ]);
    }

    /**
     * Pin/unpin or delete a message.
     */
    public function moderateMessage(Request $request, int $roomId, int $messageId)
    {
        $room = LiveRoom::findOrFail($roomId);
        $user = $request->user();

        if ($room->host_id !== $user->id && !in_array($user->account_type, ['admin', 'staff'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $message = LiveMessage::where('live_room_id', $room->id)->findOrFail($messageId);

        if ($request->has('pin')) {
            $message->update(['is_pinned' => $request->boolean('pin')]);
        }

        if ($request->has('delete') && $request->boolean('delete')) {
            $message->delete();
            return response()->json(['success' => true, 'message' => 'Message deleted.']);
        }

        return response()->json([
            'success' => true,
            'message' => $message,
        ]);
    }
}
