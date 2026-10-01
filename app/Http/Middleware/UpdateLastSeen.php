<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateLastSeen
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    // app/Http/Middleware/UpdateLastSeen.php

    public function handle(Request $request, Closure $next)
    {
        if (auth()->check()) {
            User::where('id', auth()->id())
                ->update(['last_seen_at' => now()]);
        }

        return $next($request);
    }
}
