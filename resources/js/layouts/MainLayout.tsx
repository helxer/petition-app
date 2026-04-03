import { Link, usePage, router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import FeedbackModal from '@/components/FeedbackModal';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const { props, url } = usePage() as any;
    const { auth, flash } = props as any;

    useEffect(() => {
        if (flash?.error || flash?.success) {
            setShowAlert(true);

            const timer = setTimeout(() => {
                setShowAlert(false);
            }, 8000);

            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex h-16 justify-between items-center">

                        <div className="flex items-center gap-3 sm:gap-6">
                            <Link href="/" className="text-lg font-black text-blue-600 tracking-tighter shrink-0">
                                PETITION<span className="text-slate-800">TRACK</span>
                            </Link>

                            {/* Завжди видима кнопка "Всі петиції" */}
                            <Link
                                href="/petitions"
                                className={`text-xs sm:text-sm font-bold px-3 py-2 rounded-xl transition-all ${
                                    url.startsWith('/petitions')
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                📊 <span className="hidden xs:inline">Всі петиції</span>
                                <span className="xs:inline hidden ml-1 text-[10px] opacity-70 italic">active</span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Десктопне меню */}
                            <div className="hidden md:flex items-center gap-6 mr-4 border-r border-slate-200 pr-6">
                                {auth.user && (
                                    <>
                                        <Link href="/my-list/manage" className="text-sm font-bold text-slate-600">🎯 Мій список</Link>
                                        {auth.hasVoters && (
                                            <>
                                                <Link href="/my-list/progress" className="text-sm font-bold text-slate-600">📉 Прогрес</Link>
                                                <Link href="/my-list/leaderboard" className="text-sm font-bold text-amber-600">🏆 Лідерборд</Link>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Профіль/Вихід або Бургер */}
                            {auth.user ? (
                                <div className="flex items-center gap-2">
                                    <span className="hidden lg:block text-xs font-bold text-slate-400 uppercase">{auth.user.name}</span>
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="p-2 rounded-xl bg-slate-100 text-slate-600 md:hidden"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                        </svg>
                                    </button>
                                    <button onClick={handleLogout} className="hidden md:block text-xs font-black text-red-500 hover:text-red-700 uppercase tracking-tighter">
                                        Вийти
                                    </button>
                                </div>
                            ) : (
                                <Link href="/login" className="text-sm font-bold text-blue-600">Увійти</Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Мобільна випадайка (тільки те, що не влізло) */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-slate-100 bg-white p-4 space-y-4 shadow-xl">
                        {auth.user && (
                            <>
                                <Link href="/my-list/manage" className="block text-sm font-bold text-slate-700">🎯 Мій список</Link>
                                {auth.hasVoters && (
                                    <>
                                        <Link href="/my-list/progress" className="block text-sm font-bold text-slate-700">📉 Прогрес</Link>
                                        <Link href="/my-list/leaderboard" className="block text-sm font-bold text-amber-600">🏆 Лідерборд</Link>
                                    </>
                                )}
                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-400">{auth.user.name}</span>
                                    <button onClick={handleLogout} className="text-sm font-bold text-red-600">Вийти</button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </nav>
            <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 w-full max-w-sm px-4">
                {showAlert && (flash?.error || flash?.success) && (
                    <div className={`
                    relative flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md
                    animate-in slide-in-from-right-full duration-300
                    ${flash.error
                        ? 'bg-red-50/90 border-red-200 text-red-800'
                        : 'bg-emerald-50/90 border-emerald-200 text-emerald-800'}
                `}>
                        <div className="text-xl">
                            {flash.error ? '🚫' : '✅'}
                        </div>

                        <div className="flex-1 pr-6">
                            <p className="text-sm font-bold leading-tight">
                                {flash.error || flash.success}
                            </p>
                        </div>

                        <button
                            onClick={() => setShowAlert(false)}
                            className="absolute top-3 right-3 opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
            <main>{children}</main>
            <FeedbackModal />
        </div>
    );
}
