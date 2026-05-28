<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Designation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    /**
     * Check if the authenticated user has Admin/HR access.
     */
    protected function checkAccess()
    {
        if (!request()->user()?->hasAdminAccess()) {
            abort(403);
        }
    }

    /**
     * Store a newly created employee in storage.
     */
    public function store(Request $request)
    {
        $this->checkAccess();

        $request->validate([
            'name' => 'required|string|max:255',
            'dob' => 'nullable|date',
            'gender' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'employee_id' => [
                'required',
                'string',
                'unique:users,employee_id',
                'regex:/^EMP-\d+$/' // Must start with EMP- followed by numbers
            ],
            'designation_id' => 'nullable|exists:designations,id',
            'department' => 'required|string|max:255',
            'joining_date' => 'required|date',
            'employment_type' => 'required|string|in:Full-time,Contract,Intern',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:hr,employee', // Only allow superadmin/hr to create hr or employee roles
        ], [
            'employee_id.regex' => 'The Employee ID must start with "EMP-" followed by a sequence number.',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'designation_id' => $request->designation_id,
            'dob' => $request->dob,
            'gender' => $request->gender,
            'phone' => $request->phone,
            'employee_id' => $request->employee_id,
            'department' => $request->department,
            'joining_date' => $request->joining_date,
            'employment_type' => $request->employment_type,
        ]);

        return redirect()->route('admin.dashboard')->with('success', 'Employee profile created successfully.');
    }
}
