<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\KycDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KycController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $docs = KycDocument::where('user_id', $request->user()->id)->latest()->get();

        return response()->json([
            'success' => true,
            'documents' => $docs,
            'is_verified' => $request->user()->is_verified,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'document_type' => 'required|in:citizenship,passport,license,pan',
            'document_number' => 'required|string|max:100',
            'front_image' => 'required|string',
            'back_image' => 'nullable|string',
        ]);

        $kyc = KycDocument::create([
            'user_id' => $user->id,
            'document_type' => $validated['document_type'],
            'document_number' => $validated['document_number'],
            'front_image' => $validated['front_image'],
            'back_image' => $validated['back_image'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'KYC documents submitted successfully. Verification pending by Dharohar Admin.',
            'document' => $kyc,
        ], 201);
    }
}

