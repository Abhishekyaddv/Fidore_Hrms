<?php

namespace App\Http\Controllers;

use App\Models\CompanyPolicy;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class CompanyPolicyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $policies = CompanyPolicy::orderBy('created_at', 'desc')->get();
        return Inertia::render('CompanyPolicies', [
            'policies' => $policies,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!request()->user()?->hasAdminAccess()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'status' => 'required|string',
            'audience' => 'required|string',
            'icon' => 'nullable|string',
            'document' => 'required|file|mimes:pdf,doc,docx|max:10240', // 10MB max
        ]);

        if ($request->hasFile('document')) {
            $path = $request->file('document')->store('policies', 'public');
            $validated['document_path'] = $path;
        }

        if (empty($validated['icon'])) {
            $validated['icon'] = 'file-text';
        }

        CompanyPolicy::create($validated);

        return redirect()->back()->with('success', 'Policy created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CompanyPolicy $companyPolicy)
    {
        if (!request()->user()?->hasAdminAccess()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'status' => 'required|string',
            'audience' => 'required|string',
            'icon' => 'nullable|string',
            'document' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        if ($request->hasFile('document')) {
            // Delete old
            if ($companyPolicy->document_path) {
                Storage::disk('public')->delete($companyPolicy->document_path);
            }
            $path = $request->file('document')->store('policies', 'public');
            $validated['document_path'] = $path;
        }

        $companyPolicy->update($validated);

        return redirect()->back()->with('success', 'Policy updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CompanyPolicy $companyPolicy)
    {
        if (!request()->user()?->hasAdminAccess()) {
            abort(403);
        }

        if ($companyPolicy->document_path) {
            Storage::disk('public')->delete($companyPolicy->document_path);
        }

        $companyPolicy->delete();

        return redirect()->back()->with('success', 'Policy deleted successfully.');
    }
}
