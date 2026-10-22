<?php

namespace Modules\Auction\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Auction;
use App\Services\AuctionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuctionController extends Controller
{
    public function __construct(protected AuctionService $auctionService) {}

    public function index(): JsonResponse
    {
        $auctions = Auction::with(['product.primaryImage', 'store.owner', 'winner'])
            ->withCount('bids')
            ->where('status', 'active')
            ->orderBy('ends_at', 'asc')
            ->paginate(12);

        return response()->json(['success' => true, 'data' => $auctions]);
    }

    public function show(int $id): JsonResponse
    {
        $auction = Auction::with(['product.images', 'store.owner', 'bids.user'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'auction' => $auction,
            'min_next_bid' => $auction->current_price + $auction->bid_increment,
        ]);
    }

    public function bid(Request $request, int $id): JsonResponse
    {
        $auction = Auction::findOrFail($id);
        $validated = $request->validate([
            'amount' => 'required|numeric|min:' . ($auction->current_price + $auction->bid_increment),
            'max_amount' => 'nullable|numeric|gte:amount',
        ]);

        $bid = $this->auctionService->placeBid(
            $auction,
            $request->user(),
            (float)$validated['amount'],
            isset($validated['max_amount']) ? (float)$validated['max_amount'] : null,
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Bid placed successfully!',
            'bid' => $bid,
            'current_price' => $auction->fresh()->current_price,
        ]);
    }
}
