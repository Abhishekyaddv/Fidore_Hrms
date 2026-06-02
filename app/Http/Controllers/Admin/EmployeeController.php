<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Designation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

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
     * Display a listing of the employees.
     */
    public function index()
    {
        $this->checkAccess();

        $employees = User::whereIn('role', ['employee', 'hr', 'superadmin'])
            ->with('designation')
            ->orderBy('created_at', 'desc')
            ->get();

        $totalStaff = $employees->count();
        $activeNow = $totalStaff; // Placeholder as requested

        // Calculate next sequential employee ID for the Add Employee modal
        $lastSeq = User::whereNotNull('employee_id')
            ->where('employee_id', 'like', 'EMP-%')
            ->get()
            ->map(function ($u) {
                return (int) str_replace('EMP-', '', $u->employee_id);
            })
            ->max();
        $nextSeq = ($lastSeq ?: 0) + 1;
        $nextEmployeeId = 'EMP-' . $nextSeq;

        $designations = Designation::all();

        return Inertia::render('Admin/EmployeeDirectory', [
            'employees' => $employees,
            'totalStaff' => $totalStaff,
            'activeNow' => $activeNow,
            'designations' => $designations,
            'nextEmployeeId' => $nextEmployeeId,
        ]);
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
            'joining_date' => 'required|date',
            'employment_type' => 'required|string|in:Full-time,Probation,Intern',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'custom_leave_year' => 'nullable|integer',
            'custom_cl' => 'nullable|integer',
            'custom_sl' => 'nullable|integer',
            'custom_el' => 'nullable|integer',
        ], [
            'employee_id.regex' => 'The Employee ID must start with "EMP-" followed by a sequence number.',
        ]);

        $role = 'employee';
        if ($request->designation_id) {
            $designation = Designation::find($request->designation_id);
            if ($designation) {
                $role = $designation->role;
            }
        }

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $role,
            'designation_id' => $request->designation_id,
            'dob' => $request->dob,
            'gender' => $request->gender,
            'phone' => $request->phone,
            'employee_id' => $request->employee_id,
            'joining_date' => $request->joining_date,
            'employment_type' => $request->employment_type,
            'custom_leave_year' => $request->custom_leave_year,
            'custom_cl' => $request->custom_cl,
            'custom_sl' => $request->custom_sl,
            'custom_el' => $request->custom_el,
        ]);

        return redirect()->route('admin.employees.index')->with('success', 'Employee profile created successfully.');
    }

    /**
     * Update the specified employee in storage.
     */
    public function update(Request $request, User $employee)
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
                Rule::unique('users')->ignore($employee->id),
                'regex:/^EMP-\d+$/'
            ],
            'designation_id' => 'nullable|exists:designations,id',
            'joining_date' => 'required|date',
            'employment_type' => 'required|string|in:Full-time,Probation,Intern',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($employee->id),
            ],
            'password' => 'nullable|string|min:8',
            'custom_leave_year' => 'nullable|integer',
            'custom_cl' => 'nullable|integer',
            'custom_sl' => 'nullable|integer',
            'custom_el' => 'nullable|integer',
        ], [
            'employee_id.regex' => 'The Employee ID must start with "EMP-" followed by a sequence number.',
        ]);

        $role = 'employee';
        if ($request->designation_id) {
            $designation = Designation::find($request->designation_id);
            if ($designation) {
                $role = $designation->role;
            }
        }

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $role,
            'designation_id' => $request->designation_id,
            'dob' => $request->dob,
            'gender' => $request->gender,
            'phone' => $request->phone,
            'employee_id' => $request->employee_id,
            'joining_date' => $request->joining_date,
            'employment_type' => $request->employment_type,
            'custom_leave_year' => $request->custom_leave_year,
            'custom_cl' => $request->custom_cl,
            'custom_sl' => $request->custom_sl,
            'custom_el' => $request->custom_el,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $employee->update($data);

        return redirect()->route('admin.employees.index')->with('success', 'Employee profile updated successfully.');
    }

    /**
     * Remove the specified employee from storage.
     */
    public function destroy(User $employee)
    {
        $this->checkAccess();
        
        // Prevent deleting oneself
        if (request()->user()->id === $employee->id) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        // Prevent deleting admins
        if (in_array($employee->role, ['admin', 'superadmin'])) {
            abort(403, 'You cannot delete an administrator account.');
        }

        $employee->delete();

        return redirect()->route('admin.employees.index')->with('success', 'Employee deleted successfully.');
    }
}
