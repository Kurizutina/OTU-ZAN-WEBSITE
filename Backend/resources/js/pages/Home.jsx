import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
}

export default function Home({ products = [], categories = [], flash = {} }) {
    const [cart, setCart] = useState(() => {
        try {
            return JSON.parse(window.localStorage.getItem('otu-zan-cart') ?? '[]');
        } catch {
            return [];
        }
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const checkoutForm = useForm({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        delivery_address: '',
        payment_method: 'cash',
        items: [],
    });

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
    const filteredProducts = products.filter((product) => {
        const matchesSearch = `${product.name} ${product.description}`.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'All' || product.category === category;
        return matchesSearch && matchesCategory;
    });

    useEffect(() => {
        window.localStorage.setItem('otu-zan-cart', JSON.stringify(cart));
    }, [cart]);

    function addToCart(product) {
        setCart((currentCart) => {
            const existingItem = currentCart.find((item) => item.id === product.id);

            if (existingItem) {
                return currentCart.map((item) => item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item);
            }

            return [...currentCart, { ...product, quantity: 1 }];
        });
    }

    function changeQuantity(productId, amount) {
        setCart((currentCart) => currentCart
            .map((item) => item.id === productId ? { ...item, quantity: item.quantity + amount } : item)
            .filter((item) => item.quantity > 0));
    }

    function submitOrder(event) {
        event.preventDefault();
        checkoutForm.transform((data) => ({
            ...data,
            items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
        })).post('/orders', {
            onSuccess: () => {
                setCart([]);
                setIsCartOpen(false);
                setIsCheckoutOpen(false);
                checkoutForm.reset();
            },
        });
    }

    return (
        <>
            <Head title="Menu" />
            <main className="min-h-screen bg-[#f5f0e8] text-[#17352d]">
                {flash.success && <div className="bg-[#ca5b3e] px-6 py-3 text-center text-sm font-semibold text-[#f5f0e8]">{flash.success}</div>}
                <header className="border-b border-[#17352d]/10 bg-[#f5f0e8]/95">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
                        <a href="/" className="font-serif text-2xl font-semibold tracking-tight">OTU ZAN</a>
                        <nav className="flex items-center gap-6 text-sm font-medium">
                            <a href="#menu" className="hidden transition-colors hover:text-[#ca5b3e] sm:block">Menu</a>
                            <button onClick={() => setIsCartOpen(true)} className="rounded-full bg-[#17352d] px-5 py-2.5 text-sm text-[#f5f0e8] transition-colors hover:bg-[#ca5b3e]">
                                Your order <span className="ml-2 opacity-60">{cartCount}</span>
                            </button>
                        </nav>
                    </div>
                </header>

                <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:pb-24 lg:pt-24">
                    <div className="flex flex-col justify-center">
                        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#ca5b3e]">Good food, made with care</p>
                        <h1 className="max-w-xl font-serif text-6xl leading-[0.95] tracking-tight sm:text-7xl">A little joy in every bite.</h1>
                        <p className="mt-7 max-w-md text-lg leading-8 text-[#17352d]/70">Seasonal plates and refreshing drinks inspired by the places and people we love.</p>
                        <a href="#menu" className="mt-9 w-fit border-b-2 border-[#ca5b3e] pb-1 text-sm font-semibold text-[#ca5b3e]">Explore the menu <span aria-hidden="true">↓</span></a>
                    </div>
                    <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-[#d7a45d] lg:min-h-[480px]">
                        <img
                            src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85"
                            alt="A colorful bowl of fresh food"
                            className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
                        />
                        <div className="absolute bottom-5 left-5 rounded-full bg-[#f5f0e8] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#17352d]">Fresh today</div>
                    </div>
                </section>

                <section id="menu" className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
                    <div className="mb-8 flex items-end justify-between border-b border-[#17352d]/15 pb-5">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ca5b3e]">From the kitchen</p>
                            <h2 className="mt-2 font-serif text-4xl tracking-tight">Today&apos;s menu</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden gap-2 md:flex">
                                {['All', ...categories].map((option) => <button key={option} onClick={() => setCategory(option)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${category === option ? 'bg-[#17352d] text-[#f5f0e8]' : 'text-[#17352d]/55 hover:text-[#ca5b3e]'}`}>{option}</button>)}
                            </div>
                            <span className="hidden text-sm text-[#17352d]/55 sm:block">{filteredProducts.length} items</span>
                            <label className="flex items-center rounded-full border border-[#17352d]/15 bg-white/40 px-4 py-2">
                                <span className="sr-only">Search menu</span>
                                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search menu" className="w-28 bg-transparent text-sm outline-none placeholder:text-[#17352d]/45 sm:w-36" />
                                <span aria-hidden="true" className="text-sm text-[#17352d]/50">⌕</span>
                            </label>
                        </div>
                    </div>
                    {filteredProducts.length > 0 ? (
                        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                            {filteredProducts.map((product) => (
                                <article key={product.id} className="group">
                                    <div className="mb-4 aspect-[4/3] overflow-hidden rounded-2xl bg-[#dfd5c6]">
                                        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                    </div>
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="font-serif text-2xl leading-tight">{product.name}</h3>
                                        <span className="shrink-0 pt-1 text-sm font-semibold text-[#ca5b3e]">{formatPrice(product.price)}</span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-[#17352d]/60">{product.description}</p>
                                    <div className="mt-4 flex items-center justify-between gap-3"><span className="text-xs text-[#17352d]/50">{product.stock} available</span><button disabled={product.stock < 1} onClick={() => addToCart(product)} className="text-sm font-semibold text-[#17352d] transition-colors hover:text-[#ca5b3e] disabled:cursor-not-allowed disabled:text-[#17352d]/35">{product.stock > 0 ? <>Add to order <span aria-hidden="true">+</span></> : 'Sold out'}</button></div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className="py-16 text-center text-[#17352d]/60">No menu items match your search.</p>
                    )}
                </section>

                {isCartOpen && (
                    <div className="fixed inset-0 z-20 bg-[#17352d]/35" onClick={() => setIsCartOpen(false)}>
                        <aside
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="cart-title"
                            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#f5f0e8] p-6 shadow-2xl sm:p-8"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-[#17352d]/15 pb-5">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ca5b3e]">Your selection</p>
                                    <h2 id="cart-title" className="mt-1 font-serif text-3xl">Your order</h2>
                                </div>
                                <button onClick={() => setIsCartOpen(false)} aria-label="Close cart" className="text-2xl text-[#17352d]/60 hover:text-[#ca5b3e]">×</button>
                            </div>

                            {cart.length > 0 ? (
                                <>
                                    <div className="flex-1 divide-y divide-[#17352d]/10 overflow-y-auto">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex gap-4 py-5">
                                                <img src={item.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex justify-between gap-3">
                                                        <h3 className="font-serif text-xl leading-tight">{item.name}</h3>
                                                        <span className="shrink-0 text-sm font-semibold text-[#ca5b3e]">{formatPrice(Number(item.price) * item.quantity)}</span>
                                                    </div>
                                                    <div className="mt-3 flex items-center gap-3 text-sm">
                                                        <button onClick={() => changeQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`} className="h-7 w-7 rounded-full border border-[#17352d]/20 hover:border-[#ca5b3e]">−</button>
                                                        <span>{item.quantity}</span>
                                                        <button onClick={() => changeQuantity(item.id, 1)} aria-label={`Add one ${item.name}`} className="h-7 w-7 rounded-full border border-[#17352d]/20 hover:border-[#ca5b3e]">+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-[#17352d]/15 pt-5">
                                        <div className="mb-4 flex justify-between text-lg font-semibold">
                                            <span>Total</span>
                                            <span>{formatPrice(cartTotal)}</span>
                                        </div>
                                        {!isCheckoutOpen ? (
                                            <button onClick={() => setIsCheckoutOpen(true)} className="w-full rounded-full bg-[#17352d] px-5 py-3 text-sm font-semibold text-[#f5f0e8] transition-colors hover:bg-[#ca5b3e]">Continue to checkout</button>
                                        ) : (
                                            <form onSubmit={submitOrder} className="space-y-3">
                                                <h3 className="font-serif text-2xl">Delivery details</h3>
                                                <input required value={checkoutForm.data.customer_name} onChange={(event) => checkoutForm.setData('customer_name', event.target.value)} placeholder="Full name" className="w-full rounded-xl border border-[#17352d]/15 bg-white/60 px-4 py-3 text-sm outline-none focus:border-[#ca5b3e]" />
                                                <input required type="email" value={checkoutForm.data.customer_email} onChange={(event) => checkoutForm.setData('customer_email', event.target.value)} placeholder="Email address" className="w-full rounded-xl border border-[#17352d]/15 bg-white/60 px-4 py-3 text-sm outline-none focus:border-[#ca5b3e]" />
                                                <input value={checkoutForm.data.customer_phone} onChange={(event) => checkoutForm.setData('customer_phone', event.target.value)} placeholder="Phone (optional)" className="w-full rounded-xl border border-[#17352d]/15 bg-white/60 px-4 py-3 text-sm outline-none focus:border-[#ca5b3e]" />
                                                <textarea required rows="3" value={checkoutForm.data.delivery_address} onChange={(event) => checkoutForm.setData('delivery_address', event.target.value)} placeholder="Delivery address" className="w-full resize-none rounded-xl border border-[#17352d]/15 bg-white/60 px-4 py-3 text-sm outline-none focus:border-[#ca5b3e]" />
                                                <select value={checkoutForm.data.payment_method} onChange={(event) => checkoutForm.setData('payment_method', event.target.value)} className="w-full rounded-xl border border-[#17352d]/15 bg-white/60 px-4 py-3 text-sm capitalize outline-none focus:border-[#ca5b3e]"><option value="cash">Cash on delivery</option><option value="gcash">GCash</option><option value="card">Card</option></select>
                                                {Object.keys(checkoutForm.errors).length > 0 && <p className="text-sm text-[#ca5b3e]">Please check the highlighted checkout details and try again.</p>}
                                                <button disabled={checkoutForm.processing} className="w-full rounded-full bg-[#ca5b3e] px-5 py-3 text-sm font-semibold text-[#f5f0e8] transition-opacity disabled:opacity-50">{checkoutForm.processing ? 'Sending order...' : 'Place order'}</button>
                                            </form>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-1 flex-col items-center justify-center text-center">
                                    <p className="font-serif text-2xl">Your order is empty.</p>
                                    <p className="mt-2 text-sm text-[#17352d]/60">Add something delicious from today&apos;s menu.</p>
                                    <button onClick={() => setIsCartOpen(false)} className="mt-6 border-b-2 border-[#ca5b3e] pb-1 text-sm font-semibold text-[#ca5b3e]">Back to menu</button>
                                </div>
                            )}
                        </aside>
                    </div>
                )}
            </main>
        </>
    );
}
