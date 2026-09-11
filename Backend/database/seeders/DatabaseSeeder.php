<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'role' => 'customer',
                'password' => 'password',
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'owner@example.com'],
            [
                'name' => 'OTU ZAN Owner',
                'role' => 'owner',
                'password' => 'password',
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'rider@example.com'],
            [
                'name' => 'OTU ZAN Rider',
                'role' => 'rider',
                'phone' => '555-0100',
                'password' => 'password',
            ],
        );

        $products = [
            [
                'name' => 'Coconut Curry Bowl',
                'description' => 'Silky coconut curry, roasted vegetables, jasmine rice, and fresh herbs.',
                'category' => 'OTU ZAN',
                'price' => 14.50,
                'image' => 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85',
                'is_available' => true,
            ],
            [
                'name' => 'Zan Garden Salad',
                'description' => 'Crisp greens, seasonal fruit, toasted seeds, and citrus dressing.',
                'category' => 'OTU ZAN',
                'price' => 11.00,
                'image' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85',
                'is_available' => true,
            ],
            [
                'name' => 'Smoky Jollof Plate',
                'description' => 'Slow-cooked tomato rice with charred vegetables and a bright pepper relish.',
                'category' => 'OTU ZAN',
                'price' => 16.50,
                'image' => 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85',
                'is_available' => true,
            ],
            [
                'name' => 'Ginger Hibiscus Cooler',
                'description' => 'Tart hibiscus, ginger, lime, and just enough sweetness over ice.',
                'category' => 'OTU ZAN',
                'price' => 6.00,
                'image' => 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85',
                'is_available' => true,
            ],
            [
                'name' => 'Chickenjoy',
                'description' => 'Crispy fried chicken with a juicy, flavorful center and savory gravy.',
                'category' => 'Jollibee',
                'price' => 8.99,
                'image' => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=85',
                'is_available' => true,
            ],
            [
                'name' => 'Jolly Spaghetti',
                'description' => 'Sweet-style spaghetti with rich tomato sauce, cheese, and savory toppings.',
                'category' => 'Jollibee',
                'price' => 7.49,
                'image' => 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=900&q=85',
                'is_available' => true,
            ],
            [
                'name' => 'Yumburger',
                'description' => 'A classic beef burger with a soft bun and signature savory dressing.',
                'category' => 'Jollibee',
                'price' => 5.49,
                'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85',
                'is_available' => true,
            ],
            [
                'name' => 'Burger Steak',
                'description' => 'Tender burger patties served with steamed rice and warm mushroom gravy.',
                'category' => 'Jollibee',
                'price' => 8.49,
                'image' => 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85',
                'is_available' => true,
            ],
            [
                'name' => 'Jolly Crispy Fries',
                'description' => 'Golden, crisp fries seasoned for a satisfying side or snack.',
                'category' => 'Jollibee',
                'price' => 3.99,
                'image' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85',
                'is_available' => true,
            ],
            [
                'name' => 'Peach Mango Pie',
                'description' => 'A crisp golden pastry filled with sweet peach and mango fruit.',
                'category' => 'Jollibee',
                'price' => 3.49,
                'image' => 'https://images.unsplash.com/photo-1620980776848-84e2b7f7b8b2?auto=format&fit=crop&w=900&q=85',
                'is_available' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::query()->updateOrCreate(
                ['name' => $product['name']],
                $product,
            );
        }
    }
}
