import { useForm, Head } from '@inertiajs/react';
import React from 'react';
import { check } from '@/actions/App/Http/Controllers/PetitionController';
import MainLayout from '@/layouts/MainLayout';

export default function Welcome() {
    const { data, setData, post, processing, errors } = useForm({
        petition_id: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(check.url());
    };

    return (
        <MainLayout>
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Head title="Аналіз петицій" />

                <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
                    <h1 className="mb-6 text-2xl font-bold text-slate-800">Аналіз голосів петицій</h1>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">№ Петиції</label>
                            <input
                                id="petition_id"
                                type="number"
                                value={data.petition_id}
                                onChange={(e) => setData('petition_id', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-center text-xl font-mono"
                                placeholder="000000"
                                required
                            />
                            {errors.petition_id && (
                                <div className="text-red-500 text-sm mt-1">{errors.petition_id}</div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {processing ? 'Запуск аналізу...' : 'Розпочати збір даних'}
                        </button>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}
