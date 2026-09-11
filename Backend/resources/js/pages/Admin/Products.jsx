import { Head, router, useForm } from '@inertiajs/react';

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

export default function Products({ products = [], flash = {} }) {
    const form = useForm({ name: '', description: '', category: 'menu', price: '', stock: 20, image: '' });
    const editForm = useForm({ name: '', description: '', category: 'menu', price: '', stock: 20, image: '', is_available: true });

    function submit(event) {
        event.preventDefault();
        form.post('/admin/products', { onSuccess: () => form.reset() });
    }

    function editProduct(product) {
        editForm.setData({
            name: product.name,
            description: product.description ?? '',
            category: product.category ?? 'menu',
            price: product.price,
            stock: product.stock,
            image: product.image ?? '',
            is_available: product.is_available,
        });
        editForm.patch(`/admin/products/${product.id}`);
    }

    return (
        <>
            <Head title="Products" />
            <main className="min-h-screen bg-[#f5f0e8] px-6 py-10 text-[#17352d] lg:px-10">
                <div className="mx-auto max-w-6xl">
                    <header className="mb-10 flex flex-col justify-between gap-5 border-b border-[#17352d]/15 pb-6 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ca5b3e]">Operations</p>
                            <h1 className="mt-2 font-serif text-5xl tracking-tight">Products</h1>
                        </div>
                        <nav className="flex gap-5 text-sm font-semibold">
                            <a href="/admin/orders" className="text-[#17352d]/60 hover:text-[#ca5b3e]">Orders</a>
                            <a href="/" className="text-[#ca5b3e]">Menu</a>
                        </nav>
                    </header>
                    {flash.success && <p className="mb-6 rounded-xl bg-[#17352d] px-4 py-3 text-sm text-[#f5f0e8]">{flash.success}</p>}
                    <section className="mb-10 rounded-2xl border border-[#17352d]/10 bg-white/60 p-6">
                        <h2 className="font-serif text-2xl">Add a product</h2>
                        <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <input required value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} placeholder="Name" className="rounded-xl border border-[#17352d]/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-[#ca5b3e]" />
                            <input required value={form.data.category} onChange={(event) => form.setData('category', event.target.value)} placeholder="Category" className="rounded-xl border border-[#17352d]/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-[#ca5b3e]" />
                            <input required type="number" step="0.01" min="0" value={form.data.price} onChange={(event) => form.setData('price', event.target.value)} placeholder="Price" className="rounded-xl border border-[#17352d]/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-[#ca5b3e]" />
                            <input required type="number" min="0" value={form.data.stock} onChange={(event) => form.setData('stock', event.target.value)} placeholder="Stock" className="rounded-xl border border-[#17352d]/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-[#ca5b3e]" />
                            <input value={form.data.image} onChange={(event) => form.setData('image', event.target.value)} placeholder="Image URL (optional)" className="rounded-xl border border-[#17352d]/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-[#ca5b3e]" />
                            <input value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} placeholder="Description (optional)" className="rounded-xl border border-[#17352d]/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-[#ca5b3e]" />
                            <button disabled={form.processing} className="rounded-full bg-[#17352d] px-5 py-3 text-sm font-semibold text-[#f5f0e8] transition-colors hover:bg-[#ca5b3e] disabled:opacity-50 sm:col-span-2 lg:col-span-4">{form.processing ? 'Adding...' : 'Add product'}</button>
                        </form>
                    </section>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <article key={product.id} className={`overflow-hidden rounded-2xl border border-[#17352d]/10 bg-white/60 ${!product.is_available ? 'opacity-50' : ''}`}>
                                {product.image && <img src={product.image} alt="" className="aspect-[4/3] w-full object-cover" />}
                                <div className="p-5">
                                    <div className="flex justify-between gap-3"><h2 className="font-serif text-2xl leading-tight">{product.name}</h2><span className="text-sm font-semibold text-[#ca5b3e]">{formatPrice(product.price)}</span></div>
                                    <p className="mt-2 text-sm leading-6 text-[#17352d]/60">{product.description}</p>
                                    <div className="mt-4 flex gap-4 text-sm font-semibold">
                                        <button onClick={() => editProduct({ ...product, name: window.prompt('Product name', product.name) ?? product.name, category: window.prompt('Category', product.category ?? 'menu') ?? product.category, price: window.prompt('Price', product.price) ?? product.price, stock: window.prompt('Stock', product.stock) ?? product.stock, description: window.prompt('Description', product.description ?? '') ?? product.description, image: window.prompt('Image URL', product.image ?? '') ?? product.image })} className="text-[#17352d] hover:text-[#ca5b3e]">Edit</button>
                                        <button onClick={() => router.patch(`/admin/products/${product.id}/availability`)} className="text-[#ca5b3e]">{product.is_available ? 'Mark unavailable' : 'Make available'}</button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}