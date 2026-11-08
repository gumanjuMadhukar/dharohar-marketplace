<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Display paginated audit logs with search & role filters.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Staff can only view moderation and stream actions; Super Admin sees everything
        $query = AuditLog::with('user:id,name,email,avatar,account_type')->latest();

        if ($user->account_type === 'staff') {
            $query->whereIn('action', [
                'USER_BANNED', 'USER_UNBANNED', 'KYC_APPROVED', 'KYC_REJECTED',
                'STREAM_STATUS_CHANGED', 'CHAT_MODERATED', 'LOT_HAMMERED_SOLD',
                'LOT_ACTIVATED', 'DISPUTE_RESOLVED'
            ]);
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('details', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $logs = $query->paginate($request->input('per_page', 20));

        // Aggregate statistics for admin audit dashboard
        $stats = [
            'total_logs' => AuditLog::count(),
            'today_events' => AuditLog::whereDate('created_at', today())->count(),
            'stream_actions' => AuditLog::where('action', 'like', '%STREAM%')->orWhere('action', 'like', '%LOT%')->count(),
            'security_actions' => AuditLog::whereIn('action', ['USER_BANNED', 'AUTH_ELEVATION', 'SETTINGS_UPDATED'])->count(),
        ];

        return response()->json([
            'success' => true,
            'logs' => $logs,
            'stats' => $stats,
        ]);
    }
}
