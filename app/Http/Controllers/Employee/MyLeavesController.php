<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use App\Models\LeavePolicy;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class MyLeavesController extends Controller
{
    public function index()
    {
        $user = request()->user();
        $user->load('leaveRequests');

        $policy = LeavePolicy::where('employment_type', $user->employment_type ?? 'Full-time')->first();
        
        // Calculate used leaves for current year
        $currentYear = date('Y');
        $usedCL = 0;
        $usedSL = 0;
        $usedEL = 0;

        foreach ($user->leaveRequests as $req) {
            if ($req->status === 'approved' && substr($req->start_date, 0, 4) == $currentYear) {
                // Calculate days
                $start = Carbon::parse($req->start_date);
                $end = Carbon::parse($req->end_date);
                $days = $start->diffInDays($end) + 1; // inclusive

                if ($req->type === 'CL') $usedCL += $days;
                if ($req->type === 'SL') $usedSL += $days;
                if ($req->type === 'EL') $usedEL += $days;
            }
        }

        $balances = [
            'CL' => ['total' => $policy ? $policy->cl : 0, 'used' => $usedCL],
            'SL' => ['total' => $policy ? $policy->sl : 0, 'used' => $usedSL],
            'EL' => ['total' => $policy ? $policy->el : 0, 'used' => $usedEL],
        ];

        // Upcoming holidays
        $upcomingHolidays = Holiday::where('date', '>=', date('Y-m-d'))
            ->orderBy('date', 'asc')
            ->take(3)
            ->get();

        // All holidays for calendar
        $holidays = Holiday::all();

        return Inertia::render('Employee/MyLeaves', [
            'balances' => $balances,
            'upcomingHolidays' => $upcomingHolidays,
            'holidays' => $holidays,
            'leaveRequests' => $user->leaveRequests,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:CL,SL,EL,LWP',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        // Check for overlapping holidays
        $overlappingHoliday = Holiday::where(function ($query) use ($validated) {
            $query->whereBetween('date', [$validated['start_date'], $validated['end_date']]);
        })->first();

        if ($overlappingHoliday) {
            return back()->withErrors(['start_date' => 'Your leave request overlaps with a public holiday: ' . $overlappingHoliday->name]);
        }

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'pending';

        if ($request->hasFile('document')) {
            $path = $request->file('document')->store('leave_docs', 'public');
            $validated['document_path'] = $path;
        }

        LeaveRequest::create($validated);

        return redirect()->back()->with('success', 'Leave request submitted successfully.');
    }

    public function destroy(LeaveRequest $leaveRequest)
    {
        if ($leaveRequest->user_id !== request()->user()->id) {
            abort(403);
        }

        $leaveRequest->delete();

        return redirect()->back()->with('success', 'Leave request deleted successfully.');
    }
}
