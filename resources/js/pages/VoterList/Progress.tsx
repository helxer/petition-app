import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';

export default function Progress({ progressData, totalInList, auth }: any) {
    return (
        <MainLayout>
            <Head title="Прогрес по петиціях" />
            <div className="min-h-screen bg-slate-50 p-4 md:p-8">
                <div className="mx-auto max-w-7xl">

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {progressData.map((item: any) => (
                            <Link
                                key={item.petition_id}
                                href={`/petitions/${item.petition_id}/compare/${auth.user.id}`}
                                className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="bg-slate-100 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full font-mono">
                                            #{item.petition_id}
                                        </span>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                            item.percentage < 30 ? 'bg-red-50 text-red-500' :
                                                item.percentage < 70 ? 'bg-amber-50 text-amber-500' : 'bg-green-50 text-green-500'
                                        }`}>
                                            {item.percentage}%
                                        </div>
                                    </div>

                                    <h3 className="text-slate-800 font-bold leading-tight mb-6 group-hover:text-blue-600 transition-colors line-clamp-3">
                                        {item.title}
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Підписи</div>
                                        <div className="text-xl font-black text-slate-800">
                                            {item.signed_count} <span className="text-slate-300 text-sm">/ {totalInList}</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${
                                                item.percentage < 30 ? 'bg-red-500' :
                                                    item.percentage < 70 ? 'bg-amber-500' : 'bg-blue-600'
                                            }`}
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {progressData.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                            <p className="text-slate-400">Ви ще не почали роботу з жодною петицією</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
