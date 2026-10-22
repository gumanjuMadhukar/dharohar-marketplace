<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function __construct(protected PaymentService $paymentService) {}

    /**
     * List current user's orders
     */
    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['items.product.primaryImage', 'items.store', 'payments'])
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Get single order detail
     */
    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $user = $request->user();

        $order = Order::with(['items.product.primaryImage', 'items.store', 'items.variant', 'payments', 'disputes'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        // Check if user owns order or is store owner of an item or admin
        $isBuyer = $order->user_id === $user->id;
        $isSeller = $order->items->pluck('store.user_id')->contains($user->id);
        $isAdmin = ($user->account_type === 'admin' || $user->hasRole('admin'));

        if (!$isBuyer && !$isSeller && !$isAdmin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'success' => true,
            'order' => $order,
        ]);
    }

    /**
     * Create checkout order (Multi-vendor supported)
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_name' => 'required|string|max:255',
            'shipping_email' => 'required|email|max:255',
            'shipping_phone' => 'required|string|max:20',
            'shipping_address' => 'required|string',
            'shipping_city' => 'required|string|max:100',
            'shipping_state' => 'required|string|max:100',
            'shipping_country' => 'nullable|string|max:100',
            'shipping_zip' => 'nullable|string|max:20',
            'payment_method' => 'required|in:stripe,esewa,khalti,cod',
            'coupon_code' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $user) {
            $subtotal = 0;
            $orderItemsData = [];

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $variant = !empty($item['product_variant_id'])
                    ? ProductVariant::find($item['product_variant_id'])
                    : null;

                $unitPrice = $variant ? $variant->price : $product->price;

                // Check wholesale tier pricing if quantity matches
                $wholesale = $product->wholesalePrices()
                    ->where('min_quantity', '<=', $item['quantity'])
                    ->where(fn($q) => $q->whereNull('max_quantity')->orWhere('max_quantity', '>=', $item['quantity']))
                    ->orderBy('min_quantity', 'desc')
                    ->first();

                if ($wholesale) {
                    $unitPrice = $wholesale->price;
                }

                $itemTotal = $unitPrice * $item['quantity'];
                $subtotal += $itemTotal;

                $orderItemsData[] = [
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'store_id' => $product->store_id,
                    'name' => $product->name,
                    'sku' => $variant?->sku ?: $product->sku ?: ('DHAR-' . $product->id),
                    'price' => $unitPrice,
                    'quantity' => $item['quantity'],
                    'total' => $itemTotal,
                    'status' => 'pending',
                ];

                // Deduct inventory
                if ($variant) {
                    $variant->decrement('quantity', $item['quantity']);
                }
                $product->decrement('quantity', $item['quantity']);
                $product->increment('sales_count', $item['quantity']);
            }

            // Coupon calculation
            $discount = 0;
            if (!empty($validated['coupon_code'])) {
                $coupon = Coupon::where('code', $validated['coupon_code'])->first();
                if ($coupon && $coupon->isValid($subtotal)) {
                    $discount = $coupon->calculateDiscount($subtotal);
                    $coupon->increment('used_count');
                }
            }

            $shippingCost = 150.00; // Flat standard Nepal delivery NPR
            $tax = 0.00;
            $total = max(0, $subtotal + $shippingCost + $tax - $discount);

            $orderNumber = 'DHAR-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

            $order = Order::create([
                'user_id' => $user?->id,
                'order_number' => $orderNumber,
                'status' => 'pending',
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'tax' => $tax,
                'discount' => $discount,
                'total' => $total,
                'currency' => 'NPR',
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'pending',
                'shipping_name' => $validated['shipping_name'],
                'shipping_email' => $validated['shipping_email'],
                'shipping_phone' => $validated['shipping_phone'],
                'shipping_address' => $validated['shipping_address'],
                'shipping_city' => $validated['shipping_city'],
                'shipping_state' => $validated['shipping_state'],
                'shipping_country' => $validated['shipping_country'] ?? 'Nepal',
                'shipping_zip' => $validated['shipping_zip'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($orderItemsData as $itemData) {
                $itemData['order_id'] = $order->id;
                OrderItem::create($itemData);
            }

            // Initiate payment via chosen gateway (Stripe, eSewa, Khalti, COD)
            $paymentResponse = $this->paymentService->initiatePayment($order, $validated['payment_method']);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully.',
                'order' => $order->load('items'),
                'payment' => $paymentResponse,
            ], 201);
        });
    }

    /**
     * Track order status publicly by order number and email/phone
     */
    public function track(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_number' => 'required|string',
            'contact' => 'required|string',
        ]);

        $order = Order::with(['items.product.primaryImage', 'items.store'])
            ->where('order_number', $validated['order_number'])
            ->where(function ($q) use ($validated) {
                $q->where('shipping_email', $validated['contact'])
                  ->orWhere('shipping_phone', $validated['contact']);
            })
            ->first();

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found with provided credentials.'], 404);
        }

        return response()->json([
            'success' => true,
            'order' => $order,
        ]);
    }
}
