import { Head, Link, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import React, { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { show } from '@/actions/App/Http/Controllers/PetitionController';
import { formatDate } from '@/lib/utils';

export default function Index({ petitions, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [list, setList] = useState(petitions.data);

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && petitions.next_page_url) {
            router.get(petitions.next_page_url, {}, {
                preserveState: true,
                preserveScroll: true,
                only: ['petitions'],
                onSuccess: (page) => {
                    setList((prev: any) => [...prev, ...page.props.petitions.data]);
                },
            });
        }
    }, [inView]);

    const handleSearch = useCallback(
        debounce((query: string) => {
            router.get('/petitions', { search: query }, {
                preserveState: true,
                replace: true,
                onSuccess: (page) => setList(page.props.petitions.data)
            });
        }, 300),
        []
    );

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        handleSearch(e.target.value);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <Head title="Петиції" />
            <div className="max-w-6xl mx-auto">

                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-black text-slate-900">Петиції</h1>
                    <div className="flex w-full md:w-auto gap-3">
                        <input
                            type="text"
                            placeholder="Пошук за назвою або №..."
                            value={search}
                            onChange={onSearchChange}
                            className="w-full md:w-80 rounded-2xl border-slate-200 bg-white px-5 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {list.map((petition: any) => (
                        <Link
                            key={petition.id}
                            href={show.url({ petition_id: petition.petition_id })}
                            className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                        >
                            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                                ID: {petition.petition_id}
                            </span>
                            <h2 className="mt-4 text-lg font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {petition.title}
                            </h2>

                            <div className="mt-6 flex items-end justify-between border-t border-slate-50 pt-4">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Голосів</p>
                                    <p className="text-xl font-black text-slate-800">{petition.votes_count.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Оновлено</p>
                                    <p className="text-xs font-medium text-slate-500">
                                        {formatDate(petition.updated_at, true)}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div ref={ref} className="py-10 flex justify-center">
                    {!!petitions.next_page_url && (
                        <div className="flex gap-2 items-center text-slate-400">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <span className="text-sm ml-2">Завантаження...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
