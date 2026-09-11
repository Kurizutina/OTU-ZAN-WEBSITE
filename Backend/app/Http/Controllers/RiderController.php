<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RiderController extends Controller
{
    public function index(): Response
    {
        abort_unless(auth()->user()?->role === 'rider', 403);

        return Inertia::render('Rider/Orders', [
            'deliveries' => Delivery::query()
                ->where('rider_id', auth()->id())
                ->with(['order.customer', 'order.items.product'])
                ->latest()
                ->get(),
            'statuses' => ['assigned', 'picked_up', 'in_transit', 'delivered'],
        ]);
    }

    public function update(Request $request, Delivery $delivery): RedirectResponse
    {
        abort_unless(auth()->user()?->role === 'rider' && $delivery->rider_id === auth()->id(), 403);

        $validated = $request->validate([
            'status' => ['required', 'in:assigned,picked_up,in_transit,delivered'],
        ]);

        $delivery->update([
            ...$validated,
            'picked_up_at' => $validated['status'] === 'picked_up' ? now() : $delivery->picked_up_at,
            'delivered_at' => $validated['status'] === 'delivered' ? now() : $delivery->delivered_at,
        ]);

        return to_route('rider.orders')->with('success', 'Delivery status updated.');
    }
}