<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'action', 'description', 'ip'];

    public function storeLog($name, $desc, $action, $userId = null)
    {
        Log::create([
            'user_id' => $userId ?? auth()->id(),
            'action' => $action,
            'description' => $desc . ' ' . $name,
            'ip' => $this->getUserIp(),
        ]);
    }


    public function getUserIp()
    {
        if (!empty($_SERVER['HTTP_CLIENT_IP']))
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR']))
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        else
            $ip = $_SERVER['REMOTE_ADDR'];
        return $ip;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
