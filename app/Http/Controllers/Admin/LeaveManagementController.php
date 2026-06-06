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

        $currentYear = date('Y');
        $holidays = Holiday::getHolidaysInRange("$currentYear-01-01", "$currentYear-12-31");
        $policies = LeavePolicy::all();
        $pendingRequests = LeaveRequest::with('user')->orderBy('created_at', 'desc')->get();
        return Inertia::render('Admin/LeaveManagement', [
            'holidays' => $holidays,
            'policies' => $policies,
            'leaveRequests' => $pendingRequests,
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
            'policies' => 'required|array',
            'policies.*.employment_type' => 'required|string',
            'policies.*.cl' => 'required|integer|min:0',
            'policies.*.sl' => 'required|integer|min:0',
            'policies.*.el' => 'required|integer|min:0',
        ]);

        foreach ($validated['policies'] as $policy) {
            LeavePolicy::updateOrCreate(
                ['employment_type' => $policy['employment_type']],
                [
                    'cl' => $policy['cl'],
                    'sl' => $policy['sl'],
                    'el' => $policy['el'],
                ]
            );
        }

        return redirect()->back()->with('success', 'Leave Policies updated successfully.');
    }

    public function updateRequestStatus(Request $request, LeaveRequest $leaveRequest)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_remarks' => 'nullable|string',
        ]);

        $leaveRequest->update($validated);

        // Notify the employee
        $leaveRequest->load('user');
        if ($leaveRequest->user) {
            \Illuminate\Support\Facades\Mail::to($leaveRequest->user->email)->send(new \App\Mail\LeaveStatusUpdated($leaveRequest));
        }

        return redirect()->back()->with('success', 'Leave request updated successfully.');
    }

    public function destroyRequest(LeaveRequest $leaveRequest)
    {
        $this->checkAdmin();
        $leaveRequest->delete();
        return redirect()->back()->with('success', 'Leave request deleted successfully.');
    }


}
