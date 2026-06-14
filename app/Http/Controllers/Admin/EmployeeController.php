<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $totalStaff = $employees->total();
        
        $activeAttendances = \App\Models\Attendance::with('user')
            ->where('date', now()->toDateString())
            ->whereNotNull('punch_in')
            ->whereNull('punch_out')
            ->get();
            
        $activeNow = $activeAttendances->count();
        
        $activeEmployeesList = $activeAttendances->map(function ($att) {
            return [
                'id' => $att->user->id,
                'name' => $att->user->name,
                'email' => $att->user->email,
                'role' => $att->user->role,
                'avatar' => $att->user->avatar,
                'punch_in' => $att->punch_in,
            ];
        });

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

        return Inertia::render('Admin/EmployeeDirectory', [
            'employees' => $employees,
            'totalStaff' => $totalStaff,
            'activeNow' => $activeNow,
            'nextEmployeeId' => $nextEmployeeId,
            'activeEmployeesList' => $activeEmployeesList,
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
            'dob' => 'required|date',
            'gender' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'employee_id' => [
                'required',
                'string',
                'unique:users,employee_id',
                'regex:/^EMP-\d+$/' // Must start with EMP- followed by numbers
            ],
            'role' => 'required|string|in:employee,hr',
            'joining_date' => 'required|date',
            'employment_type' => 'required|string|in:Full-time,Probation,Intern',
            'email' => 'required|string|email|max:255|unique:users,email',
            'reporting_manager_id' => 'nullable|exists:users,id',
        ], [
            'employee_id.regex' => 'The Employee ID must start with "EMP-" followed by a sequence number.',
        ]);

        $role = $request->role;

        $dobYear = \Carbon\Carbon::parse($request->dob)->format('Y');
        $firstNameParts = explode(' ', trim($request->name));
        $firstWord = $firstNameParts[0];
        $firstWordClean = preg_replace('/[^a-zA-Z]/', '', $firstWord);
        if (strlen($firstWordClean) < 4) {
            $baseName = str_pad($firstWordClean, 4, 'x', STR_PAD_RIGHT);
        } else {
            $baseName = substr($firstWordClean, 0, 4);
        }
        $baseName = ucfirst(strtolower($baseName));
        $generatedPassword = $baseName . '@' . $dobYear;

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($generatedPassword),
            'role' => $role,
            'dob' => $request->dob,
            'gender' => $request->gender,
            'phone' => $request->phone,
            'employee_id' => $request->employee_id,
            'joining_date' => $request->joining_date,
            'employment_type' => $request->employment_type,
            'reporting_manager_id' => $request->reporting_manager_id,
        ]);

        return redirect()->route('admin.employees.index')->with('success', 'Employee profile created successfully. Auto-generated password: ' . $generatedPassword);
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
            'role' => 'required|string|in:employee,hr',
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
            'reporting_manager_id' => 'nullable|exists:users,id',
        ], [
            'employee_id.regex' => 'The Employee ID must start with "EMP-" followed by a sequence number.',
        ]);

        $role = $request->role;

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $role,
            'dob' => $request->dob,
            'gender' => $request->gender,
            'phone' => $request->phone,
            'employee_id' => $request->employee_id,
            'joining_date' => $request->joining_date,
            'employment_type' => $request->employment_type,
            'reporting_manager_id' => $request->reporting_manager_id,
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

    public function regularizeAttendance(Request $request, $id)
    {
        $this->checkAccess();

        $request->validate([
            'date' => 'required|date',
            'in_time' => 'required|date_format:H:i',
            'out_time' => 'required|date_format:H:i',
        ]);

        $user = \App\Models\User::findOrFail($id);
        $date = $request->date;
        $inTime = \Carbon\Carbon::parse("$date {$request->in_time}");
        $outTime = \Carbon\Carbon::parse("$date {$request->out_time}");

        if ($outTime->lt($inTime)) {
            return back()->withErrors(['out_time' => 'Out time cannot be before punch-in time.']);
        }

        // Check if employee has already been regularized 2 times this month
        $startOfMonth = \Carbon\Carbon::parse($date)->startOfMonth()->toDateString();
        $endOfMonth = \Carbon\Carbon::parse($date)->endOfMonth()->toDateString();
        
        $regularizationCount = \App\Models\Attendance::where('user_id', $user->id)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->where('is_regularized', true)
            ->count();

        if ($regularizationCount >= 2) {
            return back()->withErrors(['regularize' => 'Employee has already reached the maximum of 2 regularizations this month.']);
        }

        $attendance = \App\Models\Attendance::firstOrCreate(
            ['user_id' => $user->id, 'date' => $date],
            [
                'punch_history' => [],
                'total_logged_minutes' => 0,
                'is_regularized' => false,
            ]
        );

        $history = is_array($attendance->punch_history) ? $attendance->punch_history : [];
        
        // If there's an open session, close it. Otherwise, add a new session.
        if (!empty($history) && end($history)['out'] === null) {
            $lastIndex = count($history) - 1;
            // Optionally update the in_time of the open session if provided?
            // The user expects the provided in_time and out_time to be used.
            $history[$lastIndex]['in'] = $inTime->toIso8601String();
            $history[$lastIndex]['out'] = $outTime->toIso8601String();
        } else {
            // Append new session
            $history[] = [
                'in' => $inTime->toIso8601String(),
                'out' => $outTime->toIso8601String()
            ];
        }

        $totalMinutes = 0;
        foreach ($history as $session) {
            if ($session['out']) {
                $sessionIn = \Carbon\Carbon::parse($session['in']);
                $sessionOut = \Carbon\Carbon::parse($session['out']);
                $totalMinutes += $sessionIn->diffInMinutes($sessionOut);
            }
        }

        $attendance->update([
            'punch_in' => $history[0]['in'],
            'punch_out' => end($history)['out'],
            'punch_history' => $history,
            'total_logged_minutes' => $totalMinutes,
            'is_regularized' => true,
            'regularized_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Attendance regularized successfully.');
    }

    public function getAttendanceCalendar(Request $request, $id)
    {
        $this->checkAccess();

        $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer',
        ]);

        $attendances = \App\Models\Attendance::where('user_id', $id)
            ->whereMonth('date', $request->month)
            ->whereYear('date', $request->year)
            ->get(['date', 'total_logged_minutes', 'punch_history', 'is_regularized']);

        return response()->json($attendances);
    }
}
