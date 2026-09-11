import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

function statusLabel(status) {
    return status.replaceAll('_', ' ');
}

export default function Orders({ orders = { data: [], links: [] }, statuses = [], deliveryStatuses = [], riders = [], summary = {}, flash = {} }) {
    const statusForm = useForm({ status: '' });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const filteredOrders = orders.data.filter((order) => {
        const query = search.toLowerCase();
        const matchesSearch = !query || `${order.id} ${order.customer?.name ?? ''} ${order.customer?.email ?? ''}`.toLowerCase().includes(query);
        return matchesSearch && (statusFilter === 'all' || order.status === statusFilter);
    });

    function updateStatus(order, status) {
        statusForm.transform(() => ({ status })).patch(`/admin/orders/${order.id}`);
    }

    function updatePayment(order, status) {
        statusForm.transform(() => ({ status })).patch(`/admin/orders/${order.id}/payment`);
    }

    function updateDelivery(order, riderId, status) {
        statusForm.transform(() => ({ rider_id: riderId, status })).patch(`/admin/orders/${order.id}/delivery`);
    }

    return (
        <>
            <Head title="Orders" />
            <main className="min-h-screen bg-[#f5f0e8] px-6 py-10 text-[#17352d] lg:px-10">
                <div className="mx-auto max-w-6xl">
                    <header className="mb-10 flex items-end justify-between border-b border-[#17352d]/15 pb-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ca5b3e]">Operations</p>
                            <h1 className="mt-2 font-serif text-5xl tracking-tight">Orders</h1>
                        </div>
                        <div className="flex items-center gap-5">
                            <a href="/admin/products" className="text-sm font-semibold text-[#17352d]/60 hover:text-[#ca5b3e]">Products</a>
                            <a href="/admin/orders/export" className="text-sm font-semibold text-[#17352d]/60 hover:text-[#ca5b3e]">Export CSV</a>
                            <a href="/" className="text-sm font-semibold text-[#ca5b3e]">Back to menu</a>
                            <form method="post" action="/logout"><input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.content ?? ''} /><button className="text-sm font-semibold text-[#17352d]/60 hover:text-[#ca5b3e]">Log out</button></form>
                        </div>
                    </header>

                    {flash.success && <p className="mb-6 rounded-xl bg-[#17352d] px-4 py-3 text-sm text-[#f5f0e8]">{flash.success}</p>}

                    <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            ['Orders', summary.total ?? 0],
                            ['Pending', summary.pending ?? 0],
                            ['Active deliveries', summary.activeDeliveries ?? 0],
                            ['Paid revenue', formatPrice(summary.paidRevenue ?? 0)],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-2xl border border-[#17352d]/10 bg-white/60 p-5"><p className="text-xs font-semibold uppercase tracking-widest text-[#ca5b3e]">{label}</p><p className="mt-3 font-serif text-3xl">{value}</p></div>
                        ))}
                    </section>

                    <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                        <label className="flex-1"><span className="sr-only">Search orders</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, customer, or email" className="w-full rounded-xl border border-[#17352d]/15 bg-white/60 px-4 py-3 text-sm outline-none focus:border-[#ca5b3e]" /></label>
                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-[#17352d]/15 bg-white/60 px-4 py-3 text-sm capitalize outline-none focus:border-[#ca5b3e]"><option value="all">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select>
                    </div>

                    {filteredOrders.length === 0 ? (
                        <div className="rounded-2xl border border-[#17352d]/10 bg-white/50 p-12 text-center">
                            <p className="font-serif text-2xl">{orders.total === 0 ? 'No orders yet.' : 'No matching orders.'}</p>
                            <p className="mt-2 text-sm text-[#17352d]/60">{orders.total === 0 ? 'New customer orders will appear here.' : 'Try another search or status filter.'}</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {filteredOrders.map((order) => (
                                <article key={order.id} className="rounded-2xl border border-[#17352d]/10 bg-white/60 p-6">
                                    <div className="flex flex-col justify-between gap-4 border-b border-[#17352d]/10 pb-5 sm:flex-row sm:items-start">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-[#ca5b3e]">Order #{order.id}</p>
                                            <h2 className="mt-1 font-serif text-2xl">{order.customer?.name ?? 'Guest customer'}</h2>
                                            <p className="mt-1 text-sm text-[#17352d]/60">{order.customer?.email} · {order.delivery_address}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold">{formatPrice(order.total_amount)}</span>
                                            <select value={order.status} onChange={(event) => updateStatus(order, event.target.value)} className="rounded-full border border-[#17352d]/20 bg-transparent px-4 py-2 text-sm capitalize outline-none focus:border-[#ca5b3e]">
                                                {statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                                            </select>
                                            <select value={order.pay_bill?.status ?? 'unpaid'} onChange={(event) => updatePayment(order, event.target.value)} className="rounded-full border border-[#17352d]/20 bg-transparent px-4 py-2 text-sm capitalize outline-none focus:border-[#ca5b3e]"><option value="unpaid">Unpaid</option><option value="paid">Paid</option></select>
                                        </div>
                                    </div>
                                    <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                                        {order.items?.map((item) => (
                                            <li key={item.id} className="flex justify-between gap-3 text-[#17352d]/70">
                                                <span>{item.quantity} × {item.product?.name}</span>
                                                <span>{formatPrice(Number(item.price) * item.quantity)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#17352d]/10 pt-5">
                                        <span className="text-xs font-semibold uppercase tracking-widest text-[#ca5b3e]">Delivery</span>
                                        <select value={order.delivery?.rider_id ?? ''} onChange={(event) => updateDelivery(order, event.target.value, order.delivery?.status ?? 'assigned')} className="rounded-full border border-[#17352d]/20 bg-transparent px-4 py-2 text-sm outline-none focus:border-[#ca5b3e]">
                                            <option value="" disabled>Assign rider</option>
                                            {riders.map((rider) => <option key={rider.id} value={rider.id}>{rider.name}</option>)}
                                        </select>
                                        <select disabled={!order.delivery} value={order.delivery?.status ?? 'assigned'} onChange={(event) => updateDelivery(order, order.delivery.rider_id, event.target.value)} className="rounded-full border border-[#17352d]/20 bg-transparent px-4 py-2 text-sm capitalize outline-none focus:border-[#ca5b3e] disabled:opacity-50">
                                            {deliveryStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                                        </select>
                                        {order.delivery?.rider && <span className="text-sm text-[#17352d]/60">{order.delivery.rider.phone ?? 'No phone listed'}</span>}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                    {orders.links?.length > 3 && <nav className="mt-8 flex flex-wrap gap-2" aria-label="Order pages">{orders.links.map((link) => <a key={link.label} href={link.url ?? '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`rounded-full px-3 py-2 text-sm ${link.active ? 'bg-[#17352d] text-[#f5f0e8]' : 'bg-white/60 text-[#17352d]/60'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`} />)}</nav>}
                </div>
            </main>
        </>
    );
}