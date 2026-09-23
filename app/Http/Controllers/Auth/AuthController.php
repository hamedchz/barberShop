<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function show()
    {

        return Inertia::render('Auth/Login');
    }

    public function store(Request $request)
    {
        $credentials = $request->validate([
            'phone'    => ['required', 'string', 'regex:/^09\d{9}$/'],
            'password' => ['required', 'string', 'min:8'],
        ], [
            'phone.required'    => 'شماره موبایل الزامی است.',
            'phone.regex'       => 'شماره موبایل معتبر نیست.',
            'password.required' => 'رمز عبور الزامی است.',
            'password.min'      => 'رمز عبور حداقل 8 کاراکتر باشد.',
        ]);
        // پیدا کردن کاربر برای بررسی تأیید شماره تلفن
        $user = User::where('phone', $credentials['phone'])->first();

        if ($user && is_null($user->phone_verified_at)) {
            throw ValidationException::withMessages([
                'phone' => 'شماره تلفن شما تأیید نشده است. لطفاً ابتدا آن را تأیید کنید.',
            ]);
        }

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'phone' => 'شماره موبایل یا رمز عبور اشتباه است.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard'));
    }

    public function destroy(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
