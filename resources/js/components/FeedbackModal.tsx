import React, { useState } from 'react';
import axios from 'axios';

export default function FeedbackModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(5);
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (loading) return;

        setLoading(true);

        try {
            await axios.post('/api/feedback/store', {
                message,
                rating,
                page_url: window.location.href
            });

            setSent(true);
            setTimeout(() => {
                setIsOpen(false);
                setSent(false);
                setMessage('');
                setLoading(false);
            }, 2000);
        } catch (error) {
            console.error('Помилка відправки:', error);
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl hover:scale-110 transition-all group"
            >
                <span className="text-xl group-hover:rotate-12 transition-transform">💬</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
                        {!sent ? (
                            <>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Ваш фідбек</h3>
                                <p className="text-slate-500 text-sm mb-6">Допоможіть нам зробити проект кращим.</p>

                                <div className="flex gap-2 mb-6 justify-center text-2xl">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            disabled={loading}
                                            onClick={() => setRating(star)}
                                            className={rating >= star ? 'grayscale-0' : 'grayscale opacity-30'}
                                        >
                                            ⭐
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    className="w-full rounded-xl border-slate-100 bg-slate-50 p-4 text-sm focus:ring-blue-500 mb-4 h-32 disabled:opacity-50"
                                    placeholder="Ваш коментар..."
                                    value={message}
                                    disabled={loading}
                                    onChange={(e) => setMessage(e.target.value)}
                                />

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        disabled={loading}
                                        className="flex-1 py-3 font-bold text-slate-400 disabled:invisible"
                                    >
                                        Скасувати
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={message.length < 5 || loading}
                                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Надсилаю...
                                            </>
                                        ) : 'Надіслати'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="py-10 text-center">
                                <div className="text-5xl mb-4">🚀</div>
                                <h3 className="text-xl font-black text-slate-900">Відправлено!</h3>
                                <p className="text-slate-500">Дякуємо, що допомагаєте нам рости.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
