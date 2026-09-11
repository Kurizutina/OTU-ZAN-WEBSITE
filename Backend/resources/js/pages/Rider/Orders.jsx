import { Head, useForm } from '@inertiajs/react';

function statusLabel(status) {
    return status.replaceAll('_', ' ');
}

export default function Orders({ deliveries = [], statuses = [], flash = {} }) {
    const form = useForm({ status: '' });

    function updateStatus(delivery, status) {
        form.transform(() => ({ status })).patch(`/rider/deliveries/${delivery.id}`);
    }

    return (
        <main className="min-h-screen bg-[#f5f0e8] px-6 py-10 text-[#17352d] lg:px-10">
            <Head title="Rider deliveries" />
            <div className="mx-auto max-w-5xl">
                <header className="mb-10 flex items-end justify-between border-b border-[#17352d]/15 pb-6">
                    <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ca5b3e]">Rider dashboard</p><h1 className="mt-2 font-serif text-5xl tracking-tight">My deliveries</h1></div>
                    <form method="post" action="/logout"><input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.content ?? ''} /><button className="text-sm font-semibold text-[#ca5b3e]">Log out</button></form>
                </header>
                {flash.success && <p className="mb-6 rounded-xl bg-[#17352d] px-4 py-3 text-sm text-[#f5f0e8]">{flash.success}</p>}
                <div className="space-y-5">
                    {deliveries.length === 0 ? <p className="rounded-2xl bg-white/60 p-12 text-center font-serif text-2xl">No deliveries assigned.</p> : deliveries.map((delivery) => (
                        <article key={delivery.id} className="rounded-2xl border border-[#17352d]/10 bg-white/60 p-6">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-xs font-semibold uppercase tracking-widest text-[#ca5b3e]">Order #{delivery.order?.id}</p><h2 className="mt-1 font-serif text-2xl">{delivery.order?.customer?.name}</h2><p className="mt-1 text-sm text-[#17352d]/60">{delivery.order?.delivery_address}</p></div><select value={delivery.status} onChange={(event) => updateStatus(delivery, event.target.value)} className="rounded-full border border-[#17352d]/20 bg-transparent px-4 py-2 text-sm capitalize outline-none focus:border-[#ca5b3e]">{statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></div>
                            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#17352d]/10 pt-4 text-sm text-[#17352d]/65">{delivery.order?.items?.map((item) => <li key={item.id}>{item.quantity} × {item.product?.name}</li>)}</ul>
                        </article>
                    ))}
                </div>
            </div>
        </main>
    );
}