<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use App\Models\LeavePolicy;
use App\Models\LeaveRequest;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class MyLeavesController extends Controller
{
    private function getLeaveBalances($user)
    {
        $currentYear = date('Y');
        
        if ($user->custom_leave_year == $currentYear) {
            $cl_total = $user->custom_cl ?? 0;
            $sl_total = $user->custom_sl ?? 0;
            $el_total = $user->custom_el ?? 0;
        } else {
            $policy = LeavePolicy::where('employment_type', $user->employment_type ?? 'Full-time')->first();
            $cl_total = $policy ? $policy->cl : 0;
            $sl_total = $policy ? $policy->sl : 0;
            $el_total = $policy ? $policy->el : 0;
        }
        
        $usedCL = 0;
        $usedSL = 0;
        $usedEL = 0;

        foreach ($user->leaveRequests as $req) {
            // Count approved and pending requests against the limit
            if ($req->status !== 'rejected' && substr($req->start_date, 0, 4) == $currentYear) {
                $start = Carbon::parse($req->start_date);
                $end = Carbon::parse($req->end_date);
                $days = $start->diffInDays($end) + 1; 

                if ($req->type === 'CL') $usedCL += $days;
                if ($req->type === 'SL') $usedSL += $days;
                if ($req->type === 'EL') $usedEL += $days;
            }
        }

        return [
            'CL' => ['total' => $cl_total, 'used' => $usedCL],
            'SL' => ['total' => $sl_total, 'used' => $usedSL],
            'EL' => ['total' => $el_total, 'used' => $usedEL],
        ];
    }

    public function index()
    {
        $user = request()->user();
        $user->load('leaveRequests');

        $balances = $this->getLeaveBalances($user);

        // Upcoming holidays (look ahead 6 months)
        $futureDate = date('Y-m-d', strtotime('+6 months'));
        $upcomingHolidays = Holiday::getHolidaysInRange(date('Y-m-d'), $futureDate)->take(3);

        // Support monthly pagination
        $currentMonth = request('month', date('Y-m'));
        try {
            $carbonMonth = Carbon::parse($currentMonth);
        } catch (\Exception $e) {
            $carbonMonth = Carbon::now();
            $currentMonth = $carbonMonth->format('Y-m');
        }

        $startOfMonth = $carbonMonth->copy()->startOfMonth()->toDateString();
        $endOfMonth = $carbonMonth->copy()->endOfMonth()->toDateString();

        // Filter holidays for the selected month
        $holidays = Holiday::getHolidaysInRange($startOfMonth, $endOfMonth);

        // Filter leave requests for the selected month (for calendar display)
        $leaveRequests = LeaveRequest::where('user_id', $user->id)
            ->where(function ($query) use ($startOfMonth, $endOfMonth) {
                $query->whereBetween('start_date', [$startOfMonth, $endOfMonth])
                    ->orWhereBetween('end_date', [$startOfMonth, $endOfMonth])
                    ->orWhere(function ($q) use ($startOfMonth, $endOfMonth) {
                        $q->where('start_date', '<=', $startOfMonth)
                          ->where('end_date', '>=', $endOfMonth);
                    });
            })->get();

        // Fetch user attendances for the selected month
        $attendances = Attendance::where('user_id', $user->id)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->get();

        // All leave requests for the history table
        $leaveHistory = $user->leaveRequests()->orderBy('start_date', 'desc')->get();

        return Inertia::render('Employee/MyLeaves', [
            'balances' => $balances,
            'upcomingHolidays' => $upcomingHolidays,
            'holidays' => $holidays,
            'leaveRequests' => $leaveRequests,
            'leaveHistory' => $leaveHistory,
            'attendances' => $attendances,
            'currentMonth' => $currentMonth,
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

        // Check for overlapping holidays or Sundays
        $overlappingHoliday = Holiday::getHolidaysInRange($validated['start_date'], $validated['end_date'])->first();

        if ($overlappingHoliday) {
            return back()->withErrors(['start_date' => 'Your leave request overlaps with a holiday: ' . $overlappingHoliday->name]);
        }

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'pending';

        if ($validated['type'] !== 'LWP') {
            $balances = $this->getLeaveBalances($request->user());
            $leaveType = $validated['type'];
            
            if (isset($balances[$leaveType])) {
                $start = Carbon::parse($validated['start_date']);
                $end = Carbon::parse($validated['end_date']);
                $requestedDays = $start->diffInDays($end) + 1;
                
                $totalAvailable = $balances[$leaveType]['total'];
                $alreadyUsed = $balances[$leaveType]['used'];
                
                if (($alreadyUsed + $requestedDays) > $totalAvailable) {
                    return back()->withErrors(['type' => "You do not have enough $leaveType balance. (Requested: $requestedDays, Available: " . max(0, $totalAvailable - $alreadyUsed) . ")"]);
                }
            }
        }

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
