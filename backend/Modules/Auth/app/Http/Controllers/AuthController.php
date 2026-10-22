<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
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

        try {
            $user->assignRole($validated['account_type']);
        } catch (\Throwable $e) {}

        $token = $user->createToken('dharohar_auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful! Welcome to Dharohar.',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account is deactivated.',
            ], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('dharohar_auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Logged in successfully.',
            'user' => $user->load('stores'),
            'token' => $token,
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()->load(['stores', 'kycDocuments']),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }
}
