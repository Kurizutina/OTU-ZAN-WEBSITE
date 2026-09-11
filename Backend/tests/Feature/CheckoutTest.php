<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_place_an_order(): void
    {
        $product = Product::query()->create([
            'name' => 'Test Meal',
            'description' => 'A test meal.',
            'category' => 'Test',
            'price' => 12.50,
            'is_available' => true,
        ]);

        $response = $this->post('/orders', [
            'customer_name' => 'Test Customer',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '555-0111',
            'delivery_address' => '123 Test Street',
            'payment_method' => 'cash',
            'items' => [['id' => $product->id, 'quantity' => 2]],
        ]);

        $order = \App\Models\Order::query()->firstOrFail();

        $response->assertRedirect(URL::signedRoute('orders.confirmation', ['order' => $order->id]));
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'total_amount' => 25.00]);
        $this->assertDatabaseHas('order_items', ['order_id' => $order->id, 'quantity' => 2]);
        $this->assertDatabaseHas('pay_bills', ['order_id' => $order->id, 'method' => 'cash', 'status' => 'unpaid']);
    }

    public function test_unavailable_products_cannot_be_ordered(): void
    {
        $product = Product::query()->create([
            'name' => 'Unavailable Meal',
            'category' => 'Test',
            'price' => 10,
            'is_available' => false,
        ]);

        $this->post('/orders', [
            'customer_name' => 'Test Customer',
            'customer_email' => 'customer@example.com',
            'delivery_address' => '123 Test Street',
            'payment_method' => 'cash',
            'items' => [['id' => $product->id, 'quantity' => 1]],
        ])->assertStatus(422);
    }
}