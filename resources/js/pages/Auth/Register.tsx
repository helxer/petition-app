import { useForm, Head, Link } from '@inertiajs/react';
import React from 'react';
import MainLayout from '@/layouts/MainLayout';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <MainLayout>
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Head title="Реєстрація" />
                <form onSubmit={submit} className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm border border-slate-200">
                    <h1 className="mb-6 text-2xl font-bold text-slate-800">Створити акаунт</h1>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Ім'я</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-center text-xl font-mono"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-center text-xl font-mono"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                required
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
                                required
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Підтвердження пароля</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-center text-xl font-mono"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                required
                            />
                        </div>

                        <button
                            disabled={processing}
                            className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {processing ? 'Створення...' : 'Зареєструватися'}
                        </button>

                        <p className="text-center text-sm text-slate-500 mt-4">
                            Вже маєте акаунт? <Link href="/login" className="text-blue-600 hover:underline">Увійти</Link>
                        </p>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
