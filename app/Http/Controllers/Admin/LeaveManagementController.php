<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use App\Models\LeavePolicy;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveManagementController extends Controller
{
    protected function checkAdmin()
    {
        if (!request()->user()?->hasAdminAccess()) {
            abort(403);
        }
    }

    public function index()
    {
        $this->checkAdmin();

        $holidays = Holiday::orderBy('date', 'asc')->get();
        $policies = LeavePolicy::all();
        $pendingRequests = LeaveRequest::with('user')->orderBy('created_at', 'desc')->get();
        $officeTiming = \App\Models\OfficeTiming::first();

        return Inertia::render('Admin/LeaveManagement', [
            'holidays' => $holidays,
            'policies' => $policies,
            'leaveRequests' => $pendingRequests,
            'officeTiming' => $officeTiming,
        ]);
    }

    public function storeHoliday(Request $request)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date' => 'required|date|unique:holidays,date',
            'description' => 'nullable|string',
        ]);

        Holiday::create($validated);

        return redirect()->back()->with('success', 'Holiday created successfully.');
    }

    public function destroyHoliday(Holiday $holiday)
    {
        $this->checkAdmin();
        $holiday->delete();
        return redirect()->back()->with('success', 'Holiday deleted successfully.');
    }

    public function storePolicy(Request $request)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'employment_type' => 'required|string',
            'cl' => 'required|integer|min:0',
            'sl' => 'required|integer|min:0',
            'el' => 'required|integer|min:0',
        ]);

        LeavePolicy::updateOrCreate(
            ['employment_type' => $validated['employment_type']],
            [
                'cl' => $validated['cl'],
                'sl' => $validated['sl'],
                'el' => $validated['el'],
            ]
        );

        return redirect()->back()->with('success', 'Leave Policy updated successfully.');
    }

    public function updateRequestStatus(Request $request, LeaveRequest $leaveRequest)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_remarks' => 'nullable|string',
        ]);

        $leaveRequest->update($validated);

        return redirect()->back()->with('success', 'Leave request updated successfully.');
    }

    public function destroyRequest(LeaveRequest $leaveRequest)
    {
        $this->checkAdmin();
        $leaveRequest->delete();
        return redirect()->back()->with('success', 'Leave request deleted successfully.');
    }

    public function storeOfficeTiming(Request $request)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'start_time' => 'required|string',
            'end_time' => 'required|string',
        ]);

        $start = strlen($validated['start_time']) === 5 ? $validated['start_time'] . ':00' : $validated['start_time'];
        $end = strlen($validated['end_time']) === 5 ? $validated['end_time'] . ':00' : $validated['end_time'];

        \App\Models\OfficeTiming::updateOrCreate(
            ['id' => 1],
            [
                'name' => 'Standard Shift',
                'start_time' => $start,
                'end_time' => $end,
            ]
        );

        return redirect()->back()->with('success', 'Office Shift Timings updated successfully.');
    }
}
