<?php

namespace App\Http\Controllers\Customer;

use App\Enums\Casts\BookingStatus;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Enums\Casts\PaymentStatus;
use App\Enums\Casts\TimeSlotStatus;
use App\Models\Payment;
use App\Models\Booking;
use App\Supports\StickyAlert;
use Inertia\Inertia;
use Shetabit\Multipay\Invoice as ShInvoice;
use Shetabit\Payment\Facade\Payment as ShPayment;

class PaymentController extends Controller
{
    /**
     * مرحله ۲: ریدایرکت به درگاه پرداخت
     */

    public function pay(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'gateway' => 'required|string',
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);

        // ساخت Payment
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'user_id' => auth()->id(),
            'amount' => $booking->amount,
            'gateway' => $validated['gateway'],
            'status' => 'pending',
        ]);

        // درگاه انتخاب‌شده
        config([
            'payment.default' => $validated['gateway'],
        ]);

        return ShPayment::purchase(
            (new ShInvoice)
                ->amount($payment->amount)
                ->detail([
                    'booking' => $payment->booking_id,
                    'Description' => "پرداخت رزرو #{$payment->booking_id}",
                ]),
            function ($driver, $transactionId) use ($payment) {
                $payment->update([
                    'transaction_id' => $transactionId,
                    'authority' => $transactionId,
                ]);
            }
        )->pay()->render();
    }
    public function pay2(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'gateway' => 'required|string',
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);

        // ============ بررسی مالکیت ============
        if ($booking->user_id !== auth()->id()) {
            abort(403);
        }

        if ($booking->status->value !== BookingStatus::pending->value) {
            StickyAlert::alert('این رزرو قابل پرداخت نیست.', 'error');
            return redirect()->back();
        }

        // ============ بررسی درگاه ============
        $gatewayConfig = config("payment.gateways.{$validated['gateway']}");
        // dd($gatewayConfig);
        if (!$gatewayConfig || !$gatewayConfig['enabled']) {
            StickyAlert::alert('این رزرو قابل پرداخت درگاه پرداخت معتبر نیست', 'error');
            return redirect()->back();
        }

        // ============ ایجاد رکورد پرداخت ============
        $payment = Payment::create([
            'user_id' => auth()->id(),
            'booking_id' => $booking->id,
            'gateway' => $validated['gateway'],
            'amount' => $booking->amount,
            'status' => PaymentStatus::pending->value,
        ]);

        // ============ ریدایرکت به درگاه ============
        return $this->redirectToGateway($payment, $gatewayConfig);
    }

    /**
     * مرحله ۳: بازگشت از درگاه (Callback)
     */
    public function callback(Request $request, string $gateway)
    {



        $authority = $request->input('Authority')
            ?? $request->input('authority');

        $status = $request->input('Status')
            ?? $request->input('status');

        $payment = Payment::where('authority', $authority)
            ->where('gateway', $gateway)
            ->where('status', PaymentStatus::pending->value)
            ->first();

        if (!$payment) {
            StickyAlert::alert(
                'پرداخت یافت نشد یا قبلاً بررسی شده است',
                'error'
            );

            return redirect()->back();
        }

        $booking = $payment->booking;

        try {

            // ============ Verify پرداخت ============
            $receipt = ShPayment::amount($payment->amount)
                ->transactionId($payment->transaction_id)
                ->verify();


            // ============ پرداخت موفق ============
            $payment->update([
                'status' => PaymentStatus::success->value,
                'paid_at' => now(),
                'gateway_response' => $receipt->response,
            ]);

            // ============ تایید رزرو ============
            $booking->update([
                'status' => BookingStatus::confirmed->value,
                'confirmed_at' => now(),
            ]);

            // ============ رزرو نهایی بازه ============
            $booking->timeSlot->update([
                'status' => TimeSlotStatus::booked->value,
                'booked_by' => $booking->user_id,
            ]);

            return redirect()->route(
                'customer.payment.success',
                $booking->id
            );
        } catch (\Throwable $e) {

            \Illuminate\Support\Facades\Log::error('Payment Verify Error', [
                'gateway' => $gateway,
                'payment_id' => $payment->id,
                'amount' => $payment->amount,
                'transaction_id' => $payment->transaction_id,
                'authority' => $payment->authority,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            // ============ پرداخت ناموفق ============
            $payment->update([
                'status' => PaymentStatus::failed->value,
                'gateway_response' => isset($receipt)
                    ? $receipt->response
                    : $e->getMessage(),
            ]);

            $booking->update([
                'status' => BookingStatus::cancelled->value,
                'cancelled_at' => now(),
            ]);

            // ============ آزاد کردن بازه ============
            $booking->timeSlot->update([
                'status' => TimeSlotStatus::available->value,
                'booked_by' => null,
            ]);

            return redirect()->route(
                'customer.payment.failed',
                $booking->id
            );
        }
    }

    /**
     * صفحه پرداخت موفق
     */
    public function success(Booking $booking)
    {
        if ($booking->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Customer/Payment/Success', [
            'booking' => [
                'id' => $booking->id,
                'amount' => $booking->amount,
                'date' => $booking->timeSlot->date,
                'start_time' => $booking->timeSlot->start_time,
                'end_time' => $booking->timeSlot->end_time,
                'barber' => [
                    'name' => $booking->barber->name,
                    'phone' => $booking->barber->phone,
                ],
                'service' => [
                    'name' => $booking->service->name,
                ],
                'transaction_id' => $booking->payment->transaction_id,
                'paid_at' => $booking->payment->paid_at,
            ],
        ]);
    }

    /**
     * صفحه پرداخت ناموفق
     */
    public function failed(Booking $booking)
    {
        if ($booking->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Customer/Payment/Failed', [
            'booking' => [
                'id' => $booking->id,
                'amount' => $booking->amount,
            ],
        ]);
    }

    // ============ توابع خصوصی ============

    /**
     * ریدایرکت به درگاه پرداخت
     */
    private function redirectToGateway(Payment $payment, array $config)
    {
        $payment = ShPayment::purchase(
            (new ShInvoice)
                ->amount($payment->amount)
                ->detail([
                    'booking' => $payment->booking_id,
                    'Description' => "پرداخت رزرو #{$payment->booking_id}",
                ]),
            function ($driver, $transactionId) use ($payment) {
                $payment->update([
                    'transaction_id' => $transactionId,
                ]);
            }
        );

        $result = $payment->pay();



        return ShPayment::purchase(
            (new ShInvoice)->amount($payment->amount)->detail([
                'booking' => $payment->booking_id,
                'Description' => "پرداخت رزرو #{$payment->booking_id}",
            ]),
            function ($driver, $transactionId) use ($payment) {
                $payment->update(['transaction_id' => $transactionId]);
            }
        )->pay()->render();



        // در اینجا باید SDK مربوط به درگاه را صدا بزنید
        // این یک نمونه ساده است

        switch ($payment->gateway) {
            case 'zarinpal':
                return $this->zarinpalRequest($payment, $config);
                // case 'idpay':
                //     return $this->idpayRequest($payment, $config);
                // ...
            case 'digipay':
                return $this->digipayRequest($payment, $config);
            default:
                return redirect()->back()
                    ->with('error', 'درگاه پشتیبانی نمی‌شود.');
        }
    }
    private function digipayRequest(Payment $payment, array $config)
    {
        $merchantId = $config['merchant_id'];
        $callbackUrl = route('customer.payment.callback', 'zarinpal');
        $amount = $payment->amount * 10; // زرین‌پال به ریال کار می‌کند

        // $data = [
        //     'MerchantID' => $merchantId,
        //     'Amount' => $amount,
        //     'CallbackURL' => $callbackUrl,
        //     'Description' => "پرداخت رزرو #{$payment->booking_id}",
        // ];

        // $ch = curl_init('https://api.zarinpal.com/pg/v4/payment/request.json');
        // curl_setopt_array($ch, [
        //     CURLOPT_RETURNTRANSFER => true,
        //     CURLOPT_POST => true,
        //     CURLOPT_POSTFIELDS => json_encode($data),
        //     CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        // ]);

        // $response = curl_exec($ch);
        // curl_close($ch);

        // $result = json_decode($response, true);

        // $ch = curl_init();
        // curl_setopt($ch, CURLOPT_URL, 'https://uat.mydigipay.info/digipay/api/tickets/business?type=11');
        // curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        // curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
        // curl_setopt($ch, CURLOPT_HTTPHEADER, [
        //     'Agent: WEB',
        //     'Digipay-Version: 2022-02-02',
        //     'Content-Type: application/json',
        //     'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9xxxx',
        // ]);
        // curl_setopt($ch, CURLOPT_POSTFIELDS, "{\n    \"cellNumber\": \"09103119100\",\n    \"amount\": 10000,\n    \"providerId\": 811143348,\n    \"callbackUrl\": \"https://www.digikala.com\"\n}");
        // curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

        // $response = curl_exec($ch);

        // curl_close($ch);
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "http:///digipay/api/refunds?type=0\n");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9',
            'Content-Type: application/json',
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, "{\n    \"providerId\": 1592502763000,\n    \"amount\": \"7471288365484\",\n    \"saleTrackingCode\": \"5239470511667728782510\"\n        \"product-4\"\n}");
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

        $response = curl_exec($ch);

        curl_close($ch);


        // return ShPayment::purchase(
        //     (new ShInvoice)->amount($amount)->detail([
        //         'booking' => $payment->booking_id,
        //         'Description' => "پرداخت رزرو #{$payment->booking_id}",
        //     ]),
        //     function ($driver, $transactionId) use ($payment) {
        //         $payment->update(['transaction_id' => $transactionId]);
        //     }
        // )->pay()->render();

        if (isset($result['data']['authority'])) {
            $authority = $result['data']['authority'];
            $payment->update(['authority' => $authority]);

            // ریدایرکت به صفحه پرداخت زرین‌پال
            return redirect()->away(
                "https://www.zarinpal.com/pg/StartPay/{$authority}"
            );
        }



        return redirect()->route('customer.payment.failed', $payment->booking_id)
            ->with('error', 'خطا در ارتباط با درگاه پرداخت.');
    }

    /**
     * درخواست پرداخت زرین‌پال
     */
    private function zarinpalRequest(Payment $payment, array $config)
    {
        $merchantId = $config['merchant_id'];
        $callbackUrl = route('customer.payment.callback', 'zarinpal');
        $amount = $payment->amount * 10; // زرین‌پال به ریال کار می‌کند

        // $data = [
        //     'MerchantID' => $merchantId,
        //     'Amount' => $amount,
        //     'CallbackURL' => $callbackUrl,
        //     'Description' => "پرداخت رزرو #{$payment->booking_id}",
        // ];

        // $ch = curl_init('https://api.zarinpal.com/pg/v4/payment/request.json');
        // curl_setopt_array($ch, [
        //     CURLOPT_RETURNTRANSFER => true,
        //     CURLOPT_POST => true,
        //     CURLOPT_POSTFIELDS => json_encode($data),
        //     CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        // ]);

        // $response = curl_exec($ch);
        // curl_close($ch);

        // $result = json_decode($response, true);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://uat.mydigipay.info/digipay/api/tickets/business?type=11');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Agent: WEB',
            'Digipay-Version: 2022-02-02',
            'Content-Type: application/json',
            'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9xxxx',
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, "{\n    \"cellNumber\": \"09103119100\",\n    \"amount\": 10000,\n    \"providerId\": 811143348,\n    \"callbackUrl\": \"https://www.digikala.com\"\n}");
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

        $response = curl_exec($ch);

        curl_close($ch);


        return ShPayment::purchase(
            (new ShInvoice)->amount($amount)->detail([
                'booking' => $payment->booking_id,
                'Description' => "پرداخت رزرو #{$payment->booking_id}",
            ]),
            function ($driver, $transactionId) use ($payment) {
                $payment->update(['transaction_id' => $transactionId]);
            }
        )->pay()->render();

        if (isset($result['data']['authority'])) {
            $authority = $result['data']['authority'];
            $payment->update(['authority' => $authority]);

            // ریدایرکت به صفحه پرداخت زرین‌پال
            return redirect()->away(
                "https://www.zarinpal.com/pg/StartPay/{$authority}"
            );
        }



        return redirect()->route('customer.payment.failed', $payment->booking_id)
            ->with('error', 'خطا در ارتباط با درگاه پرداخت.');
    }

    /**
     * تایید پرداخت
     */
    private function verifyPayment(Payment $payment, Request $request): array
    {
        switch ($payment->gateway) {
            case 'zarinpal':
                return $this->zarinpalVerify($payment);
                // ...
            default:
                return ['success' => false, 'response' => null];
        }
    }

    /**
     * تایید پرداخت زرین‌پال
     */
    private function zarinpalVerify(Payment $payment): array
    {
        $config = config('payment.gateways.zarinpal');
        $merchantId = $config['merchant_id'];
        $amount = $payment->amount * 10;

        $data = [
            'MerchantID' => $merchantId,
            'Amount' => $amount,
            'Authority' => $payment->authority,
        ];

        $ch = curl_init('https://api.zarinpal.com/pg/v4/payment/verify.json');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        $result = json_decode($response, true);

        if (isset($result['data']['code']) && $result['data']['code'] === 100) {
            return [
                'success' => true,
                'transaction_id' => $result['data']['ref_id'],
                'response' => $result,
            ];
        }

        return [
            'success' => false,
            'response' => $result,
        ];
    }
}
