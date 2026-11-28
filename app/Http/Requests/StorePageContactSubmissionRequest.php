<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePageContactSubmissionRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'name' => [
        'required',
        'string',
        'min:2',
        'max:120',
      ],

      'phone' => [
        'required',
        'string',
        'max:30',
        'regex:/^[0-9۰-۹٠-٩+\-\s()]{8,30}$/u',
      ],

      'email' => [
        'nullable',
        'email',
        'max:150',
      ],

      'subject' => [
        'nullable',
        'string',
        'max:180',
      ],

      'message' => [
        'required',
        'string',
        'min:10',
        'max:5000',
      ],

      // فیلد مخفی ضد ربات
      'website' => [
        'nullable',
        'string',
        'max:255',
      ],
    ];
  }

  public function attributes(): array
  {
    return [
      'name' => 'نام و نام خانوادگی',
      'phone' => 'شماره تماس',
      'email' => 'ایمیل',
      'subject' => 'موضوع',
      'message' => 'متن پیام',
    ];
  }

  public function messages(): array
  {
    return [
      'name.required' => 'لطفاً نام خود را وارد کنید.',
      'phone.required' => 'لطفاً شماره تماس خود را وارد کنید.',
      'phone.regex' => 'شماره تماس واردشده معتبر نیست.',
      'email.email' => 'فرمت ایمیل معتبر نیست.',
      'message.required' => 'لطفاً متن پیام را وارد کنید.',
      'message.min' => 'متن پیام باید حداقل ۱۰ کاراکتر باشد.',
    ];
  }
}
