<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaskAssignment;
use Illuminate\Http\Request;
use Carbon\Carbon;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $now = Carbon::now();

        // Monthly Leaderboard
        $monthly = TaskAssignment::where('status', 'completed')
            ->whereMonth('completed_at', $now->month)
            ->whereYear('completed_at', $now->year)
            ->selectRaw('user_id, count(*) as completed_count')
            ->groupBy('user_id')
            ->with('user:id,name,avatar,role')
            ->orderByDesc('completed_count')
            ->get();

        // Overall Leaderboard
        $overall = TaskAssignment::where('status', 'completed')
            ->selectRaw('user_id, count(*) as completed_count')
            ->groupBy('user_id')
            ->with('user:id,name,avatar,role')
            ->orderByDesc('completed_count')
            ->get();

        return response()->json([
            'monthly' => $monthly,
            'overall' => $overall,
        ]);
    }
}
