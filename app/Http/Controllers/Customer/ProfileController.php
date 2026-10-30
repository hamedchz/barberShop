<?php

namespace App\Http\Controllers\Customer;

use App\Enums\Casts\UserStatus;
use App\Http\Controllers\Controller;
use App\Models\Bank;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * نمایش صفحه ویرایش پروفایل
     */
    public function edit()
    {
        $user = auth()->user()->load('bank');



        return Inertia::render('Customer/Profile/Edit', [
            'user' => [
                'id'            => $user->id,
                'name'          => $user->name,
                'email'         => $user->email,
                'phone'         => $user->phone,
                'phone_verified' => !is_null($user->phone_verified_at),
                'avatar'        => $user->avatar,
                'thumbnail'     => $user->avatarUrl(),
                'bio'           => $user->bio,
                'address'       => $user->address,
                'birth_date'    => $user->birth_date?->format('Y-m-d'),
                'gender'        => $user->gender,
                'city'          => $user->city,
                'status'        => $user->status?->value,
                'created_at'    => $user->created_at,
                'has_password'  => !is_null($user->password),
            ],
            'bankInfo' => [
                'bank_id'             => $user->bank_id,
                'bank_name'           => $user->bank?->name,
                'account_holder_name' => $user->account_holder_name,
                'card_number'         => $user->card_number,
                'sheba_number'        => $user->sheba_number,

                'has_bank_info' => !empty($user->card_number)
                    || !empty($user->sheba_number),
            ],
            'banks'                   => [],

        ]);
    }

    /**
     * آپدیت اطلاعات پایه
     */
    public function update(Request $request)
    {

        $user = auth()->user();

        $validated = $request->validate([
            'name'       => 'required|string|min:2|max:100',
            'email'      => 'nullable|email|max:150|unique:users,email,' . $user->id,
            'bio'        => 'nullable|string|max:500',
            'address'    => 'nullable|string|max:500',
            'city'       => 'nullable|string|max:100',
            'birth_date' => 'nullable|date|before:today',
            'gender'     => 'nullable|in:male,female,other',
        ], [
            'name.required' => 'لطفاً نام خود را وارد کنید.',
            'name.min'      => 'نام باید حداقل ۲ کاراکتر باشد.',
            'email.required' => 'لطفاً ایمیل خود را وارد کنید.',
            'email.email'   => 'فرمت ایمیل صحیح نیست.',
            'email.unique'  => 'این ایمیل قبلاً ثبت شده است.',
            'bio.max'       => 'بیوگرافی نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد.',
        ]);

        $user->update($validated);
        StickyAlert::toast('اطلاعات با موفقیت ذخیره شد.', 'success');
        return redirect()->back();
    }

    /**
     * آپدیت آواتار
     */
    public function updateAvatar(Request $request)
    {
        $validated = $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ], [
            'avatar.required' => 'لطفاً یک تصویر انتخاب کنید.',
            'avatar.image'    => 'فایل باید تصویر باشد.',
            'avatar.mimes'    => 'فرمت‌های مجاز: JPG, PNG, WEBP',
            'avatar.max'      => 'حجم تصویر نمی‌تواند بیشتر از ۲ مگابایت باشد.',
        ]);

        $user = auth()->user();

        // حذف آواتار قبلی
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        // ذخیره آواتار جدید
        $path = $request->file('avatar')->store('avatars/customers', 'public');
        $user->update(['avatar' => $path]);
        StickyAlert::toast('آواتار با موفقیت تغییر کرد.', 'success');
        return redirect()->back();
    }

    /**
     * حذف آواتار
     */
    public function deleteAvatar()
    {
        $user = auth()->user();

        if ($user->avatar) {

            Storage::disk('public')->delete($user->avatar);
            $user->update(['avatar' => null]);
        }
        StickyAlert::toast('آواتار حذف شد.', 'success');
        return redirect()->back();
    }

    /**
     * تغییر رمز عبور
     */
    public function updatePassword(Request $request)
    {

        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->numbers(),
            ],
        ], [
            'current_password.required' => 'لطفاً رمز عبور فعلی را وارد کنید.',
            'password.required'         => 'لطفاً رمز عبور جدید را وارد کنید.',
            'password.confirmed'        => 'تأیید رمز عبور با رمز عبور جدید مطابقت ندارد.',
            'password.min'              => 'رمز عبور باید حداقل ۸ کاراکتر باشد.',
            'password.letters'          => 'رمز عبور باید حداقل شامل یک حرف انگلیسی باشد.',
            'password.numbers'          => 'رمز عبور باید حداقل شامل یک عدد باشد.',
        ]);


        $user = auth()->user();

        // چک رمز فعلی
        if (!Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors([
                'current_password' => 'رمز عبور فعلی صحیح نیست.',
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);
        StickyAlert::toast('رمز عبور با موفقیت تغییر کرد.', 'success');
        return redirect()->back();
    }

    /**
     * آپدیت اطلاعات بانکی
     */
    public function updateBankInfo(Request $request)
    {
        $validated = $request->validate([
            'bank_id'             => 'nullable|exists:banks,id',
            'bank_name'           => 'nullable|string|max:100',
            'account_holder_name' => 'nullable|string|max:150',
            'card_number'         => 'nullable|string|size:16',
            'sheba_number'        => 'nullable|string|size:24',
        ], [
            'card_number.size'  => 'شماره کارت باید ۱۶ رقم باشد.',
            'sheba_number.size' => 'شماره شبا باید ۲۴ رقم باشد.',
        ]);

        auth()->user()->update($validated);
        StickyAlert::toast('اطلاعات بانکی ذخیره شد.', 'success');
        return redirect()->back();
    }
}
