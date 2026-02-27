import React, { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import { usePage } from '@inertiajs/react';

export default function PetitionNote({ petitionId, initialNote }: { petitionId: string, initialNote: string }) {
    const { props } = usePage() as any;
    const { auth } = props as any;

    const [note, setNote] = useState(initialNote);
    const [saving, setSaving] = useState(false);

    const debouncedSave = useCallback(
        debounce((content: string) => {
            setSaving(true);
            axios.post(`/api/petitions/${petitionId}/note`, { content })
                .then(() => setSaving(false))
                .catch(() => setSaving(false));
        }, 1000),
        [petitionId]
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNote(e.target.value);
        debouncedSave(e.target.value);
    };

    if (!auth.user) return null;

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Мої нотатки</h3>
                {saving && <span className="text-[10px] font-bold text-blue-500 animate-pulse">Зберігаю...</span>}
            </div>
            <textarea
                value={note}
                onChange={handleChange}
                placeholder="Напишіть щось про цю петицію (план дій, контакти, статус)..."
                className="w-full min-h-[120px] rounded-xl border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 focus:border-blue-300 focus:ring-0 transition-all resize-none"
            />
        </div>
    );
}
