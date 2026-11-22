<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\PermisionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_is_accessible(): void
    {
        $this->seed(PermisionsSeeder::class);

        $role = Role::query()
            ->where('name', User::ROLE_BARBER)
            ->where('guard_name', 'web')
            ->first();

        $this->assertNotNull(
            $role,
            'نقش آرایشگر در دیتابیس تست ایجاد نشده است.'
        );

        $response = $this->get('/');

        $response->assertOk();
    }
}
