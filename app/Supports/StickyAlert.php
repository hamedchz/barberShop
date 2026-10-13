<?php

namespace App\Supports;

use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;

class StickyAlert
{

  public static function toast(
    string $title,
    string $type = 'success',
    int $timer = 3000,
    string $position = 'top-end'
  ) {


    Session::flash('alert', [
      'id' => (string) Str::uuid(),
      'type' => $type,
      'title' => $title,
      'message' => '',
      'toast' => true,
      'timer' => $timer,
      'position' => $position,
      'showConfirmButton' => false,
    ]);
  }

  public static function alert(
    string $title,
    string $type = 'success',
    // int $timer = 3000,
    string $position = 'center'
  ) {


    Session::flash('alert', [
      'id' => (string) Str::uuid(),
      'type' => $type,
      'title' => $title,
      'message' => '',
      'toast' => false,
      // 'timer' => $timer,
      'position' => $position,
    ]);
  }
  public static function success(
    string $title = 'موفق',
    string $message = ''
  ) {
    return redirect()
      ->back()
      ->with('alert', [
        'type' => 'success',
        'title' => $title,
        'message' => $message,
      ]);
  }

  public static function error(
    string $title = 'خطا',
    string $message = ''
  ) {
    return redirect()
      ->back()
      ->with('alert', [
        'type' => 'error',
        'title' => $title,
        'message' => $message,
      ]);
  }

  public static function warning(
    string $title = 'هشدار',
    string $message = ''
  ) {
    return redirect()
      ->back()
      ->with('alert', [
        'type' => 'warning',
        'title' => $title,
        'message' => $message,
      ]);
  }

  public static function info(
    string $title = 'اطلاعیه',
    string $message = ''
  ) {
    return redirect()
      ->back()
      ->with('alert', [
        'type' => 'info',
        'title' => $title,
        'message' => $message,
      ]);
  }
}
