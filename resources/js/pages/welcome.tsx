import { useForm, Head } from '@inertiajs/react';
import React from 'react';
import { check } from '@/actions/App/Http/Controllers/PetitionController';

export default function Welcome() {
    const { data, setData, post, processing, errors } = useForm({
        petition_id: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(check.url());
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <Head title="Аналіз петицій" />

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                {/*<div className="text-center mb-8">*/}
                {/*    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">*/}
                {/*        Artisan Parser*/}
                {/*    </h1>*/}
                {/*    <p className="text-slate-500 mt-2">Аналіз голосів петицій президента</p>*/}
                {/*</div>*/}

                <form onSubmit={submit} className="space-y-6">
                    <div>
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
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98]"
                    >
                        {processing ? 'Запуск аналізу...' : 'Розпочати збір даних'}
                    </button>
                </form>
            </div>
        </div>
    );
}
