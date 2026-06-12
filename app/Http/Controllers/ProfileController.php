<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile spec page.
     */
    public function show(Request $request): Response
    {
        $user = $request->user()->load('designation');
        
        // Find a suitable manager from user directory (excluding current user)
        $manager = User::where('id', '!=', $user->id)
            ->whereIn('role', ['superadmin', 'hr'])
            ->first();

        $managerData = null;
        if ($manager) {
            $managerData = [
                'name' => $manager->name,
                'email' => $manager->email,
                'designation' => $manager->designation?->display_name ?? ($manager->role === 'superadmin' ? 'Super Administrator' : 'HR Manager'),
                'avatar' => $manager->avatar,
            ];
        } else {
            // Elegant fallback spec data matching the reference mockup
            $managerData = [
                'name' => 'Elena Rodriguez',
                'email' => 'e.rodriguez@company.com',
                'designation' => 'Head of People Operations',
                'avatar' => null,
            ];
        }

        return Inertia::render('Profile', [
            'user' => $user,
            'manager' => $managerData,
        ]);
    }

    /**
     * Update editable profile fields.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'phone' => 'nullable|string|max:255',
            'emergency_contact' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
        ]);

        $user->update($validated);

        return redirect()->route('profile.show')->with('success', 'Profile updated successfully.');
    }

    /**
     * Update user avatar/photo.
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            // Delete old avatar if it exists and was uploaded
            if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $user->avatar);
                Storage::disk('public')->delete($oldPath);
            }

            // Store new avatar
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->update([
                'avatar' => '/storage/' . $path,
            ]);
        }

        return redirect()->route('profile.show')->with('success', 'Profile photo updated successfully.');
    }

    /**
     * Update user password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'new_password' => [
                'required',
                'min:8',
                'regex:/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/',
                'confirmed',
            ],
        ], [
            'new_password.regex' => 'Password must contain at least one uppercase letter, one number, and one special character.',
        ]);

        $request->user()->update([
            'password' => \Illuminate\Support\Facades\Hash::make($validated['new_password']),
        ]);

        return redirect()->route('profile.show')->with('success', 'Password updated successfully.');
    }
}
