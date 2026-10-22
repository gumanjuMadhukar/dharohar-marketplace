<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Auction;
use App\Models\Product;
use App\Services\AuctionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuctionController extends Controller
{
    public function __construct(protected AuctionService $auctionService) {}

    /**
     * Dedicated Auction Hall listing
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'active'); // active, upcoming, ended

        $query = Auction::with(['product.primaryImage', 'store.owner', 'winner'])
            ->withCount('bids');

        if ($status === 'active') {
            $query->where('status', 'active')
                  ->where('starts_at', '<=', now())
                  ->where('ends_at', '>', now());
        } elseif ($status === 'upcoming') {
            $query->where('status', 'upcoming')
                  ->orWhere(function ($q) {
                      $q->where('status', 'active')->where('starts_at', '>', now());
                  });
        } elseif ($status === 'ended') {
            $query->where('status', 'ended')
                  ->orWhere('ends_at', '<=', now());
        }

        $auctions = $query->orderBy('ends_at', 'asc')->paginate(12);

        return response()->json([
            'success' => true,
            'data' => $auctions,
        ]);
    }

    /**
     * Auction detail with live bid history
     */
    public function show(int $id): JsonResponse
    {
        $auction = Auction::with([
            'product.images',
            'store.owner',
            'winner',
            'bids.user' => fn($q) => $q->select('id', 'name', 'avatar')->take(20),
        ])
        ->withCount('bids')
        ->findOrFail($id);

        return response()->json([
            'success' => true,
            'auction' => $auction,
            'min_next_bid' => $auction->current_price + $auction->bid_increment,
        ]);
    }

    /**
     * Place a live bid
     */
    public function bid(Request $request, int $id): JsonResponse
    {
        $auction = Auction::findOrFail($id);
        $user = $request->user();

        $validated = $request->validate([
            'amount' => 'required|numeric|min:' . ($auction->current_price + $auction->bid_increment),
            'max_amount' => 'nullable|numeric|gte:amount',
        ]);

        $bid = $this->auctionService->placeBid(
            $auction,
            $user,
            (float)$validated['amount'],
            isset($validated['max_amount']) ? (float)$validated['max_amount'] : null,
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Bid placed successfully!',
            'bid' => $bid->load('user'),
            'current_price' => $auction->fresh()->current_price,
            'ends_at' => $auction->fresh()->ends_at,
        ]);
    }

    /**
     * Create new auction for a store product
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'starting_price' => 'required|numeric|min:1',
            'reserve_price' => 'nullable|numeric|gte:starting_price',
            'bid_increment' => 'nullable|numeric|min:1',
            'starts_at' => 'required|date|after_or_equal:now',
            'ends_at' => 'required|date|after:starts_at',
            'auto_extend' => 'nullable|boolean',
            'extend_minutes' => 'nullable|integer|min:1',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        // Verify seller owns the product's store
        if ($product->store->user_id !== $user->id && !$user->hasRole('admin')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized product.'], 403);
        }

        $auction = Auction::create([
            'product_id' => $product->id,
            'store_id' => $product->store_id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'starting_price' => $validated['starting_price'],
            'reserve_price' => $validated['reserve_price'] ?? null,
            'current_price' => $validated['starting_price'],
            'bid_increment' => $validated['bid_increment'] ?? 50.00,
            'starts_at' => $validated['starts_at'],
            'ends_at' => $validated['ends_at'],
            'status' => 'active',
            'auto_extend' => $validated['auto_extend'] ?? true,
            'extend_minutes' => $validated['extend_minutes'] ?? 5,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Auction created and live in the Auction Hall!',
            'auction' => $auction->load('product'),
        ], 201);
    }
}
