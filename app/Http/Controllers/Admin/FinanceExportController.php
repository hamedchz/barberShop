<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Casts\WalletTransactionStatus;
use App\Enums\Casts\WalletTransactionType;
use App\Http\Controllers\Controller;
use App\Models\Settlement;
use App\Models\WalletDeposit;
use App\Models\WalletTransaction;
use Carbon\Carbon;
use Illuminate\Http\Request;

class FinanceExportController extends Controller
{
    /**
     * خروجی CSV از گزارش درآمد
     */
    public function revenueCsv(Request $request)
    {
        $period = $request->input('period', '30');
        [$startDate, $endDate] = $this->getPeriodDates($period);

        $transactions = WalletTransaction::whereIn('type', [
            WalletTransactionType::commission->value,
            WalletTransactionType::penalty->value,
        ])
            ->where('status', WalletTransactionStatus::completed->value)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->with(['user:id,name,phone'])
            ->latest()
            ->get();

        $filename = 'revenue-report-' . now()->format('Y-m-d-His') . '.csv';

        return $this->streamCsv($filename, function ($file) use ($transactions, $startDate, $endDate) {
            // ============ اطلاعات هدر ============
            fputcsv($file, ['گزارش درآمد پلتفرم']);
            fputcsv($file, ['دوره:', $this->toJalali($startDate) . ' تا ' . $this->toJalali($endDate)]);
            fputcsv($file, ['تاریخ تولید:', $this->toJalali(now())]);
            fputcsv($file, ['تعداد تراکنش:', $transactions->count()]);
            fputcsv($file, ['مجموع درآمد:', number_format($transactions->sum('amount')) . ' تومان']);
            fputcsv($file, []);

            // ============ هدر جدول ============
            fputcsv($file, [
                'کد تراکنش',
                'کاربر',
                'شماره تماس',
                'نوع درآمد',
                'مبلغ (تومان)',
                'توضیحات',
                'تاریخ',
            ]);

            // ============ دادهها ============
            foreach ($transactions as $t) {
                fputcsv($file, [
                    $t->id,
                    $t->user?->name ?? '—',
                    $t->user?->phone ?? '—',
                    $t->type->label(),
                    (float) $t->amount,
                    $t->description ?? '—',
                    $this->toJalali($t->created_at),
                ]);
            }

            // ============ جمع کل ============
            fputcsv($file, []);
            fputcsv($file, [
                'جمع کل',
                '',
                '',
                '',
                (float) $transactions->sum('amount'),
                '',
                '',
            ]);
        });
    }

    /**
     * خروجی CSV از تسویهها
     */
    public function settlementsCsv(Request $request)
    {
        $query = Settlement::with(['user:id,name,phone']);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->where('created_at', '>=', Carbon::parse($dateFrom)->startOfDay());
        }
        if ($dateTo = $request->input('date_to')) {
            $query->where('created_at', '<=', Carbon::parse($dateTo)->endOfDay());
        }

        $settlements = $query->latest()->get();

        $filename = 'settlements-report-' . now()->format('Y-m-d-His') . '.csv';

        return $this->streamCsv($filename, function ($file) use ($settlements) {
            // ============ هدر اطلاعات ============
            fputcsv($file, ['گزارش تسویهها']);
            fputcsv($file, ['تاریخ تولید:', $this->toJalali(now())]);
            fputcsv($file, ['تعداد:', $settlements->count()]);
            fputcsv($file, ['مجموع:', number_format($settlements->sum('amount')) . ' تومان']);
            fputcsv($file, []);

            // ============ هدر جدول ============
            fputcsv($file, [
                'کد تسویه',
                'کاربر',
                'شماره تماس',
                'نوع',
                'مبلغ (تومان)',
                'وضعیت',
                'بانک',
                'شماره کارت',
                'شماره پیگیری',
                'تاریخ درخواست',
                'تاریخ تکمیل',
                'دلیل خطا',
            ]);

            // ============ دادهها ============
            foreach ($settlements as $s) {
                fputcsv($file, [
                    $s->id,
                    $s->user?->name ?? '—',
                    $s->user?->phone ?? '—',
                    $s->type->label(),
                    (float) $s->amount,
                    $s->status->label(),
                    $s->bank_name ?? '—',
                    $s->card_number ?? '—',
                    $s->bank_reference ?? '—',
                    $this->toJalali($s->requested_at ?? $s->created_at),
                    $s->completed_at ? $this->toJalali($s->completed_at) : '—',
                    $s->failure_reason ?? '—',
                ]);
            }

            // ============ جمع کل ============
            fputcsv($file, []);
            fputcsv($file, [
                'جمع کل',
                '',
                '',
                '',
                (float) $settlements->sum('amount'),
                '',
                '',
                '',
                '',
                '',
                '',
                '',
            ]);
        });
    }

    /**
     * خروجی CSV از شارژهای کیف پول
     */
    public function depositsCsv(Request $request)
    {
        $query = WalletDeposit::with(['user:id,name,phone']);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->where('created_at', '>=', Carbon::parse($dateFrom)->startOfDay());
        }
        if ($dateTo = $request->input('date_to')) {
            $query->where('created_at', '<=', Carbon::parse($dateTo)->endOfDay());
        }

        $deposits = $query->latest()->get();

        $filename = 'deposits-report-' . now()->format('Y-m-d-His') . '.csv';

        return $this->streamCsv($filename, function ($file) use ($deposits) {
            // ============ هدر اطلاعات ============
            fputcsv($file, ['گزارش شارژهای کیف پول']);
            fputcsv($file, ['تاریخ تولید:', $this->toJalali(now())]);
            fputcsv($file, ['تعداد:', $deposits->count()]);
            fputcsv($file, ['مجموع:', number_format($deposits->sum('amount')) . ' تومان']);
            fputcsv($file, []);

            // ============ هدر جدول ============
            fputcsv($file, [
                'کد شارژ',
                'کاربر',
                'شماره تماس',
                'مبلغ (تومان)',
                'مبلغ پرداختی',
                'وضعیت',
                'درگاه',
                'کد پیگیری',
                'تاریخ پرداخت',
                'تاریخ ایجاد',
                'دلیل خطا',
            ]);

            // ============ دادهها ============
            foreach ($deposits as $d) {
                fputcsv($file, [
                    $d->id,
                    $d->user?->name ?? '—',
                    $d->user?->phone ?? '—',
                    (float) $d->amount,
                    (float) ($d->paid_amount ?? 0),
                    $d->status->label(),
                    $d->gateway ?? '—',
                    $d->tracking_code ?? '—',
                    $d->paid_at ? $this->toJalali($d->paid_at) : '—',
                    $this->toJalali($d->created_at),
                    $d->failure_reason ?? '—',
                ]);
            }

            // ============ جمع کل ============
            fputcsv($file, []);
            fputcsv($file, [
                'جمع کل',
                '',
                '',
                (float) $deposits->sum('amount'),
                (float) $deposits->sum('paid_amount'),
                '',
                '',
                '',
                '',
                '',
                '',
            ]);
        });
    }

    /**
     * خروجی CSV از تراکنشها
     */
    public function transactionsCsv(Request $request)
    {
        $query = WalletTransaction::with(['user:id,name,phone']);

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }
        if ($direction = $request->input('direction')) {
            $query->where('direction', $direction);
        }
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }
        if ($dateFrom = $request->input('date_from')) {
            $query->where('created_at', '>=', Carbon::parse($dateFrom)->startOfDay());
        }
        if ($dateTo = $request->input('date_to')) {
            $query->where('created_at', '<=', Carbon::parse($dateTo)->endOfDay());
        }

        $transactions = $query->latest()->get();

        $filename = 'transactions-report-' . now()->format('Y-m-d-His') . '.csv';

        return $this->streamCsv($filename, function ($file) use ($transactions) {
            // ============ هدر اطلاعات ============
            fputcsv($file, ['گزارش تراکنشها']);
            fputcsv($file, ['تاریخ تولید:', $this->toJalali(now())]);
            fputcsv($file, ['تعداد:', $transactions->count()]);
            fputcsv($file, []);

            // ============ هدر جدول ============
            fputcsv($file, [
                'کد تراکنش',
                'کاربر',
                'شماره تماس',
                'نوع',
                'جهت',
                'مبلغ (تومان)',
                'موجودی قبل',
                'موجودی بعد',
                'وضعیت',
                'توضیحات',
                'قفلشده',
                'تاریخ',
            ]);

            // ============ دادهها ============
            foreach ($transactions as $t) {
                fputcsv($file, [
                    $t->id,
                    $t->user?->name ?? '—',
                    $t->user?->phone ?? '—',
                    $t->type->label(),
                    $t->direction->label(),
                    (float) $t->amount,
                    (float) $t->balance_before,
                    (float) $t->balance_after,
                    $t->status->label(),
                    $t->description ?? '—',
                    $t->is_locked ? 'بله' : 'خیر',
                    $this->toJalali($t->created_at),
                ]);
            }
        });
    }

    // ============================================
    // متدهای کمکی
    // ============================================

    /**
     * استریم CSV به مرورگر (روش بهینه برای دادههای زیاد)
     */
    private function streamCsv(string $filename, callable $callback)
    {
        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0',
        ];

        return response()->stream(function () use ($callback) {
            $file = fopen('php://output', 'w');

            // ✅ BOM برای UTF-8 (تا Excel فارسی رو درست نشون بده)
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            $callback($file);

            fclose($file);
        }, 200, $headers);
    }

    /**
     * گرفتن بازه تاریخ بر اساس period
     */
    private function getPeriodDates(string $period): array
    {
        $endDate = now();

        $startDate = match ($period) {
            '7'     => now()->subDays(7),
            '30'    => now()->subDays(30),
            '90'    => now()->subDays(90),
            '365'   => now()->subYear(),
            default => now()->subDays(30),
        };

        return [$startDate, $endDate];
    }

    /**
     * تبدیل میلادی به شمسی (بدون پکیج)
     */
    private function toJalali($date): string
    {
        if (!$date) return '-';

        $d = Carbon::parse($date);
        $gy = $d->year;
        $gm = $d->month;
        $gd = $d->day;

        $g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        $gy2 = ($gm > 2) ? ($gy + 1) : $gy;
        $days = 355666 + (365 * $gy) + ((int)(($gy2 + 3) / 4)) - ((int)(($gy2 + 99) / 100)) + ((int)(($gy2 + 399) / 400)) + $gd + $g_d_m[$gm - 1];
        $jy = -1595 + (33 * ((int)($days / 12053)));
        $days %= 12053;
        $jy += 4 * ((int)($days / 1461));
        $days %= 1461;

        if ($days > 365) {
            $jy += (int)(($days - 1) / 365);
            $days = ($days - 1) % 365;
        }

        if ($days < 186) {
            $jm = 1 + (int)($days / 31);
            $jd = 1 + ($days % 31);
        } else {
            $jm = 7 + (int)(($days - 186) / 30);
            $jd = 1 + (($days - 186) % 30);
        }

        return sprintf('%04d/%02d/%02d %02d:%02d', $jy, $jm, $jd, $d->hour, $d->minute);
    }
}
