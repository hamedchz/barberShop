<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Bank;
use Illuminate\Http\Request;

class BankController extends Controller
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
}
