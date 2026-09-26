<?php


namespace App\Helpers;


use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class Thumbnail
{
  public static function storeThumb(
    $source,
    $path,
    $height = 400,
    $width = null
  ): void {

    $img = Image::decode($source);

    // اصلاح جهت تصویر بر اساس EXIF
    $img->orient();

    // تغییر اندازه با حفظ نسبت تصویر
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

    // ذخیره thumbnail
    Storage::disk('public')->put(
      'thumbnails/' . $path,
      $img->encode()
    );
  }
}
