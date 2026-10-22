<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validateCoupon(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper(trim($validated['code'])))->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon code not found.',
            ], 404);
        }

        if (!$coupon->isValid((float)$validated['subtotal'])) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon is not valid or minimum order requirement not met.',
            ], 422);
        }

        $discount = $coupon->calculateDiscount((float)$validated['subtotal']);

        return response()->json([
            'success' => true,
            'message' => 'Coupon applied successfully!',
            'coupon' => [
                'code' => $coupon->code,
                'type' => $coupon->type,
                'value' => $coupon->value,
                'discount' => $discount,
            ],
        ]);
    }
}

