import { Head, router } from '@inertiajs/react';
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title as ChartTitle,
    Tooltip,
} from 'chart.js';
import { debounce } from 'lodash';
import { show, refresh } from '@/actions/App/Http/Controllers/PetitionController';
import React, { useCallback, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend);

export default function Show({ petition, chartData, latestVotes, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [loading, setLoading] = useState(false);

    // Polling: оновлюємо дані кожні 10 секунд
    useEffect(() => {
        const interval = setInterval(() => {
            const only = search ? ['petition', 'chartData'] : ['petition', 'chartData', 'latestVotes'];
            router.reload({ only, preserveScroll: true });
        }, 10000);
        return () => clearInterval(interval);
    }, [search]);

    const handleSearch = useCallback(
        debounce((query: string) => {
            router.get(
                show.url({ petition_id: petition.petition_id }),
                { search: query },
                { preserveState: true, preserveScroll: true, only: ['latestVotes'] }
            );
        }, 300), // 300мс затримка
        [petition.petition_id]
    );

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        handleSearch(value);
    };

    // Форматування дати Y-m-d
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };

    const handleRefresh = () => {
        setLoading(true);
        router.post(refresh.url({ petition_id: petition.petition_id }), {}, {
            onFinish: () => setLoading(false),
            preserveScroll: true
        });
    };

    const data = {
        labels: chartData.map((d: any) => formatDate(d.voted_at || d.x)),
        datasets: [
            {
                label: 'Голосів за день',
                data: chartData.map((d: any) => d.count || d.y),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <Head title={petition.title} />

            <div className="mx-auto max-w-5xl space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                        <a href={`https://petition.president.gov.ua/petition/${petition.petition_id}`} className="text-2xl font-bold text-slate-900" target="_blank">
                            {petition.title}
                        </a>
                        <div className="flex flex-col justify-center">
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-nowrap text-white transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                            >
                                <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                {loading ? 'Оновлення...' : 'Оновити дані'}
                            </button>
                            <p className="mt-1 font-mono text-xs tracking-widest text-nowrap text-slate-400 uppercase">
                                {new Date(petition.updated_at).toLocaleString('uk-UA')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 border-y border-slate-100 py-6 md:grid-cols-4">
                        <div>
                            <p className="text-xs font-medium tracking-wider text-slate-400 uppercase">Автор</p>
                            <p className="font-semibold text-nowrap text-slate-700">{petition.author}</p>
                        </div>
                        <div>
                            <p className="text-center text-xs font-medium tracking-wider text-slate-400 uppercase">Голосів (сайт)</p>
                            <p className="text-center font-semibold text-blue-600">{petition.votes_count}</p>
                        </div>
                        <div>
                            <p className="text-center text-xs font-medium tracking-wider text-slate-400 uppercase">Зібрано нами</p>
                            <p className="text-center font-semibold text-green-600">
                                {petition.votes_count_count ?? petition.total_votes_collected ?? 'рахуємо...'}
                            </p>
                        </div>
                        <div>
                            <p className="text-right text-xs font-medium tracking-wider text-slate-400 uppercase">Оприлюднено</p>
                            <p className="text-right font-semibold text-slate-700">{formatDate(petition.published_at)}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 px-2 text-lg font-bold text-slate-800">Динаміка голосування</h3>
                    <div className="h-[300px]">
                        <Line
                            data={data}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: { beginAtZero: true, ticks: { precision: 0 } },
                                },
                            }}
                        />
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <h3 className="px-2 text-lg font-bold text-slate-800">{search ? 'Результати пошуку' : 'Останні голоси'}</h3>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Пошук підписанта..."
                                value={search}
                                onChange={onSearchChange}
                                className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 md:w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-100">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3">ПІБ Підписанта</th>
                                    <th className="px-6 py-3 text-right">Дата голосу</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {latestVotes.length > 0 ? (
                                    latestVotes.map((vote: any) => (
                                        <tr key={vote.id} className="transition-colors hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-700">{vote.full_name}</td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-500">{formatDate(vote.voted_at)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="px-6 py-10 text-center text-slate-400">
                                            Нікого не знайдено
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
                    <h3 className="mb-4 text-lg font-bold text-slate-800">Опис петиції</h3>
                    <div
                        className="prose prose-slate max-w-none leading-relaxed text-slate-600"
                        dangerouslySetInnerHTML={{ __html: petition.description }}
                    />
                </div>
            </div>
        </div>
    );
}
