<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Get active cart with items
     */
    public function index(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);

        $cart->load([
            'items.product.primaryImage',
            'items.product.store',
            'items.variant',
        ]);

        return response()->json([
            'success' => true,
            'cart' => $cart,
        ]);
    }

    /**
     * Add item to cart
     */
    public function addItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::with('activeAuction')->findOrFail($validated['product_id']);
        if ($product->is_in_active_auction && $product->activeAuction) {
            return response()->json([
                'success' => false,
                'message' => 'This heritage artifact is currently featured in an active live auction. Fixed-price direct purchase is locked while live bidding is in progress.',
                'auction_id' => $product->activeAuction->id,
            ], 422);
        }

        $cart = $this->getOrCreateCart($request);

        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $validated['product_id'])
            ->where('product_variant_id', $validated['product_variant_id'] ?? null)
            ->first();

        if ($cartItem) {
            $cartItem->increment('quantity', $validated['quantity']);
        } else {
            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $validated['product_id'],
                'product_variant_id' => $validated['product_variant_id'] ?? null,
                'quantity' => $validated['quantity'],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart.',
            'item' => $cartItem->load(['product.primaryImage', 'variant']),
        ]);
    }

    /**
     * Update quantity of cart item
     */
    public function updateItem(Request $request, int $itemId): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = $this->getOrCreateCart($request);
        $item = CartItem::where('cart_id', $cart->id)->findOrFail($itemId);

        $item->update(['quantity' => $validated['quantity']]);

        return response()->json([
            'success' => true,
            'message' => 'Cart updated.',
            'item' => $item,
        ]);
    }

    /**
     * Remove item from cart
     */
    public function removeItem(Request $request, int $itemId): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);
        $item = CartItem::where('cart_id', $cart->id)->findOrFail($itemId);
        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart.',
        ]);
    }

    /**
     * Clear all items in cart
     */
    public function clear(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);
        $cart->items()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared.',
        ]);
    }

    protected function getOrCreateCart(Request $request): Cart
    {
        $user = $request->user();
        if ($user) {
            return Cart::firstOrCreate(['user_id' => $user->id]);
        }

        $sessionId = $request->header('X-Session-Id') ?: $request->cookie('cart_session_id') ?: session()->getId();
        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }
}
