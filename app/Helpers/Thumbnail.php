<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;
use Intervention\Image\Format;
use Intervention\Image\Alignment;

class Thumbnail
{
  /**
   * تولید تصویر بندانگشتی فعلی
   * برای حفظ سازگاری با قسمت‌های دیگر پروژه
   */
  public static function storeThumb(
    $source,
    $path,
    $height = 400,
    $width = null
  ): void {

    $img = Image::decode($source);

    $img->orient();

    if ($width !== null) {
      $img->scale(
        width: $width,
        height: $height
      );
    } else {
      $img->scale(
        height: $height
      );
    }

    Storage::disk('public')->put(
      'thumbnails/' . $path,
      $img->encode()
    );
  }

  /**
   * تولید تصویر اختصاصی کارت آرایشگر
   *
   * ابعاد: 800 × 1280
   * نسبت: 5:8
   * فرمت: WebP
   *
   * خروجی: مسیر نسبی تصویر
   */
  public static function storeCardThumb(
    $source,
    string $filename,
    int $width = 800,
    int $height = 1280,
    int $quality = 85
  ): string {

    $img = Image::decode($source);

    // اصلاح جهت تصویر بر اساس EXIF
    $img->orient();

    // برش تصویر با نسبت 5:8
    $img->cover(
      $width,
      $height,
      Alignment::TOP
    );
    // تبدیل به WebP
    $encoded = (string) $img->encodeUsingFormat(
      Format::WEBP,
      quality: $quality
    );

    // مسیر ذخیره تصویر
    $path = 'thumbnails/cards/' .
      pathinfo($filename, PATHINFO_FILENAME) .
      '.webp';

    // ذخیره در دیسک public
    Storage::disk('public')->put($path, $encoded);

    // بازگرداندن مسیر واقعی فایل
    return $path;
  }
}
