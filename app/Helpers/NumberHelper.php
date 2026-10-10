
<?php

if (! function_exists('EnglishtoPersianNumber')) {
  function EnglishtoPersianNumber($number): string
  {
    return strtr((string) $number, [
      '0' => '۰',
      '1' => '۱',
      '2' => '۲',
      '3' => '۳',
      '4' => '۴',
      '5' => '۵',
      '6' => '۶',
      '7' => '۷',
      '8' => '۸',
      '9' => '۹',
    ]);
  }
}
