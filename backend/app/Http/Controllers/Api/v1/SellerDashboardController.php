<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Auction;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SellerDashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $storeIds = $user->stores->pluck('id')->toArray();

        $totalRevenue = OrderItem::whereIn('store_id', $storeIds)
            ->whereHas('order', fn($q) => $q->where('payment_status', 'paid'))
            ->sum('total');

        $totalSales = OrderItem::whereIn('store_id', $storeIds)
            ->whereHas('order', fn($q) => $q->where('payment_status', 'paid'))
            ->count();

        $productsCount = Product::whereIn('store_id', $storeIds)->count();
        $lowStockCount = Product::whereIn('store_id', $storeIds)->lowStock()->count();
        $activeAuctionsCount = Auction::whereIn('store_id', $storeIds)->where('status', 'active')->count();

        return response()->json([
            'success' => true,
            'stats' => [
                'total_revenue' => (float)$totalRevenue,
                'total_sales' => $totalSales,
                'products_count' => $productsCount,
                'low_stock_count' => $lowStockCount,
                'active_auctions' => $activeAuctionsCount,
                'commission_rate' => $user->account_type === 'student' ? 3.0 : 10.0,
            ],
        ]);
    }

    public function products(Request $request): JsonResponse
    {
        $user = $request->user();
        $storeIds = $user->stores->pluck('id')->toArray();

        $products = Product::whereIn('store_id', $storeIds)
            ->with(['primaryImage', 'category', 'activeAuction'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    public function orders(Request $request): JsonResponse
    {
        $user = $request->user();
        $storeIds = $user->stores->pluck('id')->toArray();

        $orderItems = OrderItem::whereIn('store_id', $storeIds)
            ->with(['order.user:id,name,email,phone', 'product.primaryImage'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $orderItems,
        ]);
    }

    public function getStore(Request $request): JsonResponse
    {
        $user = $request->user();
        $store = $user->stores()->first();

        if (!$store) {
            $slug = \Illuminate\Support\Str::slug($user->name) . '-' . rand(100, 999);
            $store = \App\Models\Store::create([
                'user_id' => $user->id,
                'name' => $user->name . "'s Studio",
                'slug' => $slug,
                'description' => $user->bio ?? 'Authentic creator and artisan studio on Dharohar.',
                'email' => $user->email,
                'phone' => $user->phone ?? '9800000000',
                'address' => 'Kathmandu Valley',
                'city' => 'Kathmandu',
                'commission_rate' => $user->account_type === 'student' ? 3.0 : 10.0,
                'is_active' => true,
                'is_verified' => false,
            ]);
        }

        return response()->json([
            'success' => true,
            'store' => $store,
        ]);
    }

    public function updateStore(Request $request): JsonResponse
    {
        $user = $request->user();
        $store = $user->stores()->first();

        if (!$store) {
            return response()->json(['success' => false, 'message' => 'Store not found.'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'logo' => 'nullable|string',
            'banner' => 'nullable|string',
            'policies' => 'nullable|string',
        ]);

        $store->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Store profile updated successfully.',
            'store' => $store,
        ]);
    }

    public function updateOrderItemStatus(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $storeIds = $user->stores->pluck('id')->toArray();

        $item = OrderItem::whereIn('store_id', $storeIds)->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
        ]);

        $item->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => "Order item status updated to {$validated['status']}.",
            'item' => $item,
        ]);
    }

    public function updateOrderItemTracking(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $storeIds = $user->stores->pluck('id')->toArray();

        $item = OrderItem::whereIn('store_id', $storeIds)->findOrFail($id);

        $validated = $request->validate([
            'tracking_number' => 'required|string|max:100',
        ]);

        $item->update([
            'tracking_number' => $validated['tracking_number'],
            'status' => in_array($item->status, ['pending', 'processing']) ? 'shipped' : $item->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Courier tracking number attached.',
            'item' => $item,
        ]);
    }

    /**
     * Dedicated Inventory & Stock Management
     */
    public function inventory(Request $request): JsonResponse
    {
        $user = $request->user();
        $storeIds = $user->stores->pluck('id')->toArray();

        $products = Product::whereIn('store_id', $storeIds)
            ->with(['primaryImage', 'category'])
            ->when($request->filled('q'), function ($q) use ($request) {
                $search = $request->query('q');
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('sku', 'ilike', "%{$search}%");
            })
            ->latest()
            ->paginate(15);

        // Append computed stock statuses
        $products->getCollection()->transform(function ($p) {
            $threshold = $p->low_stock_threshold ?? 5;
            $p->stock_status = $p->quantity <= 0 ? 'out_of_stock' : ($p->quantity <= $threshold ? 'low_stock' : 'in_stock');
            $p->inventory_value = (float)($p->price * $p->quantity);
            return $p;
        });

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    public function updateStock(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $storeIds = $user->stores->pluck('id')->toArray();

        $product = Product::whereIn('store_id', $storeIds)->findOrFail($id);

        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'sku' => 'nullable|string|max:100',
            'price' => 'nullable|numeric|min:0',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Stock inventory updated successfully.',
            'product' => $product,
        ]);
    }

    /**
     * Official VAT/PAN Tax Invoice Breakdown
     */
    public function invoice(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $store = $user->stores()->first();
        $storeIds = $user->stores->pluck('id')->toArray();

        $item = OrderItem::whereIn('store_id', $storeIds)
            ->with(['order.user', 'product.primaryImage'])
            ->findOrFail($id);

        $order = $item->order;
        $commissionRate = (float)($store->commission_rate ?? 10.0);
        $taxable = (float)$item->total;
        $vatAmount = round($taxable * 0.13, 2);
        $commissionAmount = round($taxable * ($commissionRate / 100), 2);
        $netPayout = round($taxable - $commissionAmount, 2);

        $invoiceData = [
            'invoice_number' => 'INV-' . strtoupper(substr($store->slug ?? 'DHR', 0, 4)) . '-' . $order->order_number . '-' . $item->id,
            'fiscal_year' => '2081/2082',
            'invoice_date' => $item->created_at->format('Y-m-d H:i:s'),
            'store' => [
                'name' => $store->name ?? 'Artisan Guild',
                'pan_vat' => '601928374',
                'city' => $store->city ?? 'Kathmandu Valley',
                'address' => $store->address ?? 'Heritage Workshop, Nepal',
                'phone' => $store->phone ?? '9841000000',
                'email' => $store->email ?? 'artisan@dharohar.com',
            ],
            'customer' => [
                'name' => $order->shipping_name ?? $order->user->name ?? 'Buyer',
                'email' => $order->shipping_email ?? $order->user->email ?? 'buyer@dharohar.com',
                'phone' => $order->shipping_phone ?? $order->user->phone ?? '9800000000',
                'address' => ($order->shipping_address ?? 'Kathmandu') . ', ' . ($order->shipping_city ?? 'Nepal'),
            ],
            'item' => [
                'name' => $item->name ?? $item->product->name,
                'sku' => $item->sku ?? $item->product->sku ?? 'DHR-ART-01',
                'unit_price' => (float)$item->price,
                'quantity' => $item->quantity,
                'subtotal' => $taxable,
            ],
            'financials' => [
                'taxable_amount' => $taxable,
                'vat_rate' => 13,
                'vat_amount' => $vatAmount,
                'total_bill' => $taxable,
                'platform_commission_rate' => $commissionRate,
                'platform_commission' => $commissionAmount,
                'merchant_net_escrow' => $netPayout,
            ],
            'payment' => [
                'method' => strtoupper($order->payment_method ?? 'ESEWA'),
                'status' => strtoupper($order->payment_status ?? 'PAID'),
                'fulfillment_status' => strtoupper($item->status ?? 'PENDING'),
                'tracking_number' => $item->tracking_number ?? 'DHR-COURIER-PENDING',
            ],
        ];

        return response()->json([
            'success' => true,
            'invoice' => $invoiceData,
        ]);
    }

    /**
     * Store Customer CRM
     */
    public function customers(Request $request): JsonResponse
    {
        $user = $request->user();
        $storeIds = $user->stores->pluck('id')->toArray();

        $orderItems = OrderItem::whereIn('store_id', $storeIds)
            ->with(['order.user'])
            ->get();

        $customerMap = [];
        foreach ($orderItems as $item) {
            $order = $item->order;
            if (!$order) continue;

            $key = $order->shipping_email ?? ($order->user->email ?? 'cust-' . $order->user_id);
            if (!isset($customerMap[$key])) {
                $customerMap[$key] = [
                    'id' => $order->user_id ?? 0,
                    'name' => $order->shipping_name ?? ($order->user->name ?? 'Valued Customer'),
                    'email' => $order->shipping_email ?? ($order->user->email ?? '—'),
                    'phone' => $order->shipping_phone ?? ($order->user->phone ?? '—'),
                    'city' => $order->shipping_city ?? 'Kathmandu',
                    'total_orders' => 0,
                    'total_spent' => 0.0,
                    'last_order_date' => $item->created_at->format('Y-m-d'),
                ];
            }

            $customerMap[$key]['total_orders'] += 1;
            $customerMap[$key]['total_spent'] += (float)$item->total;
        }

        $customers = array_values($customerMap);
        usort($customers, fn($a, $b) => $b['total_spent'] <=> $a['total_spent']);

        return response()->json([
            'success' => true,
            'data' => $customers,
        ]);
    }

    /**
     * Billings & Settlement Financial Overview
     */
    public function billings(Request $request): JsonResponse
    {
        $user = $request->user();
        $store = $user->stores()->first();
        if (!$store) {
            return response()->json(['success' => true, 'billings' => []]);
        }

        $commissionRate = (float)($store->commission_rate ?? 10.0);

        $items = OrderItem::where('store_id', $store->id)
            ->with(['order'])
            ->latest()
            ->take(20)
            ->get();

        $gross = OrderItem::where('store_id', $store->id)->sum('total');
        $commissionTotal = $gross * ($commissionRate / 100);
        $netSettled = $gross - $commissionTotal;

        $inTransit = OrderItem::where('store_id', $store->id)
            ->whereIn('status', ['pending', 'processing', 'shipped'])
            ->sum('total');

        $ledger = $items->map(function ($it) use ($commissionRate) {
            $total = (float)$it->total;
            $comm = round($total * ($commissionRate / 100), 2);
            $net = $total - $comm;
            return [
                'id' => $it->id,
                'order_number' => $it->order->order_number ?? 'DHR-ORDER',
                'item_name' => $it->name,
                'gross' => $total,
                'commission' => $comm,
                'net_credit' => $net,
                'payment_method' => $it->order->payment_method ?? 'esewa',
                'status' => $it->status,
                'date' => $it->created_at->format('Y-m-d H:i'),
            ];
        });

        return response()->json([
            'success' => true,
            'summary' => [
                'gross_gmv' => (float)$gross,
                'commission_rate' => $commissionRate,
                'commission_paid' => (float)$commissionTotal,
                'net_settled' => (float)$netSettled,
                'escrow_in_transit' => (float)$inTransit,
            ],
            'ledger' => $ledger,
        ]);
    }

    /**
     * Store Discount Coupons
     */
    public function coupons(Request $request): JsonResponse
    {
        $user = $request->user();
        $store = $user->stores()->first();

        if (!$store) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $coupons = Coupon::where('store_id', $store->id)->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $coupons,
        ]);
    }

    public function storeCoupon(Request $request): JsonResponse
    {
        $user = $request->user();
        $store = $user->stores()->first();

        if (!$store) {
            return response()->json(['success' => false, 'message' => 'Store not found.'], 404);
        }

        $validated = $request->validate([
            'code' => 'required|string|max:50|uppercase',
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric|min:1',
            'min_order_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date|after:today',
        ]);

        $coupon = Coupon::create([
            'store_id' => $store->id,
            'code' => strtoupper($validated['code']),
            'type' => $validated['type'],
            'value' => $validated['value'],
            'min_order_amount' => $validated['min_order_amount'] ?? 0,
            'usage_limit' => $validated['usage_limit'] ?? 100,
            'expires_at' => $validated['expires_at'] ?? now()->addMonth(),
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Store promo coupon created successfully.',
            'coupon' => $coupon,
        ], 201);
    }

    public function deleteCoupon(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $store = $user->stores()->first();

        $coupon = Coupon::where('store_id', $store->id)->findOrFail($id);
        $coupon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Coupon removed.',
        ]);
    }

    /**
     * Store Customer Reviews
     */
    public function reviews(Request $request): JsonResponse
    {
        $user = $request->user();
        $storeIds = $user->stores->pluck('id')->toArray();

        $reviews = Review::whereHas('product', fn($q) => $q->whereIn('store_id', $storeIds))
            ->with(['user:id,name,avatar', 'product:id,name'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }

    /**
     * Store Auctions Listing & Management
     */
    public function auctions(Request $request): JsonResponse
    {
        $user = $request->user();
        $storeIds = $user->stores->pluck('id')->toArray();

        $auctions = Auction::whereIn('store_id', $storeIds)
            ->with([
                'product.primaryImage',
                'winner:id,name,email',
                'bids.user' => fn($q) => $q->select('id', 'name', 'avatar')->take(10),
            ])
            ->withCount('bids')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $auctions,
        ]);
    }

    /**
     * Cancel an active auction if no bids placed
     */
    public function cancelAuction(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $storeIds = $user->stores->pluck('id')->toArray();

        $auction = Auction::whereIn('store_id', $storeIds)->findOrFail($id);

        if ($auction->bids()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel an auction that has already received bids. Contact admin arbitration.',
            ], 422);
        }

        $auction->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Auction cancelled successfully.',
        ]);
    }

    public function payouts(Request $request): JsonResponse
    {
        $user = $request->user();
        $store = $user->stores()->first();

        if (!$store) {
            return response()->json([
                'success' => true,
                'total_earned' => 0,
                'available_balance' => 0,
                'payouts' => [],
            ]);
        }

        $gross = OrderItem::where('store_id', $store->id)
            ->whereHas('order', fn($q) => $q->where('payment_status', 'paid'))
            ->sum('total');

        $commissionRate = (float)($store->commission_rate ?? 10.0);
        $netEarned = $gross * (1 - ($commissionRate / 100));

        $paidOut = \App\Models\Payout::where('store_id', $store->id)
            ->whereIn('status', ['paid', 'completed', 'pending'])
            ->sum('amount');

        $available = max(0, $netEarned - $paidOut);

        $payouts = \App\Models\Payout::where('store_id', $store->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'gross_revenue' => (float)$gross,
            'commission_rate' => $commissionRate,
            'net_earned' => (float)$netEarned,
            'paid_out' => (float)$paidOut,
            'available_balance' => (float)$available,
            'payouts' => $payouts,
        ]);
    }

    public function requestPayout(Request $request): JsonResponse
    {
        $user = $request->user();
        $store = $user->stores()->first();

        if (!$store) {
            return response()->json(['success' => false, 'message' => 'Store not found.'], 404);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:500',
            'payment_method' => 'required|in:esewa,khalti,bank_transfer',
            'account_details' => 'required|string|max:255',
        ]);

        $payout = \App\Models\Payout::create([
            'store_id' => $store->id,
            'amount' => $validated['amount'],
            'status' => 'pending',
            'payment_method' => $validated['payment_method'],
            'transaction_reference' => $validated['account_details'],
            'period_start' => now()->subMonth(),
            'period_end' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payout request submitted successfully. Processing within 24-48 business hours.',
            'payout' => $payout,
        ]);
    }
}

