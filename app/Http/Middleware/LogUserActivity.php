<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class LogUserActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {

            Cache::put(
                'user-is-online-' . auth()->id(),
                now()->toIso8601String(),
                now()->addMinutes(5)
            );
        }

        return $next($request);
    }
}
