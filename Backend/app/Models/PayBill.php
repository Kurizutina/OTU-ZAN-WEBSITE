<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayBill extends Model
{
    protected $fillable = [
        'order_id',
        'method',
        'status',
        'amount',
    ];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2'];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
