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
        
        $policy = LeavePolicy::where('employment_type', $user->employment_type ?? 'Full-time')->first();
        
        if ($user->custom_leave_year == $currentYear && ($user->custom_cl !== null || $user->custom_sl !== null || $user->custom_el !== null)) {
            $cl_total = $user->custom_cl ?? ($policy ? $policy->cl : 0);
            $sl_total = $user->custom_sl ?? ($policy ? $policy->sl : 0);
            $el_total = $user->custom_el ?? ($policy ? $policy->el : 0);
        } else {
            $cl_total = $policy ? $policy->cl : 0;
            $sl_total = $policy ? $policy->sl : 0;
            $el_total = $policy ? $policy->el : 0;
        }
        
        $currentMonth = (int) date('m');
        $cl_monthly = $cl_total / 12;
        $sl_monthly = $sl_total / 12;
        $el_monthly = $el_total / 12;
        
        $usedCL = 0;
        $usedSL = 0;
        $usedEL = 0;
        $usedLWP = 0;
        
        $clUsageByMonth = array_fill(1, 12, 0);
        $slUsageByMonth = array_fill(1, 12, 0);

        foreach ($user->leaveRequests as $req) {
            if ($req->status !== 'rejected') {
                $start = Carbon::parse($req->start_date);
                $end = Carbon::parse($req->end_date);
                $days = $start->diffInDays($end) + 1; 

                if (substr($req->start_date, 0, 4) == $currentYear) {
                    $month = (int) $start->format('m');
                    if ($req->type === 'CL') {
                        $usedCL += $days;
                        $clUsageByMonth[$month] += $days;
                    }
                    if ($req->type === 'SL') {
                        $usedSL += $days;
                        $slUsageByMonth[$month] += $days;
                    }
                    if ($req->type === 'EL') $usedEL += $days;
                    if ($req->type === 'LWP') $usedLWP += $days;
                }
            }
        }
        
        $lapsedCL = 0;
        $lapsedSL = 0;
        for ($m = 1; $m < $currentMonth; $m++) {
            $lapsedCL += max(0, $cl_monthly - $clUsageByMonth[$m]);
            $lapsedSL += max(0, $sl_monthly - $slUsageByMonth[$m]);
        }
        
        $availableCL = max(0, $cl_total - $lapsedCL - $usedCL);
        $availableSL = max(0, $sl_total - $lapsedSL - $usedSL);
        
        // Dynamically calculate carry-forward EL from joining date to last year
        $carriedEL = 0;
        if ($user->joining_date) {
            $joinYear = (int) Carbon::parse($user->joining_date)->format('Y');
            $joinMonth = (int) Carbon::parse($user->joining_date)->format('m');
            $currentYearInt = (int) $currentYear;
            
            for ($y = $joinYear; $y < $currentYearInt; $y++) {
                $monthsInYear = ($y === $joinYear) ? (12 - $joinMonth + 1) : 12;
                $accruedThatYear = $el_monthly * $monthsInYear;
                
                $takenThatYear = 0;
                foreach ($user->leaveRequests as $req) {
                    if ($req->status !== 'rejected' && substr($req->start_date, 0, 4) == $y && $req->type === 'EL') {
                        $start = Carbon::parse($req->start_date);
                        $end = Carbon::parse($req->end_date);
                        $takenThatYear += ($start->diffInDays($end) + 1);
                    }
                }
                
                $carriedEL += max(0, $accruedThatYear - $takenThatYear);
            }
        }
        
        // Current year accrued EL up to current month
        $currentYearAccruedEL = $el_monthly * $currentMonth;
        $availableEL = max(0, $currentYearAccruedEL + $carriedEL - $usedEL);

        return [
            'CL' => ['total' => $cl_total, 'used' => $usedCL, 'lapsed' => floor($lapsedCL), 'available' => floor($availableCL)],
            'SL' => ['total' => $sl_total, 'used' => $usedSL, 'lapsed' => floor($lapsedSL), 'available' => floor($availableSL)],
            'EL' => ['total' => floor($currentYearAccruedEL + $carriedEL), 'used' => $usedEL, 'carried' => floor($carriedEL), 'available' => floor($availableEL)],
            'LWP' => ['total' => 0, 'used' => $usedLWP, 'available' => 999],
        ];
    }

    public function index()
    {
        $user = request()->user();
        $user->load('leaveRequests');

        $balances = $this->getLeaveBalances($user);

        // Upcoming holidays (look ahead 6 months - only HR set holidays)
        $upcomingHolidays = Holiday::where('date', '>=', date('Y-m-d'))
            ->orderBy('date', 'asc')
            ->take(3)
            ->get();

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
                
                $available = $balances[$leaveType]['available'];
                
                if ($requestedDays > $available) {
                    return back()->withErrors(['type' => "You do not have enough $leaveType balance. (Requested: $requestedDays, Available: $available)"]);
                }
            }
        }

        if ($request->hasFile('document')) {
            $path = $request->file('document')->store('leave_docs', 'public');
            $validated['document_path'] = $path;
        }

        $leaveRequest = LeaveRequest::create($validated);

        // Notify HR users
        $hrUsers = \App\Models\User::where('role', 'hr')->get();
        foreach ($hrUsers as $hrUser) {
            \Illuminate\Support\Facades\Mail::to($hrUser->email)->queue(new \App\Mail\LeaveRequested($leaveRequest));
        }

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
