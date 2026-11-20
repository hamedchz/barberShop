<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    protected $seed = true;

    public function test_home_page_is_accessible(): void
    {
        $response = $this->get('/');

        $response->assertOk();
    }
}
