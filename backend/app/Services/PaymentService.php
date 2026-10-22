<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    /**
     * Process or initiate payment based on gateway
     */
    public function initiatePayment(Order $order, string $gateway, array $extraData = []): array
    {
        return match ($gateway) {
            'stripe' => $this->initiateStripe($order),
            'esewa' => $this->initiateEsewa($order),
            'khalti' => $this->initiateKhalti($order),
            'cod' => $this->processCashOnDelivery($order),
            default => throw new \InvalidArgumentException("Unsupported payment gateway: {$gateway}"),
        };
    }

    /**
     * Stripe Checkout / PaymentIntent
     */
    protected function initiateStripe(Order $order): array
    {
        $stripeSecret = config('services.stripe.secret') ?? env('STRIPE_SECRET');
        
        // Return dummy success if in test mode without real API key
        if (empty($stripeSecret) || str_starts_with($stripeSecret, 'sk_test_dharohar_demo')) {
            $payment = Payment::create([
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'payment_method' => 'stripe',
                'transaction_id' => 'stripe_demo_' . uniqid(),
                'amount' => $order->total,
                'currency' => $order->currency ?? 'NPR',
                'status' => 'pending',
                'gateway_response' => ['mode' => 'sandbox_demo'],
            ]);

            return [
                'success' => true,
                'gateway' => 'stripe',
                'payment_id' => $payment->id,
                'client_secret' => 'demo_client_secret_' . $order->order_number,
                'message' => 'Stripe demo checkout session ready',
            ];
        }

        \Stripe\Stripe::setApiKey($stripeSecret);

        $session = \Stripe\Checkout\Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => strtolower($order->currency ?? 'npr'),
                    'product_data' => [
                        'name' => 'Order #' . $order->order_number,
                    ],
                    'unit_amount' => (int)($order->total * 100),
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => env('FRONTEND_URL', 'http://localhost:3000') . '/checkout/success?order=' . $order->order_number,
            'cancel_url' => env('FRONTEND_URL', 'http://localhost:3000') . '/checkout/cancel?order=' . $order->order_number,
            'metadata' => [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ],
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'payment_method' => 'stripe',
            'transaction_id' => $session->id,
            'amount' => $order->total,
            'currency' => $order->currency ?? 'NPR',
            'status' => 'pending',
            'gateway_response' => ['session_id' => $session->id],
        ]);

        return [
            'success' => true,
            'gateway' => 'stripe',
            'payment_id' => $payment->id,
            'checkout_url' => $session->url,
            'session_id' => $session->id,
        ];
    }

    /**
     * eSewa Payment Integration (ePay v2 with HMAC-SHA256)
     */
    protected function initiateEsewa(Order $order): array
    {
        $merchantId = env('ESEWA_MERCHANT_ID', 'EPAYTEST');
        $secretKey = env('ESEWA_SECRET', '8gBm/:&EnhH.1/q');
        $apiUrl = env('ESEWA_API_URL', 'https://rc-epay.esewa.com.np');

        $totalAmount = number_format($order->total, 2, '.', '');
        $transactionUuid = $order->order_number . '-' . time();
        $productCode = $merchantId;

        // Signature message: total_amount,transaction_uuid,product_code
        $signatureString = "total_amount={$totalAmount},transaction_uuid={$transactionUuid},product_code={$productCode}";
        $signature = base64_encode(hash_hmac('sha256', $signatureString, $secretKey, true));

        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'payment_method' => 'esewa',
            'transaction_id' => $transactionUuid,
            'amount' => $order->total,
            'currency' => 'NPR',
            'status' => 'pending',
            'gateway_response' => [
                'transaction_uuid' => $transactionUuid,
                'signature' => $signature,
            ],
        ]);

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

        return [
            'success' => true,
            'gateway' => 'esewa',
            'payment_id' => $payment->id,
            'action_url' => $apiUrl . '/api/epay/main/v2/form',
            'params' => [
                'amount' => $totalAmount,
                'tax_amount' => '0',
                'total_amount' => $totalAmount,
                'transaction_uuid' => $transactionUuid,
                'product_code' => $productCode,
                'product_service_charge' => '0',
                'product_delivery_charge' => '0',
                'success_url' => $frontendUrl . '/checkout/payment-verify?gateway=esewa&order=' . $order->order_number,
                'failure_url' => $frontendUrl . '/checkout/payment-verify?gateway=esewa&status=failed&order=' . $order->order_number,
                'signed_field_names' => 'total_amount,transaction_uuid,product_code',
                'signature' => $signature,
            ],
        ];
    }

    /**
     * Khalti Payment Integration (API v2)
     */
    protected function initiateKhalti(Order $order): array
    {
        $secretKey = env('KHALTI_SECRET_KEY', 'test_secret_key_dharohar');
        $apiUrl = env('KHALTI_API_URL', 'https://a.khalti.com/api/v2');
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

        $purchaseOrderId = $order->order_number;
        $purchaseOrderName = "Order #" . $order->order_number;
        $amountInPaisa = (int)($order->total * 100);

        // If demo key, return mock response for easy local testing
        if (str_starts_with($secretKey, 'test_secret_key_dharohar')) {
            $payment = Payment::create([
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'payment_method' => 'khalti',
                'transaction_id' => 'khalti_demo_' . uniqid(),
                'amount' => $order->total,
                'currency' => 'NPR',
                'status' => 'pending',
                'gateway_response' => ['mode' => 'sandbox_demo'],
            ]);

            return [
                'success' => true,
                'gateway' => 'khalti',
                'payment_id' => $payment->id,
                'pidx' => 'khalti_demo_pidx_' . uniqid(),
                'payment_url' => $frontendUrl . '/checkout/payment-verify?gateway=khalti&pidx=demo&order=' . $order->order_number,
                'message' => 'Khalti demo payment initialized',
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Key ' . $secretKey,
                'Content-Type' => 'application/json',
            ])->post($apiUrl . '/epayment/initiate/', [
                'return_url' => $frontendUrl . '/checkout/payment-verify?gateway=khalti&order=' . $order->order_number,
                'website_url' => $frontendUrl,
                'amount' => $amountInPaisa,
                'purchase_order_id' => $purchaseOrderId,
                'purchase_order_name' => $purchaseOrderName,
                'customer_info' => [
                    'name' => $order->shipping_name,
                    'email' => $order->shipping_email,
                    'phone' => $order->shipping_phone ?? '9800000000',
                ],
            ]);

            $data = $response->json();

            if ($response->successful() && isset($data['pidx'])) {
                $payment = Payment::create([
                    'order_id' => $order->id,
                    'user_id' => $order->user_id,
                    'payment_method' => 'khalti',
                    'transaction_id' => $data['pidx'],
                    'amount' => $order->total,
                    'currency' => 'NPR',
                    'status' => 'pending',
                    'gateway_response' => $data,
                ]);

                return [
                    'success' => true,
                    'gateway' => 'khalti',
                    'payment_id' => $payment->id,
                    'pidx' => $data['pidx'],
                    'payment_url' => $data['payment_url'],
                ];
            }

            Log::error('Khalti initiate failed: ', $data ?? []);
            return [
                'success' => false,
                'message' => $data['detail'] ?? 'Khalti initialization failed',
            ];
        } catch (\Exception $e) {
            Log::error('Khalti exception: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to connect to Khalti',
            ];
        }
    }

    /**
     * Cash on Delivery
     */
    protected function processCashOnDelivery(Order $order): array
    {
        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'payment_method' => 'cod',
            'transaction_id' => 'cod_' . uniqid(),
            'amount' => $order->total,
            'currency' => 'NPR',
            'status' => 'pending',
            'gateway_response' => ['type' => 'cash_on_delivery'],
        ]);

        $order->update([
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'status' => 'confirmed',
        ]);

        return [
            'success' => true,
            'gateway' => 'cod',
            'payment_id' => $payment->id,
            'message' => 'Order placed successfully with Cash on Delivery',
        ];
    }

    /**
     * Verify payment status
     */
    public function verifyPayment(string $gateway, array $data): bool
    {
        if ($gateway === 'esewa') {
            return $this->verifyEsewa($data);
        }

        if ($gateway === 'khalti') {
            return $this->verifyKhalti($data);
        }

        return false;
    }

    protected function verifyEsewa(array $data): bool
    {
        // eSewa sends encoded data on success
        if (isset($data['data'])) {
            $decoded = json_decode(base64_decode($data['data']), true);
            if ($decoded && isset($decoded['status']) && $decoded['status'] === 'COMPLETE') {
                $transactionUuid = $decoded['transaction_uuid'] ?? null;
                if ($transactionUuid) {
                    $payment = Payment::where('transaction_id', $transactionUuid)->first();
                    if ($payment) {
                        $payment->update([
                            'status' => 'completed',
                            'paid_at' => now(),
                            'gateway_response' => $decoded,
                        ]);
                        $payment->order->update([
                            'payment_status' => 'paid',
                            'status' => 'processing',
                        ]);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    protected function verifyKhalti(array $data): bool
    {
        $pidx = $data['pidx'] ?? null;
        if (!$pidx) return false;

        $secretKey = env('KHALTI_SECRET_KEY', 'test_secret_key_dharohar');
        $apiUrl = env('KHALTI_API_URL', 'https://a.khalti.com/api/v2');

        if (str_starts_with($pidx, 'khalti_demo_') || $pidx === 'demo') {
            // Demo verification
            $orderNumber = $data['order'] ?? null;
            if ($orderNumber) {
                $order = Order::where('order_number', $orderNumber)->first();
                if ($order) {
                    $order->update(['payment_status' => 'paid', 'status' => 'processing']);
                    $payment = $order->payments()->latest()->first();
                    if ($payment) {
                        $payment->update(['status' => 'completed', 'paid_at' => now()]);
                    }
                    return true;
                }
            }
            return true;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Key ' . $secretKey,
            ])->post($apiUrl . '/epayment/lookup/', ['pidx' => $pidx]);

            $res = $response->json();
            if ($response->successful() && isset($res['status']) && $res['status'] === 'Completed') {
                $payment = Payment::where('transaction_id', $pidx)->first();
                if ($payment) {
                    $payment->update([
                        'status' => 'completed',
                        'paid_at' => now(),
                        'gateway_response' => $res,
                    ]);
                    $payment->order->update([
                        'payment_status' => 'paid',
                        'status' => 'processing',
                    ]);
                    return true;
                }
            }
        } catch (\Exception $e) {
            Log::error('Khalti verification failed: ' . $e->getMessage());
        }

        return false;
    }
}
