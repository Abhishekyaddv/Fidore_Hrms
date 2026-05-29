<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class CheckBearerToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if ($token) {
            $accessToken = PersonalAccessToken::findToken($token);

            if (!$accessToken || $this->isExpired($accessToken)) {
                return $this->logoutAndRedirect($request);
            }
        } else {
            // For full page loads (browser refreshes), we don't receive the Bearer token header.
            // We must verify the session user still has a valid active token in the DB.
            $user = $request->user();
            
            if (!$user) {
                return $this->logoutAndRedirect($request);
            }

            $hasValidToken = false;
            foreach ($user->tokens as $dbToken) {
                if (!$this->isExpired($dbToken)) {
                    $hasValidToken = true;
                    break;
                }
            }

            if (!$hasValidToken) {
                return $this->logoutAndRedirect($request);
            }
        }

        // Proceed with the request
        return $next($request);
    }

    protected function isExpired($accessToken): bool
    {
        $expirationTime = config('sanctum.expiration');

        if (!$expirationTime) {
            return false;
        }

        return $accessToken->created_at->lte(now()->subMinutes($expirationTime));
    }

    protected function logoutAndRedirect(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // If it's an API/XHR request from Inertia without a valid token, Inertia will handle 401/403 or redirect
        if ($request->wantsJson()) {
            return response()->json(['message' => 'Unauthenticated or token expired.'], 401);
        }

        return redirect()->route('login')->withErrors(['email' => 'Your session has expired or is invalid. Please log in again.']);
    }
}
