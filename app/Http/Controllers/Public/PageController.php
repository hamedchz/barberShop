<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PageController extends Controller
{
    public function about()
    {
        return Inertia::render('Front/About');
    }

    public function faq()
    {
        return Inertia::render('Front/FAQ');
    }

    public function terms()
    {
        return Inertia::render('Front/Terms');
    }

    public function privacy()
    {
        return Inertia::render('Front/Privacy');
    }

    // public function cities()
    // {
    //     // لیست شهرها
    //     return Inertia::render('Front/Cities');
    // }

    public function services()
    {
        // لیست همه خدمات
        $services = Service::where('is_active', true)
            ->withCount('bookings')
            ->orderByDesc('bookings_count')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'description' => $s->description,
                'min_price' => (float) ($s->min_price ?? 0),
                'duration' => $s->duration,
                'barbers_count' => User::whereHas('roles', fn($q) => $q->where('name', 'barber'))
                    ->whereHas('services', fn($q) => $q->where('services.id', $s->id))
                    ->count(),
            ]);

        return Inertia::render('Front/Services', [
            'services' => $services,
        ]);
    }

    public function cities()
    {
        // لیست شهرها با تعداد آرایشگر
        $cities = User::whereHas('roles', fn($q) => $q->where('name', 'barber'))
            ->where('status', 'active')
            ->whereNotNull('city')
            ->selectRaw('city, COUNT(*) as barbers_count')
            ->groupBy('city')
            ->orderByDesc('barbers_count')
            ->get()
            ->map(fn($c) => [
                'name' => $c->city,
                'barbers_count' => $c->barbers_count,
                'slug' => Str::slug($c->city),
            ]);

        return Inertia::render('Front/Cities', [
            'cities' => $cities,
        ]);
    }
}
