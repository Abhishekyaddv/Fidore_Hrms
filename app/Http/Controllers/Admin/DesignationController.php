<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Designation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DesignationController extends Controller
{
    /**
     * Helper to enforce admin authorization manually.
     */
    protected function checkAdmin()
    {
        if (!request()->user()?->hasAdminAccess()) {
            abort(403);
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->checkAdmin();

        $search = $request->input('search');

        $designations = Designation::withCount('users')
            ->when($search, function ($query, $search) {
                $query->where('display_name', 'like', "%{$search}%");
            })
            ->get();

        $totalDesignations = Designation::count();
        $activeDepartments = 0;
        $unassignedEmployees = User::whereNull('designation_id')
            ->where('role', 'employee')
            ->count();

        return Inertia::render('Admin/Designations', [
            'designations' => $designations,
            'stats' => [
                'total_designations' => $totalDesignations,
                'active_departments' => $activeDepartments,
                'unassigned_employees' => $unassignedEmployees,
            ],
            'filters' => [
                'search' => $search
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'role' => 'required|string|in:employee,hr,superadmin',
        ]);

        $camelName = Str::camel($validated['name']);

        // Check if camelCase name already exists
        if (Designation::where('name', $camelName)->exists()) {
            return back()->withErrors(['name' => 'A designation with this name already exists.']);
        }

        Designation::create([
            'name' => $camelName,
            'display_name' => $validated['name'],
            'description' => $validated['description'],
            'role' => $validated['role'],
        ]);

        return redirect()->route('admin.designations.index')->with('success', 'Designation created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Designation $designation)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'role' => 'required|string|in:employee,hr,superadmin',
        ]);

        $camelName = Str::camel($validated['name']);

        // Check if camelCase name already exists on other records
        if (Designation::where('name', $camelName)->where('id', '!=', $designation->id)->exists()) {
            return back()->withErrors(['name' => 'A designation with this name already exists.']);
        }

        $designation->update([
            'name' => $camelName,
            'display_name' => $validated['name'],
            'description' => $validated['description'],
            'role' => $validated['role'],
        ]);

        // Sync role to all users with this designation
        User::where('designation_id', $designation->id)->update(['role' => $validated['role']]);

        return redirect()->route('admin.designations.index')->with('success', 'Designation updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Designation $designation)
    {
        $this->checkAdmin();

        $designation->delete();

        return redirect()->route('admin.designations.index')->with('success', 'Designation deleted successfully.');
    }
}
