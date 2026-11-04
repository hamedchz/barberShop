<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Mail\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index()
    {
        return Inertia::render('Front/Contact');
    }

    public function send(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|min:2|max:100',
            'email' => 'required|email|max:150',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|min:3|max:200',
            'message' => 'required|string|min:10|max:2000',
        ], [
            'name.required' => 'نام و نام خانوادگی الزامی است.',
            'name.min' => 'نام باید حداقل ۲ کاراکتر باشد.',
            'email.required' => 'ایمیل الزامی است.',
            'email.email' => 'فرمت ایمیل صحیح نیست.',
            'subject.required' => 'موضوع پیام الزامی است.',
            'message.required' => 'متن پیام الزامی است.',
            'message.min' => 'متن پیام حداقل ۱۰ کاراکتر باشد.',
            'message.max' => 'متن پیام حداکثر ۲۰۰۰ کاراکتر باشد.',
        ]);

        // ذخیره در دیتابیس (اختیاری)
        \App\Models\ContactMessage::create($validated);

        // ارسال ایمیل به ادمین (اختیاری)
        try {
            Mail::to(config('mail.admin_email', 'admin@salon.com'))
                ->send(new ContactMessage($validated));
        } catch (\Exception $e) {
            \Log::error('Contact email failed: ' . $e->getMessage());
        }

        return back()->with('success', 'پیام شما با موفقیت ارسال شد.');
    }
}
