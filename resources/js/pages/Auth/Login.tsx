import { useForm, Head, Link } from '@inertiajs/react';
import React from 'react';
import MainLayout from '@/layouts/MainLayout';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <MainLayout>
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Head title="Вхід" />
                <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
                    <h1 className="mb-6 text-2xl font-bold text-slate-800">Вхід в систему</h1>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-center text-xl font-mono"
                                value={data.email}
                                autoComplete="email"
                                onChange={e => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Пароль</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-center text-xl font-mono"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                            />
                        </div>

                        <button
                            disabled={processing}
                            className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 transition-colors"
                        >
                            {processing ? 'Вхід...' : 'Увійти'}
                        </button>

                        <p className="text-center text-sm text-slate-500 mt-4">
                            Створити новий акаунт? <Link href="/register" className="text-blue-600 hover:underline">Реєстрація</Link>
                        </p>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
