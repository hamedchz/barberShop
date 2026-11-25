<?php

namespace App\Services\PageBuilder;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class SectionValidator
{
  public function __construct(
    protected SectionRegistry $registry
  ) {}

  /**
   * اعتبارسنجی کامل یک بلوک
   */
  public function validate(array $section): array
  {
    $validator = Validator::make($section, [
      'type' => ['required', 'string', 'max:50'],
      'content' => ['required', 'array'],
      'settings' => ['nullable', 'array'],
      'is_active' => ['nullable', 'boolean'],
    ]);

    if ($validator->fails()) {
      throw new ValidationException($validator);
    }

    $type = $section['type'];

    if (!$this->registry->has($type)) {
      throw ValidationException::withMessages([
        'type' => 'نوع بلوک انتخاب‌شده معتبر نیست.',
      ]);
    }

    $definition = $this->registry->get($type);

    $content = $section['content'] ?? [];
    $settings = $section['settings'] ?? [];

    $this->validateAllowedKeys(
      $content,
      array_keys($definition['content']),
      'content'
    );

    $this->validateAllowedKeys(
      $settings,
      array_keys($definition['settings']),
      'settings'
    );

    $contentValidator = Validator::make(
      ['content' => $content],
      $this->prefixRules(
        'content',
        $definition['content_rules']
      ),
      $this->messages()
    );

    if ($contentValidator->fails()) {
      throw new ValidationException($contentValidator);
    }

    $settingsValidator = Validator::make(
      ['settings' => $settings],
      $this->prefixRules(
        'settings',
        $definition['settings_rules']
      ),
      $this->messages()
    );

    if ($settingsValidator->fails()) {
      throw new ValidationException($settingsValidator);
    }

    return [
      'type' => $type,

      'content' => array_merge(
        $definition['content'],
        $content
      ),

      'settings' => array_merge(
        $definition['settings'],
        $settings
      ),

      'is_active' => (bool) ($section['is_active'] ?? true),
    ];
  }

  /**
   * بررسی اینکه فیلد ناشناخته وارد نشده باشد
   */
  protected function validateAllowedKeys(
    array $data,
    array $allowedKeys,
    string $field
  ): void {
    $unknownKeys = array_diff(
      array_keys($data),
      $allowedKeys
    );

    if (!empty($unknownKeys)) {
      throw ValidationException::withMessages([
        $field => 'اطلاعات ارسالی شامل فیلد غیرمجاز است.',
      ]);
    }
  }

  /**
   * اضافه کردن پیشوند به قوانین
   */
  protected function prefixRules(
    string $prefix,
    array $rules
  ): array {
    $result = [];

    foreach ($rules as $field => $fieldRules) {
      $result["{$prefix}.{$field}"] = $fieldRules;
    }

    return $result;
  }

  /**
   * پیام‌های اعتبارسنجی
   */
  protected function messages(): array
  {
    return [
      'required' => 'وارد کردن این فیلد الزامی است.',
      'string' => 'مقدار واردشده باید متن باشد.',
      'array' => 'ساختار اطلاعات واردشده معتبر نیست.',
      'email' => 'آدرس ایمیل معتبر نیست.',
      'url' => 'آدرس واردشده معتبر نیست.',
      'max' => 'مقدار واردشده بیش از حد مجاز است.',
      'min' => 'حداقل تعداد مجاز رعایت نشده است.',
      'between' => 'مقدار واردشده در محدوده مجاز نیست.',
      'in' => 'مقدار انتخاب‌شده معتبر نیست.',
      'boolean' => 'مقدار انتخاب‌شده معتبر نیست.',
      'integer' => 'مقدار باید عدد صحیح باشد.',
    ];
  }
}
