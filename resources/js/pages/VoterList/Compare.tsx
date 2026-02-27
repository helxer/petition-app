import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { Line } from 'react-chartjs-2'; // Додаємо графік
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { formatDate } from '@/lib/utils';
import PetitionNote from '@/components/PetitionNote';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Compare({ petition, targetUser, voters, stats, compareChartData, userNote }: any) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredVoters = voters.filter((voter: any) =>
        voter.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const chartData = {
        labels: compareChartData.map((d: any) => formatDate(d.x)),
        datasets: [{
            label: 'Підписи',
            data: compareChartData.map((d: any) => d.y),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            tension: 0.3,
            pointRadius: 4,
        }]
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-slate-50 p-4 md:p-8">
                <Head title="Порівняння списків" />
                <div className="mx-auto max-w-5xl space-y-6">

                    {/* Шапка з інфою */}
                    <div className="mb-8 rounded-xl bg-white p-8 shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 leading-tight">
                                    Аналіз підписів
                                </h1>
                                <p className="text-slate-500 mt-2">
                                    Список користувача <span className="font-bold text-slate-700">{targetUser.name} </span>
                                    для петиції <a href={`/petitions/${petition.petition_id}`} rel="noreferrer" className="text-blue-600 font-bold">#{petition.petition_id}</a>
                                </p>
                            </div>
                            <div className="flex flex-row gap-4">
                                <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                    <span className="text-xs text-slate-400 block uppercase">У списку</span>
                                    <span className="font-bold text-slate-700">{stats.total} осіб</span>
                                </div>
                                <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                                    <span className="text-xs text-green-600 block uppercase">Підписали</span>
                                    <span className="font-bold text-green-700">{stats.signed} осіб</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {compareChartData.length > 0 && (
                        <div className="rounded-xl bg-white p-8 shadow-sm border border-slate-200">
                            <div className="h-[300px]">
                                <Line options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { beginAtZero: true, ticks: { precision: 0 } },
                                    },
                                }} data={chartData} />
                            </div>
                        </div>
                    )}

                    <PetitionNote petitionId={petition.petition_id} initialNote={userNote} />

                    <div className="sticky top-20 z-10">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Швидкий пошук по вашому списку (ПІБ)..."
                                className="w-full rounded-xl bg-white border-slate-200 py-4 pl-12 pr-4 shadow-md focus:ring-2 focus:ring-blue-500 transition-all text-lg"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg className="absolute left-4 top-4.5 h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 font-bold"
                                >
                                    Очистити
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Таблиця результатів */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {filteredVoters.length > 0 ? (
                                filteredVoters.map((voter: any) => (
                                    <div key={voter.id} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-slate-800">{voter.full_name}</span>
                                                {voter.is_signed && voter.voted_at && (
                                                    <span className="text-[11px] font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                                        {formatDate(voter.voted_at)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {voter.is_signed ? (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-xs font-black uppercase tracking-tighter shadow-sm border border-green-200">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Підписано
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-400 rounded-xl text-xs font-black uppercase tracking-tighter border border-red-100 italic">
                                                Немає підпису
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center">
                                    <div className="text-slate-300 text-5xl mb-4 text-center">🔎</div>
                                    <p className="text-slate-500 font-medium">Нікого не знайдено за запитом "{searchTerm}"</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Підвал з підсумком */}
                    <div className="text-center pb-12">
                        <p className="text-slate-400 text-sm italic">
                            Відображено {filteredVoters.length} з {voters.length} осіб вашого списку
                        </p>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}
