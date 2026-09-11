<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_admin_orders(): void
    {
        $this->get('/admin/orders')->assertRedirect('/login');
    }

    public function test_customers_cannot_access_admin_orders(): void
    {
        $customer = User::query()->create([
            'name' => 'Customer',
            'email' => 'customer@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
        ]);

        $this->actingAs($customer)->get('/admin/orders')->assertForbidden();
    }

    public function test_owner_can_access_admin_orders(): void
    {
        $owner = User::query()->create([
            'name' => 'Owner',
            'email' => 'owner@example.com',
            'password' => Hash::make('password'),
            'role' => 'owner',
        ]);

        $this->actingAs($owner)->get('/admin/orders')->assertOk();
    }
}