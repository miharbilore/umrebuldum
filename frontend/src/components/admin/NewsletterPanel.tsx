'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Loader2, Trash2, Power, PowerOff, Search } from 'lucide-react';
import { Prisma } from '@prisma/client';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function NewsletterPanel() {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: subscribers, error, isLoading, mutate } = useSWR('/api/admin/newsletter', fetcher);

    if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-lg">Veriler yüklenirken bir hata oluştu.</div>;

    const filtered = (subscribers || []).filter((s: Prisma.NewsletterSubscriberGetPayload<{}>) =>
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await fetch('/api/admin/newsletter', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isActive: !currentStatus }),
            });
            mutate();
        } catch (e: unknown) {
            console.error("Status update error", e);
        }
    };

    const deleteSubscriber = async (id: string) => {
        if (!confirm('Bu aboneyi silmek istediğinize emin misiniz?')) return;
        try {
            await fetch(`/api/admin/newsletter?id=${id}`, { method: 'DELETE' });
            mutate();
        } catch (e: unknown) {
            console.error("Delete error", e);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="E-posta ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
                    <p className="text-gray-400">Abone bulunamadı.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-800 bg-gray-900">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3 font-medium">E-posta</th>
                                <th className="px-4 py-3 font-medium">Kayıt Tarihi</th>
                                <th className="px-4 py-3 font-medium">Durum</th>
                                <th className="px-4 py-3 font-medium text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filtered.map((sub: Prisma.NewsletterSubscriberGetPayload<{}>) => (
                                <tr key={sub.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-200">
                                        {sub.email}
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">
                                        {new Date(sub.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${sub.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                                            }`}>
                                            {sub.isActive ? 'AKTİF' : 'PASİF'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => toggleStatus(sub.id, sub.isActive)}
                                            className={`p-2 rounded-md transition-colors ${sub.isActive ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                                }`}
                                            title={sub.isActive ? "Pasife Al" : "Aktifleştir"}
                                        >
                                            {sub.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => deleteSubscriber(sub.id)}
                                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md transition-colors"
                                            title="Sil"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
