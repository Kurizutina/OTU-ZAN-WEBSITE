import { Head, useForm } from '@inertiajs/react';

export default function Login() {
    const form = useForm({ email: '', password: '' });

    function submit(event) {
        event.preventDefault();
        form.post('/login');
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f5f0e8] px-6 text-[#17352d]">
            <Head title="Admin login" />
            <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-[#17352d]/10 bg-white/60 p-8 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ca5b3e]">OTU ZAN</p>
                <h1 className="mt-2 font-serif text-4xl">Admin login</h1>
                <p className="mt-2 text-sm text-[#17352d]/60">Sign in to manage customer orders.</p>
                <div className="mt-8 space-y-4">
                    <input required type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} placeholder="Email address" className="w-full rounded-xl border border-[#17352d]/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-[#ca5b3e]" />
                    <input required type="password" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} placeholder="Password" className="w-full rounded-xl border border-[#17352d]/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-[#ca5b3e]" />
                    {form.errors.email && <p className="text-sm text-[#ca5b3e]">{form.errors.email}</p>}
                    <button disabled={form.processing} className="w-full rounded-full bg-[#17352d] px-5 py-3 text-sm font-semibold text-[#f5f0e8] disabled:opacity-50">{form.processing ? 'Signing in...' : 'Sign in'}</button>
                </div>
                <a href="/" className="mt-6 block text-center text-sm font-semibold text-[#ca5b3e]">Back to menu</a>
            </form>
        </main>
    );
}