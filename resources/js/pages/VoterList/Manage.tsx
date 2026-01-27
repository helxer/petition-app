import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { debounce } from 'lodash';

export default function Manage({ initialPetition, initialSelectedVoters }: any) {
    const { auth } = usePage().props as any;

    // Стан для петицій (Крок 1)
    const [petitions, setPetitions] = useState([]);
    const [petSearch, setPetSearch] = useState('');
    const [selectedPetition, setSelectedPetition] = useState<any>(initialPetition || auth.user?.current_petition);

    // Стан для підписантів (Крок 2)
    const [myVotersSearch, setMyVotersSearch] = useState('');
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [myVoters, setMyVoters] = useState(initialSelectedVoters || []);
    const [loading, setLoading] = useState(false);

    // 1. Пошук петицій
    const fetchPetitions = useCallback(debounce((q) => {
        axios.get(`/api/search-petitions?q=${q}`).then(res => setPetitions(res.data));
    }, 300), []);

    useEffect(() => {
        if (petSearch.length > 2) fetchPetitions(petSearch);
        else setPetitions([]);
    }, [petSearch]);

    // 2. Зміна петиції (з автозбереженням у базу юзера)
    const handlePetitionChange = async (petition: any) => {
        const petitionId = petition ? petition.petition_id : null;

        if (myVoters.length > 0 && petitionId !== selectedPetition?.petition_id) {
            if (!confirm('Зміна петиції призведе до повного очищення вашого поточного списку. Продовжити?')) {
                return;
            }
        }

        // Зберігаємо вибір у модель юзера та очищуємо список на бекенді якщо треба
        await axios.post('/api/my-list/set-petition', { petition_id: petitionId });

        setSelectedPetition(petition);
        if (petitionId !== selectedPetition?.petition_id) setMyVoters([]);

        setPetSearch('');
        setPetitions([]);
        setSearchResults([]);
        setSearch('');
    };

    // 3. Пошук вотерів (Випадайка)
    const fetchVoters = useCallback(debounce((id, q) => {
        setLoading(true);
        axios.get(`/api/petitions/${id}/search-voters?q=${q}`)
            .then(res => {
                setSearchResults(res.data);
                setLoading(false);
            });
    }, 400), []);

    useEffect(() => {
        if (selectedPetition && search.length >= 3) {
            fetchVoters(selectedPetition.petition_id, search);
        } else {
            setSearchResults([]);
        }
    }, [search, selectedPetition]);

    // 4. Додавання/видалення вотера (Toggle)
    const toggleVoter = async (voter: any) => {
        const res = await axios.post('/api/my-list/toggle', { voter_id: voter.id });
        if (res.data.status === 'attached') {
            setMyVoters((prev: any) => [voter, ...prev]);
        } else {
            setMyVoters((prev: any) => prev.filter((v: any) => v.id !== voter.id));
        }
    };

    // Фільтруємо результати, щоб не показувати тих, хто вже в списку
    const filteredResults = searchResults.filter(
        (result: any) => !myVoters.some((fav: any) => fav.id === result.id)
    );

    const displayedMyVoters = myVoters.filter((v: any) =>
        v.full_name.toLowerCase().includes(myVotersSearch.toLowerCase())
    );

    return (
        <MainLayout>
            <div className="min-h-screen bg-slate-50 p-4 md:p-8">
                <Head title="Керування списком" />

                <div className="mx-auto max-w-5xl space-y-6">
                    {/* КРОК 1: ВИБІР ПЕТИЦІЇ */}
                    <div className="mb-10 rounded-xl bg-white p-8 shadow-sm border border-slate-200 transition-all">
                        <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Петиція</h2>

                        {!selectedPetition ? (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Введіть назву або ID петиції для пошуку..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-center text-xl font-mono"
                                    value={petSearch}
                                    onChange={e => setPetSearch(e.target.value)}
                                />
                                {petitions.length > 0 && (
                                    <div className="absolute z-30 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
                                        {petitions.map((p: any) => (
                                            <div
                                                key={p.petition_id}
                                                onClick={() => handlePetitionChange(p)}
                                                className="p-5 hover:bg-blue-50 cursor-pointer border-b last:border-0 border-slate-50 transition-colors"
                                            >
                                                <div className="font-bold text-slate-800 text-lg">{p.title}</div>
                                                <div className="text-xs text-slate-400 font-mono mt-1">ID: {p.petition_id}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl text-white shadow-lg shadow-blue-200">
                                <div className="flex-1 pr-4">
                                    <div className="font-black text-xl leading-tight">{selectedPetition.title}</div>
                                    <div className="text-xs mt-1 opacity-60 font-mono">ID: {selectedPetition.petition_id}</div>
                                </div>
                                <button
                                    onClick={() => handlePetitionChange(null)}
                                    className="flex-shrink-0 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-black transition-all border border-white/20"
                                >
                                    ЗМІНИТИ
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ОСНОВНА СІТКА */}
                    <div className="rounded-xl bg-white p-8 shadow-sm border border-slate-200 transition-all grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

                        {/* ЛІВА КОЛОНКА: ПОШУК ПІДПИСАНТІВ */}
                        <div className="space-y-6">
                            <div className="px-2 flex justify-between items-center">
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Пошук</h2>
                                {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>}
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={selectedPetition ? "Введіть ПІБ..." : "Спочатку оберіть петицію вище"}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-center text-xl font-mono"
                                        disabled={!selectedPetition}
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                    <svg className="absolute left-4 top-4.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {searchResults.filter(r => !myVoters.some(m => m.id === r.id)).map((v: any) => (
                                        <div key={v.id} onClick={() => toggleVoter(v)} className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 cursor-pointer transition-all">
                                            <span className="font-medium">{v.full_name}</span>
                                            <span className="text-blue-600 font-bold">+</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ПРАВА КОЛОНКА: ВІДОБРАЖЕННЯ СПИСКУ */}
                        <div className="space-y-6">
                            <div className="px-2 flex justify-between items-center">
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Мій список</h2>
                                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-black">{myVoters.length}</span>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Швидкий пошук у списку..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-center text-xl font-mono"
                                        disabled={!selectedPetition}
                                        value={myVotersSearch}
                                        onChange={e => setMyVotersSearch(e.target.value)}
                                    />
                                    <svg className="absolute left-4 top-4.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {displayedMyVoters.map((v: any) => (
                                        <div key={v.id} onClick={() => toggleVoter(v)} className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 cursor-pointer transition-all">
                                            <span className="font-medium">{v.full_name}</span>
                                            <span className="text-red-400 font-bold">✕</span>
                                        </div>
                                    ))}

                                    {myVoters.length > 0 && displayedMyVoters.length === 0 && (
                                        <div className="py-20 text-center text-slate-500">
                                            <p>Нікого не знайдено за запитом "{myVotersSearch}"</p>
                                        </div>
                                    )}

                                    {myVoters.length === 0 && (
                                        <div className="py-24 text-center">
                                            <div className="text-slate-600 text-4xl mb-4">📋</div>
                                            <p className="text-slate-500 font-medium">Ваш список порожній</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
