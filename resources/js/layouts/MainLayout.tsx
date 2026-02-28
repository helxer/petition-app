import { Link, usePage, router } from '@inertiajs/react';
import React, { useState } from 'react';
import FeedbackModal from '@/components/FeedbackModal';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Отримуємо дані про користувача з глобальних пропсів Inertia
    const { props, url } = usePage() as any;
    const { auth } = props as any;

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/logout');
    };

    const isAuthPage = url.startsWith('/login') || url.startsWith('/register');

    const NavLinks = () => (
        <>
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
                        url.startsWith('/my-list/manage') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                    }`}
                >
                    🎯 Мій список
                </Link>
            )}
            {auth.user && auth.hasVoters && (
                <>
                    <Link
                        href="/my-list/progress"
                        className={`text-sm font-bold transition-colors ${
                            url.startsWith('/my-list/progress') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                        }`}
                    >
                        📉 Прогрес
                    </Link>
                    <Link
                        href="/my-list/leaderboard"
                        className={`text-sm font-bold transition-colors ${
                            url.startsWith('/my-list/leaderboard') ? 'text-amber-600' : 'text-slate-600 hover:text-amber-600'
                        }`}
                    >
                        🏆 Лідерборд
                    </Link>
                </>
            )}
        </>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        {/* Logo */}
                        <div className="flex items-center gap-8">
                            <Link href="/" className="text-xl font-black text-blue-600 tracking-tight shrink-0">
                                PETITION<span className="text-slate-800">TRACK</span>
                            </Link>

                            {/* Desktop Links */}
                            <div className="hidden md:flex items-center gap-6">
                                <NavLinks />
                            </div>
                        </div>

                        {/* Desktop Auth */}
                        <div className="hidden md:flex items-center gap-4">
                            {auth?.user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-slate-500">{auth.user.name}</span>
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

                        {/* Mobile Menu Button */}
                        <div className="flex md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-500 hover:bg-slate-100 transition-all"
                            >
                                <span className="sr-only">Відкрити меню</span>
                                {isMenuOpen ? (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Content */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-slate-100 bg-white animate-in slide-in-from-top duration-200">
                        <div className="space-y-1 px-4 pb-3 pt-2 flex flex-col gap-3">
                            <NavLinks />
                            {(auth?.user || !isAuthPage) && (
                                <div className="pt-4 border-t border-slate-100">
                                    {auth?.user ? (
                                        <div className="flex flex-col gap-3">
                                            <p className="text-xs text-slate-400 px-1 font-bold uppercase tracking-widest">Профіль</p>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-slate-700">{auth.user.name}</span>
                                                <button onClick={handleLogout} className="text-sm font-bold text-red-600">Вийти</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <Link href="/login" className="block w-full text-center py-3 font-bold text-slate-600 bg-slate-50 rounded-xl">Увійти</Link>
                                            <Link href="/register" className="block w-full text-center py-3 font-bold text-white bg-blue-600 rounded-xl">Реєстрація</Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Контент сторінки */}
            <main>{children}</main>

            <FeedbackModal/>
        </div>
    );
}
