<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PayBill;
use App\Models\Delivery;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Home', [
            'products' => Product::query()
                ->where('is_available', true)
                ->latest()
                ->get(),
            'categories' => Product::query()
                ->where('is_available', true)
                ->select('category')
                ->distinct()
                ->orderBy('category')
                ->pluck('category'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:30'],
            'delivery_address' => ['required', 'string', 'max:500'],
            'payment_method' => ['required', 'in:cash,gcash,card'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:20'],
        ]);

        $order = DB::transaction(function () use ($validated): Order {
            $customer = User::query()->updateOrCreate(
                ['email' => $validated['customer_email']],
                [
                    'name' => $validated['customer_name'],
                    'phone' => $validated['customer_phone'] ?? null,
                    'role' => 'customer',
                    'password' => Hash::make(str()->random(32)),
                ],
            );

            $products = Product::query()
                ->whereIn('id', collect($validated['items'])->pluck('id'))
                ->where('is_available', true)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            if ($products->count() !== count($validated['items'])) {
                abort(422, 'One or more selected products are unavailable.');
            }

            $total = collect($validated['items'])->sum(
                fn (array $item) => $products[$item['id']]->price * $item['quantity'],
            );

            $order = Order::query()->create([
                'customer_id' => $customer->id,
                'status' => 'pending',
                'total_amount' => $total,
                'delivery_address' => $validated['delivery_address'],
            ]);

            foreach ($validated['items'] as $item) {
                if ($products[$item['id']]->stock < $item['quantity']) {
                    abort(422, "Insufficient stock for {$products[$item['id']]->name}.");
                }

                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'product_id' => $item['id'],
                    'quantity' => $item['quantity'],
                    'price' => $products[$item['id']]->price,
                ]);

                $products[$item['id']]->decrement('stock', $item['quantity']);
            }

            PayBill::query()->create([
                'order_id' => $order->id,
                'method' => $validated['payment_method'],
                'status' => 'unpaid',
                'amount' => $total,
            ]);

            return $order;
        });

        return redirect(URL::signedRoute('orders.confirmation', ['order' => $order->id]));
    }

    public function confirmation(Order $order): Response
    {
        return Inertia::render('Orders/Confirmation', [
            'order' => $order->load(['customer.notifications' => fn ($query) => $query->latest()->limit(5), 'items.product', 'payBill', 'delivery.rider']),
        ]);
    }

    public function adminOrders(): Response
    {
        abort_unless(auth()->user()?->role === 'owner', 403);

        return Inertia::render('Admin/Orders', [
            'orders' => Order::query()
                ->with(['customer', 'items.product', 'payBill', 'delivery.rider'])
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'statuses' => ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
            'deliveryStatuses' => ['assigned', 'picked_up', 'in_transit', 'delivered'],
            'riders' => User::query()->where('role', 'rider')->orderBy('name')->get(['id', 'name', 'phone']),
            'summary' => [
                'total' => Order::count(),
                'pending' => Order::where('status', 'pending')->count(),
                'activeDeliveries' => Delivery::whereIn('status', ['assigned', 'picked_up', 'in_transit'])->count(),
                'paidRevenue' => PayBill::where('status', 'paid')->sum('amount'),
            ],
        ]);
    }

    public function updateOrder(Request $request, Order $order): RedirectResponse
    {
        abort_unless(auth()->user()?->role === 'owner', 403);

        $validated = $request->validate([
            'status' => ['required', 'in:pending,confirmed,preparing,out_for_delivery,delivered,cancelled'],
        ]);

        $order->update($validated);
        Notification::query()->create([
            'user_id' => $order->customer_id,
            'title' => 'Order status updated',
            'message' => "Order #{$order->id} is now {$validated['status']}.",
        ]);

        return to_route('admin.orders')->with('success', "Order #{$order->id} updated.");
    }

    public function adminProducts(): Response
    {
        abort_unless(auth()->user()?->role === 'owner', 403);

        return Inertia::render('Admin/Products', [
            'products' => Product::query()->latest()->get(),
        ]);
    }

    public function storeProduct(Request $request): RedirectResponse
    {
        abort_unless(auth()->user()?->role === 'owner', 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'category' => ['required', 'string', 'max:80'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'stock' => ['required', 'integer', 'min:0', 'max:100000'],
            'image' => ['nullable', 'url', 'max:500'],
        ]);

        Product::query()->create([...$validated, 'is_available' => true]);

        return to_route('admin.products')->with('success', 'Product added.');
    }

    public function destroyProduct(Product $product): RedirectResponse
    {
        abort_unless(auth()->user()?->role === 'owner', 403);
        $product->update(['is_available' => false]);

        return to_route('admin.products')->with('success', 'Product marked unavailable.');
    }

    public function toggleProduct(Product $product): RedirectResponse
    {
        abort_unless(auth()->user()?->role === 'owner', 403);
        $product->update(['is_available' => ! $product->is_available]);

        return to_route('admin.products')->with('success', $product->is_available ? 'Product is available again.' : 'Product marked unavailable.');
    }

    public function updateProduct(Request $request, Product $product): RedirectResponse
    {
        abort_unless(auth()->user()?->role === 'owner', 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'category' => ['required', 'string', 'max:80'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'stock' => ['required', 'integer', 'min:0', 'max:100000'],
            'image' => ['nullable', 'url', 'max:500'],
            'is_available' => ['required', 'boolean'],
        ]);

        $product->update($validated);

        return to_route('admin.products')->with('success', 'Product updated.');
    }

    public function updatePayment(Request $request, Order $order): RedirectResponse
    {
        abort_unless(auth()->user()?->role === 'owner', 403);

        $validated = $request->validate([
            'status' => ['required', 'in:unpaid,paid'],
        ]);

        $order->payBill()->updateOrCreate(
            [],
            [
                'method' => $order->payBill?->method ?? 'cash',
                'status' => $validated['status'],
                'amount' => $order->total_amount,
            ],
        );
        Notification::query()->create([
            'user_id' => $order->customer_id,
            'title' => 'Payment status updated',
            'message' => "Payment for order #{$order->id} is now {$validated['status']}.",
        ]);

        return to_route('admin.orders')->with('success', "Payment for order #{$order->id} updated.");
    }

    public function updateDelivery(Request $request, Order $order): RedirectResponse
    {
        abort_unless(auth()->user()?->role === 'owner', 403);

        $validated = $request->validate([
            'rider_id' => ['required', 'integer', 'exists:users,id'],
            'status' => ['required', 'in:assigned,picked_up,in_transit,delivered'],
        ]);

        $timestamps = [
            'picked_up_at' => $validated['status'] === 'picked_up' ? now() : null,
            'delivered_at' => $validated['status'] === 'delivered' ? now() : null,
        ];

        $order->delivery()->updateOrCreate([], [...$validated, ...$timestamps]);
        Notification::query()->create([
            'user_id' => $order->customer_id,
            'title' => 'Delivery status updated',
            'message' => "Delivery for order #{$order->id} is now {$validated['status']}.",
        ]);

        return to_route('admin.orders')->with('success', "Delivery for order #{$order->id} updated.");
    }

    public function exportOrders()
    {
        abort_unless(auth()->user()?->role === 'owner', 403);

        $orders = Order::query()->with(['customer', 'payBill', 'delivery'])->latest()->get();

        return response()->streamDownload(function () use ($orders): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Order ID', 'Customer', 'Email', 'Status', 'Payment', 'Delivery', 'Total', 'Created']);

            foreach ($orders as $order) {
                fputcsv($output, [
                    $order->id,
                    $order->customer?->name,
                    $order->customer?->email,
                    $order->status,
                    $order->payBill?->status ?? 'unpaid',
                    $order->delivery?->status ?? 'unassigned',
                    $order->total_amount,
                    $order->created_at?->toDateTimeString(),
                ]);
            }

            fclose($output);
        }, 'otu-zan-orders.csv', ['Content-Type' => 'text/csv']);
    }
}