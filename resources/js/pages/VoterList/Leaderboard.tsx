import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Head } from '@inertiajs/react';

export default function Leaderboard({ leaderboard }: any) {
    const [search, setSearch] = useState('');

    const filtered = leaderboard.filter((person: any) =>
        person.full_name.toLowerCase().includes(search.toLowerCase())
    );

    const maxSigned = leaderboard.length > 0 ? Math.max(...leaderboard.map((p: any) => p.total_signed)) : 1;

    return (
        <MainLayout>
            <Head title="Рейтинг учасників" />
            <div className="min-h-screen bg-slate-50 p-4 md:p-8">
                <div className="mx-auto max-w-4xl space-y-6">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                                🏆 Лідерборд <span className="text-blue-600">Учасників</span>
                            </h1>
                            <p className="text-slate-500 font-medium mt-1">
                                Хто підписав найбільше петицій з вашого списку
                            </p>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Пошук учасника..."
                                className="w-full md:w-64 rounded-xl border-slate-200 py-3 pl-4 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filtered.length > 0 ? (
                            filtered.map((person: any, index: number) => {
                                const percentage = maxSigned > 0 ? (person.total_signed / maxSigned) * 100 : 0;

                                return (
                                    <div key={person.id} className="group bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all">
                                        <div className="flex justify-between items-end mb-3">
                                            <div className="flex items-center gap-4">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-black text-sm ${
                                                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                        index === 1 ? 'bg-slate-100 text-slate-600' :
                                                            index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
                                                        {person.full_name}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-slate-900 leading-none">
                                                    {person.total_signed}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    Петицій
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full transition-all duration-1000 ease-out rounded-full ${
                                                    person.total_signed === 0 ? 'bg-slate-200' : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                                                }`}
                                                style={{ width: `${person.total_signed === 0 ? 5 : percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-20 text-center bg-white rounded-xl border border-dashed border-slate-300">
                                <p className="text-slate-400 font-medium">Нікого не знайдено за вашим запитом</p>
                            </div>
                        )}
                    </div>

                    <div className="text-center pb-10 text-slate-400 text-xs italic">
                        * Рейтинг базується на загальній кількості підписаних петицій у базі даних
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
