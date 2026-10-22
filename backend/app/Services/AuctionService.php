<?php

namespace App\Services;

use App\Models\Auction;
use App\Models\Bid;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuctionService
{
    /**
     * Place a bid on an auction with proxy bidding support
     */
    public function placeBid(Auction $auction, User $user, float $amount, ?float $maxAmount = null, ?string $ip = null): Bid
    {
        return DB::transaction(function () use ($auction, $user, $amount, $maxAmount, $ip) {
            // Lock auction row for concurrent bid safety
            $auction = Auction::lockForUpdate()->find($auction->id);

            // Validation checks
            if ($auction->status !== 'active') {
                throw ValidationException::withMessages(['auction' => 'Auction is not active.']);
            }

            $now = now();
            if ($auction->ends_at && $now->gt($auction->ends_at)) {
                $auction->update(['status' => 'ended']);
                throw ValidationException::withMessages(['auction' => 'This auction has already ended.']);
            }

            if ($auction->store->user_id === $user->id) {
                throw ValidationException::withMessages(['bid' => 'Store owners cannot bid on their own auctions.']);
            }

            $minAllowed = $auction->current_price + $auction->bid_increment;
            if ($amount < $minAllowed) {
                throw ValidationException::withMessages([
                    'amount' => "Bid must be at least NPR " . number_format($minAllowed, 2),
                ]);
            }

            // Create new bid
            $bid = Bid::create([
                'auction_id' => $auction->id,
                'user_id' => $user->id,
                'amount' => $amount,
                'max_amount' => $maxAmount && $maxAmount >= $amount ? $maxAmount : $amount,
                'is_auto' => false,
                'ip_address' => $ip,
            ]);

            // Auto-extend if within last minutes
            $extendTime = $auction->extend_minutes ?: 5;
            if ($auction->auto_extend && $auction->ends_at && $now->diffInMinutes($auction->ends_at, false) < $extendTime) {
                $auction->ends_at = $now->copy()->addMinutes($extendTime);
            }

            // Update current auction price & winner
            $auction->current_price = $amount;
            $auction->winner_id = $user->id;
            $auction->save();

            // Check if another bidder had a higher proxy max_amount
            $competingProxy = Bid::where('auction_id', $auction->id)
                ->where('user_id', '!=', $user->id)
                ->whereNotNull('max_amount')
                ->where('max_amount', '>', $amount)
                ->orderBy('max_amount', 'desc')
                ->first();

            if ($competingProxy) {
                // Outbid immediately via proxy
                $counterBidAmount = min($competingProxy->max_amount, $amount + $auction->bid_increment);

                $autoBid = Bid::create([
                    'auction_id' => $auction->id,
                    'user_id' => $competingProxy->user_id,
                    'amount' => $counterBidAmount,
                    'max_amount' => $competingProxy->max_amount,
                    'is_auto' => true,
                    'ip_address' => 'system_proxy',
                ]);

                $auction->current_price = $counterBidAmount;
                $auction->winner_id = $competingProxy->user_id;
                $auction->save();
            }

            return $bid;
        });
    }

    /**
     * Close an auction and convert winner to Order
     */
    public function closeAuction(Auction $auction): ?Order
    {
        return DB::transaction(function () use ($auction) {
            $auction = Auction::lockForUpdate()->find($auction->id);

            if ($auction->status === 'ended') {
                return null;
            }

            $auction->status = 'ended';
            $highestBid = $auction->bids()->orderBy('amount', 'desc')->first();

            if (!$highestBid) {
                $auction->save();
                return null;
            }

            // Reserve price check
            if ($auction->reserve_price && $highestBid->amount < $auction->reserve_price) {
                $auction->winner_id = null;
                $auction->save();
                return null;
            }

            $auction->winner_id = $highestBid->user_id;
            $auction->save();

            $winner = $highestBid->user;
            $product = $auction->product;

            // Create Order for the winner
            $orderNumber = 'AUCT-' . strtoupper(uniqid());
            $order = Order::create([
                'user_id' => $winner->id,
                'order_number' => $orderNumber,
                'status' => 'pending',
                'subtotal' => $auction->current_price,
                'shipping_cost' => 0,
                'tax' => 0,
                'discount' => 0,
                'total' => $auction->current_price,
                'currency' => 'NPR',
                'payment_method' => 'pending',
                'payment_status' => 'pending',
                'shipping_name' => $winner->name,
                'shipping_email' => $winner->email,
                'shipping_phone' => $winner->phone,
                'notes' => 'Auction win order for ' . $auction->title,
            ]);

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'store_id' => $auction->store_id,
                'name' => 'Auction Win: ' . $auction->title,
                'sku' => $product->sku ?: 'AUCTION-' . $auction->id,
                'price' => $auction->current_price,
                'quantity' => 1,
                'total' => $auction->current_price,
                'status' => 'pending',
            ]);

            return $order;
        });
    }
}
