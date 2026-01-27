import { Link, usePage, router } from '@inertiajs/react';
import React from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    // Отримуємо дані про користувача з глобальних пропсів Inertia
    const { props, url } = usePage() as any;
    const { auth } = props as any;

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/logout');
    };

    const isAuthPage = url.startsWith('/login') || url.startsWith('/register');

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="text-xl font-black text-blue-600 tracking-tight">
                                PETITION<span className="text-slate-800">TRACK</span>
                            </Link>
                            <Link
                                href="/petitions"
                                className={`text-sm font-bold transition-colors ${
                                    url.startsWith('/petitions') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                                }`}
                            >
                                📊 Всі петиції
                            </Link>
                            {auth.user && (
                                <Link
                                    href="/my-list/manage"
                                    className={`text-sm font-bold transition-colors ${
                                        url.startsWith('/my-list') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                                    }`}
                                >
                                    🎯 Мій список
                                </Link>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <div className="flex items-center gap-6">
                                    <span className="text-sm font-medium text-slate-700">
                                        👋 {auth.user.name}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
                                    >
                                        Вийти
                                    </button>
                                </div>
                            ) : (
                                !isAuthPage && (
                                    <div className="flex items-center gap-3">
                                        <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 px-4 py-2">
                                            Увійти
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95"
                                        >
                                            Реєстрація
                                        </Link>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Контент сторінки */}
            <main>{children}</main>
        </div>
    );
}
