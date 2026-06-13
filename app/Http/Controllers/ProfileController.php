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
        $user = $request->user();
        
        // Find the assigned manager from user relationships
        $manager = $user->reportingManager;

        $managerData = null;
        if ($manager) {
            $managerData = [
                'name' => $manager->name,
                'email' => $manager->email,
                'designation' => $manager->role === 'superadmin' ? 'Super Administrator' : ($manager->role === 'hr' ? 'HR Manager' : 'Manager'),
                'avatar' => $manager->avatar,
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
            if ($user->avatar && str_starts_with($user->avatar, '/avatars/')) {
                $oldFilename = str_replace('/avatars/', '', $user->avatar);
                $oldPath = public_path('avatars/' . $oldFilename);
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            } elseif ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
                // Legacy path support
                $oldPath = str_replace('/storage/', '', $user->avatar);
                Storage::disk('public')->delete($oldPath);
            }

            // Store new avatar directly in public/avatars to avoid symlink issues on live servers
            $file = $request->file('avatar');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('avatars'), $filename);

            $user->update([
                'avatar' => '/avatars/' . $filename,
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
