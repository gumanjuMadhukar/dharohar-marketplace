<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register user (Customer, Seller, Manufacturer, or Student)
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'account_type' => 'required|in:customer,seller,manufacturer,student',
            'date_of_birth' => 'nullable|date',
            'bio' => 'nullable|string|max:1000',
            // Student specific fields
            'guardian_name' => 'nullable|required_if:account_type,student|string|max:255',
            'guardian_email' => 'nullable|required_if:account_type,student|email|max:255',
            'guardian_consent' => 'nullable|boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'account_type' => $validated['account_type'],
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'guardian_name' => $validated['guardian_name'] ?? null,
            'guardian_email' => $validated['guardian_email'] ?? null,
            'guardian_consent' => $validated['guardian_consent'] ?? false,
            'is_active' => true,
            'is_verified' => false,
        ]);

        // Assign Spatie role if exists
        try {
            $user->assignRole($validated['account_type']);
        } catch (\Throwable $e) {
            // Role table might not be seeded yet
        }

        $token = $user->createToken('dharohar_auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful! Welcome to Dharohar.',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password credentials.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 403);
        }

        $user->tokens()->delete(); // single session token rotation
        $token = $user->createToken('dharohar_auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Logged in successfully.',
            'user' => $user->load('stores'),
            'token' => $token,
        ]);
    }

    /**
     * Current authenticated user profile
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user()->load(['stores', 'kycDocuments' => fn($q) => $q->latest()]);
        
        return response()->json([
            'success' => true,
            'user' => $user,
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20|unique:users,phone,' . $user->id,
            'bio' => 'nullable|string|max:1000',
            'avatar' => 'nullable|string',
            'locale' => 'nullable|in:en,ne',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_email' => 'nullable|email|max:255',
            'guardian_consent' => 'nullable|boolean',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'user' => $user,
        ]);
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password does not match.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully.',
        ]);
    }

    /**
     * Get user's active bids across live auctions
     */
    public function myBids(Request $request): JsonResponse
    {
        $user = $request->user();

        $bids = \App\Models\Bid::where('user_id', $user->id)
            ->with(['auction.product.primaryImage'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $bids,
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }
}
