<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RiderController;
use Illuminate\Support\Facades\Route;

Route::get('/', [ProductController::class, 'index'])->name('home');
Route::post('/orders', [ProductController::class, 'store'])->name('orders.store');
Route::get('/orders/{order}/confirmation', [ProductController::class, 'confirmation'])->middleware('signed')->name('orders.confirmation');
Route::get('/login', [AuthController::class, 'create'])->name('login');
Route::post('/login', [AuthController::class, 'store'])->name('login.store');
Route::post('/logout', [AuthController::class, 'destroy'])->middleware('auth')->name('logout');

Route::middleware('auth')->group(function (): void {
	Route::get('/admin/orders', [ProductController::class, 'adminOrders'])->name('admin.orders');
	Route::get('/admin/orders/export', [ProductController::class, 'exportOrders'])->name('admin.orders.export');
	Route::patch('/admin/orders/{order}', [ProductController::class, 'updateOrder'])->name('admin.orders.update');
	Route::patch('/admin/orders/{order}/payment', [ProductController::class, 'updatePayment'])->name('admin.orders.payment');
	Route::patch('/admin/orders/{order}/delivery', [ProductController::class, 'updateDelivery'])->name('admin.orders.delivery');
	Route::get('/admin/products', [ProductController::class, 'adminProducts'])->name('admin.products');
	Route::post('/admin/products', [ProductController::class, 'storeProduct'])->name('admin.products.store');
	Route::patch('/admin/products/{product}', [ProductController::class, 'updateProduct'])->name('admin.products.update');
	Route::delete('/admin/products/{product}', [ProductController::class, 'destroyProduct'])->name('admin.products.destroy');
	Route::patch('/admin/products/{product}/availability', [ProductController::class, 'toggleProduct'])->name('admin.products.availability');
	Route::get('/rider/orders', [RiderController::class, 'index'])->name('rider.orders');
	Route::patch('/rider/deliveries/{delivery}', [RiderController::class, 'update'])->name('rider.deliveries.update');
});
