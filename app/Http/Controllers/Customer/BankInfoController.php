<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Bank;
use App\Supports\StickyAlert;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BankInfoController extends Controller
{


    /**
     * جستجوی بانک‌ها برای Select2 AJAX
     */
    public function search(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'limit'  => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $search = trim($validated['search'] ?? '');
        $limit = (int) ($validated['limit'] ?? 5);

        $banks = Bank::search($search, $limit);

        return response()->json([
            'results' => collect($banks)->map(fn($bank) => [
                'value' => $bank['id'],
                'label' => $bank['name'],
                'icon'  => !empty($bank['icon'])
                    ? asset('storage/' . $bank['icon'])
                    : null,
            ])->values(),

            'pagination' => [
                'more' => count($banks) >= $limit,
            ],
        ]);
    }

    /**
     * دریافت یک بانک خاص برای مقدار اولیه
     */
    public function show(Bank $bank)
    {
        return response()->json([
            'value' => $bank->id,
            'label' => $bank->name,
            'icon'  => $bank->icon
                ? asset('storage/' . $bank->icon)
                : null,
        ]);
    }
    /**
     * نمایش صفحه اطلاعات بانکی
     */
    public function showBankInfo()
    {
        $user = auth()->user()->load('bank');

        return Inertia::render('Customer/Profile/BankInfo', [
            'bankInfo' => [
                'bank_id' => $user->bank_id,
                'bank_name' => $user->bank?->name,
                'account_holder_name' => $user->account_holder_name,
                'card_number'         => $user->card_number,
                'sheba_number'        => $user->sheba_number,
                'has_bank_info'       => !empty($user->card_number) || !empty($user->sheba_number),
            ],
        ]);
    }

    /**
     * ذخیره اطلاعات بانکی
     */
    public function update(Request $request)
    {



        $validated = $request->validate([
            'bank_id' => [
                'required',
                'integer',
                Rule::exists('banks', 'id'),
            ],
            'account_holder_name' => [
                'required',
                'string',
                'max:255',
            ],
            'card_number' => [
                'nullable',
                'digits:16',
            ],
            'sheba_number' => [
                'nullable',
                'regex:/^\d{24}$/',
            ],
        ]);

        if (
            empty($validated['card_number']) &&
            empty($validated['sheba_number'])
        ) {
            return back()->withErrors([
                'card_number' =>
                'حداقل یکی از شماره کارت یا شماره شبا الزامی است.',
            ]);
        }

        $user = $request->user();
        $bank = Bank::findOrFail($validated['bank_id']);
        $user->bank_id = $validated['bank_id'];
        $user->bank_name = $bank->name;
        $user->account_holder_name = $validated['account_holder_name'];
        $user->card_number = $validated['card_number'] ?? null;
        $user->sheba_number = $validated['sheba_number'] ?? null;

        $user->save();

        // auth()->user()->update($validated);
        StickyAlert::alert('اطلاعات بانکی با موفقیت ذخیره شد.', 'success');
        return redirect()->back();
    }
}
