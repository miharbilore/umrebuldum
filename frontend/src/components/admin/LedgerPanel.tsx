'use client';

import useSWR from 'swr';
import { RefreshCw, FileText, IndianRupee, CreditCard, ShieldAlert } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function LedgerPanel() {
    const { data, error, isLoading, mutate } = useSWR('/api/admin/ledger?limit=50', fetcher);

    if (isLoading) {
        return <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-800 rounded-xl" />
            <div className="h-48 bg-gray-800 rounded-xl" />
        </div>;
    }

    if (error) {
        return <div className="text-red-400 p-4 bg-red-500/10 rounded-xl">Ledger verisi çekilemedi.</div>;
    }

    const transactions = data?.data || [];

    const getAccountLabel = (id: string, userObj?: any) => {
        if (id === "SYSTEM_TREASURY") return "Hazine (System Treasury)";
        if (id === "SYSTEM_BURN") return "Yakılan Kasa (System Burn)";
        if (userObj) return `${userObj.name || 'Kullanıcı'} (${userObj.email || id})`;
        return id;
    };

    const formatAmount = (amount: number) => {
        const isPositive = amount > 0;
        return (
            <span className={`font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{amount}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FileText className="text-emerald-500" />
                        Finansal Defter (Double-Entry Ledger)
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Platformdaki tüm token/kredi işlemlerinin finansal akış dökümü.</p>
                </div>
                <button
                    onClick={() => mutate()}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition"
                >
                    <RefreshCw className="w-4 h-4" /> Yenile
                </button>
            </div>

            {data?.metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-900 border border-emerald-900/50 rounded-xl p-4 flex items-center gap-4">
                        <div className="bg-emerald-500/20 p-3 rounded-lg text-emerald-400">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Piyasadaki Toplam Token</p>
                            <p className="text-2xl font-bold text-gray-100">{data.metrics.totalTokensInCirculation} <span className="text-sm font-normal text-gray-500">adet</span></p>
                        </div>
                    </div>
                    <div className="bg-gray-900 border border-amber-900/50 rounded-xl p-4 flex items-center gap-4">
                        <div className="bg-amber-500/20 p-3 rounded-lg text-amber-400">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Sistemde Harcanan (Yakılan)</p>
                            <p className="text-2xl font-bold text-gray-100">{data.metrics.totalTokensBurned} <span className="text-sm font-normal text-gray-500">adet</span></p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-gray-800 text-gray-400 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-5 py-4 font-medium">İşlem ID / Türü</th>
                                <th className="px-5 py-4 font-medium">Kimden (Hesap)</th>
                                <th className="px-5 py-4 font-medium">Kime (Karşı Tarafa)</th>
                                <th className="px-5 py-4 font-medium text-right">Miktar</th>
                                <th className="px-5 py-4 font-medium">Nedeni</th>
                                <th className="px-5 py-4 font-medium text-right">Tarih</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {transactions.map((tx: any) => (
                                <tr key={tx.id} className="hover:bg-gray-800/50 transition">
                                    <td className="px-5 py-3 text-gray-300">
                                        <div className="font-mono text-xs text-gray-500 mb-1" title={tx.id}>
                                            ...{tx.id.substring(tx.id.length - 8)}
                                        </div>
                                        <div className="inline-flex bg-gray-800 px-2 py-0.5 rounded text-xs font-semibold text-gray-300">
                                            {tx.action}
                                        </div>
                                    </td>
                                    
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2 text-gray-300 max-w-[200px] truncate">
                                            {tx.accountId === 'SYSTEM_TREASURY' ? <ShieldAlert className="w-4 h-4 text-emerald-500" /> : <CreditCard className="w-4 h-4 text-gray-500" />}
                                            <span className="truncate" title={getAccountLabel(tx.accountId, tx.user)}>
                                                {getAccountLabel(tx.accountId, tx.user)}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2 text-gray-300 max-w-[200px] truncate">
                                            {tx.counterpartyId === 'SYSTEM_TREASURY' || tx.counterpartyId === 'SYSTEM_BURN' ? <ShieldAlert className="w-4 h-4 text-amber-500" /> : <CreditCard className="w-4 h-4 text-gray-500" />}
                                            <span className="truncate">
                                                {tx.counterpartyId ? getAccountLabel(tx.counterpartyId) : '-'}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-5 py-3 text-right text-lg">
                                        {formatAmount(tx.amount)}
                                    </td>

                                    <td className="px-5 py-3 text-gray-400 max-w-xs truncate" title={tx.reason || ''}>
                                        {tx.reason || '-'}
                                    </td>

                                    <td className="px-5 py-3 text-right text-gray-500 text-xs">
                                        {new Date(tx.createdAt).toLocaleString('tr-TR')}
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                                        Kayıtlı finansal işlem bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
