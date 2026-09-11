<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'customer_id',
        'rider_id',
        'status',
        'total_amount',
        'delivery_address',
    ];

    protected function casts(): array
    {
        return ['total_amount' => 'decimal:2'];
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class)->with('product');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function payBill()
    {
        return $this->hasOne(PayBill::class);
    }

    public function delivery()
    {
        return $this->hasOne(Delivery::class);
    }
}
