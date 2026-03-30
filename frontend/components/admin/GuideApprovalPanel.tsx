'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Loader2, CheckCircle, XCircle, User, MapPin } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function GuideApprovalPanel() {
    const { data, error, isLoading, mutate } = useSWR('/api/admin/guides', fetcher);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleAction = async (userId: string, action: 'APPROVE' | 'REJECT') => {
        setProcessingId(userId);
        try {
            const res = await fetch('/api/admin/guides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "İşlem başarısız.");
            }

            mutate();
        } catch (err) {
            alert(String(err));
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-800 rounded-xl" />
            <div className="h-16 bg-gray-800 rounded-xl" />
        </div>;
    }

    if (error) {
        return <div className="text-red-400 p-4 bg-red-500/10 rounded-xl">Hata oluştu.</div>;
    }

    const pendingGuides = data?.data || [];

    if (pendingGuides.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white">Bekleyen Rehber Yok</h3>
                <p className="text-gray-400">Tüm kimlik doğrulamaları tamamlanmış.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User className="text-emerald-500" />
                Kimlik Doğrulama Bekleyen Rehberler
            </h2>

            <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-lg">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-800 text-gray-400">
                        <tr>
                            <th className="px-4 py-3 font-medium">Kullanıcı (Email)</th>
                            <th className="px-4 py-3 font-medium">Rehber Adı</th>
                            <th className="px-4 py-3 font-medium">Şehir</th>
                            <th className="px-4 py-3 font-medium">Bio Uzunluğu</th>
                            <th className="px-4 py-3 font-medium text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {pendingGuides.map((guide: any) => (
                            <tr key={guide.id} className="hover:bg-gray-800 transition">
                                <td className="px-4 py-3 text-gray-300">
                                    <div className="font-medium text-white">{guide.name || "İsimsiz"}</div>
                                    <div className="text-xs text-gray-500">{guide.email}</div>
                                </td>
                                <td className="px-4 py-3 text-gray-300">{guide.guideProfile?.fullName}</td>
                                <td className="px-4 py-3 text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-gray-500" />
                                        {guide.guideProfile?.city || '-'}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-400">
                                    {guide.guideProfile?.bio?.length || 0} karakter
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2 text-sm">
                                        <button
                                            disabled={processingId === guide.id}
                                            onClick={() => handleAction(guide.id, 'REJECT')}
                                            className="px-3 py-1.5 text-gray-400 hover:text-red-400 bg-gray-800 hover:bg-gray-700 rounded-md transition disabled:opacity-50 flex items-center gap-1"
                                        >
                                            <XCircle className="w-4 h-4" /> Reddet
                                        </button>
                                        <button
                                            disabled={processingId === guide.id}
                                            onClick={() => handleAction(guide.id, 'APPROVE')}
                                            className="px-3 py-1.5 text-emerald-950 font-medium bg-emerald-500 hover:bg-emerald-400 rounded-md transition disabled:opacity-50 flex items-center gap-1"
                                        >
                                            {processingId === guide.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                            Onayla
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
