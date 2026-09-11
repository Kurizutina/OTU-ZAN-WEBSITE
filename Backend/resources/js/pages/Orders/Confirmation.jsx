import { Head, router } from '@inertiajs/react';

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

export default function Confirmation({ order }) {
    const orderSteps = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentStep = Math.max(orderSteps.indexOf(order.status), 0);
    const deliverySteps = ['assigned', 'picked_up', 'in_transit', 'delivered'];
    const currentDeliveryStep = order.delivery ? Math.max(deliverySteps.indexOf(order.delivery.status), 0) : -1;

    return (
        <main className="min-h-screen bg-[#f5f0e8] px-6 py-12 text-[#17352d] lg:px-10">
            <Head title={`Order #${order.id}`} />
            <div className="mx-auto max-w-2xl">
                <a href="/" className="text-sm font-semibold text-[#ca5b3e]">← Back to menu</a>
                <section className="mt-8 rounded-3xl bg-[#17352d] p-8 text-[#f5f0e8] shadow-xl sm:p-12">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#e9a46c]">Order received</p>
                    <h1 className="mt-4 font-serif text-5xl tracking-tight">Thank you.</h1>
                    <p className="mt-4 max-w-md leading-7 text-[#f5f0e8]/70">We&apos;ve received your order and will start preparing it shortly.</p>
                    <div className="mt-8 border-t border-[#f5f0e8]/15 pt-6">
                        <div className="flex justify-between text-sm"><span className="text-[#f5f0e8]/60">Order number</span><strong>#{order.id}</strong></div>
                        <div className="mt-3 flex justify-between text-sm"><span className="text-[#f5f0e8]/60">Status</span><strong className="capitalize">{order.status.replaceAll('_', ' ')}</strong></div>
                        <div className="mt-3 flex justify-between text-sm"><span className="text-[#f5f0e8]/60">Payment</span><strong className="capitalize">{order.pay_bill?.method ?? 'cash'} · unpaid</strong></div>
                    </div>
                </section>
                <section className="mt-6 rounded-2xl border border-[#17352d]/10 bg-white/60 p-6">
                    <h2 className="font-serif text-2xl">Your order</h2>
                    <div className="mt-4 divide-y divide-[#17352d]/10">
                        {order.items?.map((item) => (
                            <div key={item.id} className="flex justify-between gap-4 py-4 text-sm">
                                <span>{item.quantity} × {item.product?.name}</span>
                                <span className="font-semibold">{formatPrice(Number(item.price) * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 flex justify-between border-t border-[#17352d]/15 pt-4 font-semibold"><span>Total</span><span>{formatPrice(order.total_amount)}</span></div>
                    <div className="mt-6 border-t border-[#17352d]/15 pt-5 text-sm"><p className="font-semibold">Delivery address</p><p className="mt-1 text-[#17352d]/60">{order.delivery_address}</p></div>
                </section>
                <section className="mt-6 rounded-2xl border border-[#17352d]/10 bg-white/60 p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ca5b3e]">Live progress</p>
                    <div className="flex items-end justify-between gap-4">
                        <h2 className="mt-2 font-serif text-2xl">Order status</h2>
                        <button onClick={() => router.reload({ only: ['order'] })} className="text-sm font-semibold text-[#ca5b3e] hover:text-[#17352d]">Refresh status</button>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-5">
                        {orderSteps.map((step, index) => (
                            <div key={step} className={`rounded-xl px-3 py-3 text-center text-xs font-semibold capitalize ${index <= currentStep ? 'bg-[#17352d] text-[#f5f0e8]' : 'bg-[#17352d]/5 text-[#17352d]/45'}`}>{step.replaceAll('_', ' ')}</div>
                        ))}
                    </div>
                    {order.delivery && <div className="mt-6 border-t border-[#17352d]/10 pt-5"><div className="flex justify-between gap-4 text-sm"><span className="font-semibold">Delivery: <span className="font-normal capitalize">{order.delivery.status.replaceAll('_', ' ')}</span></span><span className="text-[#17352d]/60">{order.delivery.rider?.name ?? 'Rider assigned'}</span></div><div className="mt-3 grid gap-2 sm:grid-cols-4">{deliverySteps.map((step, index) => <div key={step} className={`h-2 rounded-full ${index <= currentDeliveryStep ? 'bg-[#ca5b3e]' : 'bg-[#17352d]/10'}`} />)}</div></div>}
                    {order.customer?.notifications?.length > 0 && <div className="mt-6 border-t border-[#17352d]/10 pt-5"><p className="text-sm font-semibold">Recent updates</p><ul className="mt-3 space-y-2 text-sm text-[#17352d]/65">{order.customer.notifications.map((notification) => <li key={notification.id}><strong className="text-[#17352d]">{notification.title}:</strong> {notification.message}</li>)}</ul></div>}
                </section>
            </div>
        </main>
    );
}