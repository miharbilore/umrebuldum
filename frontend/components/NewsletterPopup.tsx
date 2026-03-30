'use client';

import { useState, useEffect } from 'react';
import { X, Send, Mail } from 'lucide-react';

export default function NewsletterPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Show popup after 10 seconds if not already closed
        const hasClosed = localStorage.getItem('newsletter_closed');
        if (!hasClosed) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('newsletter_closed', 'true');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message);
                setTimeout(() => {
                    handleClose();
                }, 3000);
            } else {
                setStatus('error');
                setMessage(data.error || 'Bir hata oluştu.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500 max-w-sm w-[calc(100%-2rem)]">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative">
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>
                <div className="p-6">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                        <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Bültene Katılın</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                        En güncel umre turları ve özel kampanyalardan ilk siz haberdar olun.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="E-posta adresiniz..."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={status === 'loading' || status === 'success'}
                                required
                                className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white"
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading' || status === 'success'}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {status === 'loading' ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        {message && (
                            <p className={`text-sm ${status === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {message}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
