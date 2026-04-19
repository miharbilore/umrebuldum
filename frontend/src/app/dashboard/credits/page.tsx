'use client';

import useSWR from 'swr';
import { ArrowUpRight, ArrowDownRight, Wallet, Loader2, History, Zap, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { cn } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const typeLabels: Record<string, { label: string; color: string; bg: string }> = {
    topup: { label: 'Yükleme', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    spend: { label: 'Harcama', color: 'text-red-700', bg: 'bg-red-50' },
    grant: { label: 'Hediye', color: 'text-blue-700', bg: 'bg-blue-50' },
    refund: { label: 'İade', color: 'text-amber-700', bg: 'bg-amber-50' },
    deduct: { label: 'Kesinti', color: 'text-red-700', bg: 'bg-red-50' },
    admin_grant: { label: 'Admin Tanımlama', color: 'text-purple-700', bg: 'bg-purple-50' },
    admin_deduct: { label: 'Admin Kesinti', color: 'text-red-700', bg: 'bg-red-50' },
};

export default function CreditHistoryPage() {
    const { data, error, isLoading } = useSWR('/api/guide/credits', fetcher);

    const balance = data?.balance ?? 0;
    const transactions = data?.transactions || [];

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-slate-50/50 pb-20">
                <div className="container mx-auto py-10 px-4 max-w-5xl space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest mb-4">
                                <History className="w-3 h-3" width={12} height={12} />
                                Finansal Döküm
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none">
                                Token <span className="text-[#FFB800]">İşlem Geçmişi</span>
                            </h1>
                            <p className="text-slate-500 mt-4 font-bold max-w-xl">
                                Tüm token hareketlerinizi, harcamalarınızı ve iadelerinizi şeffaf bir şekilde takip edin.
                            </p>
                        </div>
                    </div>

                    {/* Balance Card */}
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm relative overflow-hidden group transition-all hover:shadow-lg">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -z-10 group-hover:bg-[#FFB800]/5 transition-colors" />
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="bg-[#FFB800]/10 p-5 rounded-2xl shadow-inner group-hover:bg-[#FFB800]/20 transition-colors">
                                    <Zap className="w-8 h-8 text-[#FFB800] fill-[#FFB800]" width={32} height={32} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Mevcut Bakiye</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-slate-900 tracking-tight">{balance}</span>
                                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">TOKEN</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <Link href="/dashboard/billing" className="inline-flex items-center justify-center min-h-[56px] px-8 rounded-2xl bg-[#FFB800] hover:bg-[#E6A600] text-black font-black uppercase text-xs tracking-widest shadow-lg shadow-[#FFB800]/20 transition-all active:scale-95">
                                    <Zap className="w-4 h-4 mr-2 fill-black" width={16} height={16} />
                                    Hemen Yükle
                                </Link>
                                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                                    <ShieldCheck className="w-4 h-4 text-[#059669]" />
                                    <span className="text-[10px] font-black text-[#059669] uppercase tracking-wider">Güvenli Cüzdan</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[400px]">
                        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Son İşlemler</h2>
                            {!isLoading && transactions.length > 0 && (
                                <span className="text-[10px] font-black text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 uppercase">
                                    {transactions.length} İşlem Kayıtlı
                                </span>
                            )}
                        </div>

                        {/* Loading */}
                        {isLoading && (
                            <div className="p-8 space-y-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="p-20 text-center">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                                    <X className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900">Bir Hata Oluştu</h3>
                                <p className="text-sm font-bold text-slate-400 mt-2">Veriler yüklenemedi. Lütfen sayfayı yenileyin.</p>
                            </div>
                        )}

                        {/* Empty */}
                        {!isLoading && !error && transactions.length === 0 && (
                            <div className="p-20 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                    <History className="w-10 h-10 text-slate-200" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">Henüz bir işlem yok</h3>
                                <p className="text-sm font-bold text-slate-400 mt-2 max-w-xs mx-auto text-balance underline decoration-slate-200 underline-offset-4">
                                    Token harcadıkça veya yeni paket aldıkça işlem geçmişiniz burada görünecek.
                                </p>
                            </div>
                        )}

                        {/* Transaction List */}
                        {!isLoading && !error && transactions.length > 0 && (
                            <div className="divide-y divide-slate-50">
                                {transactions.map((tx: any) => {
                                    const typeInfo = typeLabels[tx.type] || { label: tx.type, color: 'text-slate-700', bg: 'bg-slate-50' };
                                    const isPositive = tx.amount > 0;
                                    return (
                                        <div key={tx.id} className="px-8 py-6 flex items-center gap-6 hover:bg-slate-50/50 transition-all group">
                                            {/* Icon */}
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                                                isPositive ? "bg-emerald-50 text-[#059669] border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                                            )}>
                                                {isPositive
                                                    ? <ArrowUpRight className="w-6 h-6" width={24} height={24} />
                                                    : <ArrowDownRight className="w-6 h-6" width={24} height={24} />
                                                }
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1.5">
                                                    <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider", typeInfo.bg, typeInfo.color)}>
                                                        {typeInfo.label}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true, locale: tr })}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-700 truncate underline decoration-slate-100 underline-offset-4 decoration-2">{tx.reason}</p>
                                            </div>

                                            {/* Amount */}
                                            <div className={cn(
                                                "text-2xl font-black whitespace-nowrap flex items-baseline gap-1",
                                                isPositive ? 'text-[#059669]' : 'text-red-600'
                                            )}>
                                                <span>{isPositive ? '+' : ''}{tx.amount}</span>
                                                <span className="text-[10px] uppercase font-black tracking-widest opacity-50">Token</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
