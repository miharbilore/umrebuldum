"use client";

import { Button } from "@/components/ui/button";
import { Wallet, Shield, Star, Loader2, GraduationCap, Zap, ArrowRight } from "lucide-react";
import useSWR from "swr";
import Link from "next/link";
import { useState } from "react";
import { UmrahQuizModal } from "../dashboard/UmrahQuizModal";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const CREDIT_BALANCE_KEY = "/api/guide/credits";

export function ProviderCreditBalance() {
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const { data: session, status } = useSession();
    const { data: balanceData, isLoading: balLoading } = useSWR(CREDIT_BALANCE_KEY, fetcher);
    const { data: profileData, isLoading: profLoading } = useSWR('/api/guide/profile', fetcher);

    const isLoading = status === "loading" || balLoading || profLoading;
    const credits = balanceData?.balance ?? profileData?.tokenBalance ?? session?.user?.tokenBalance ?? 0;
    const trustScore = profileData?.trustScore ?? 0;
    const pkg = session?.user?.packageType ?? "FREEMIUM";
    const completedTrips = profileData?.completedTrips ?? 0;

    if (isLoading) {
        return (
            <div className="mb-8">
                <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 animate-pulse">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-1 flex gap-8">
                            <div className="h-16 w-32 bg-slate-200 rounded-2xl" />
                            <div className="h-16 w-32 bg-slate-200 rounded-2xl" />
                            <div className="h-16 w-32 bg-slate-200 rounded-2xl" />
                        </div>
                        <div className="h-14 w-40 bg-slate-200 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    const trustColor = trustScore >= 70
        ? 'text-[#059669] bg-emerald-50 border-emerald-100'
        : trustScore >= 40
            ? 'text-amber-700 bg-amber-50 border-amber-100'
            : 'text-red-700 bg-red-50 border-red-100';

    const pkgColors: Record<string, string> = {
        FREEMIUM: 'bg-slate-100 text-slate-600 border-slate-200 shadow-sm',
        PREMIUM: 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm',
        PRO: 'bg-violet-50 text-violet-700 border-violet-200 shadow-sm',
        BUSINESS: 'bg-emerald-50 text-[#059669] border-emerald-200 shadow-sm',
    };

    return (
        <div className="mb-8 group">
            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-8 shadow-sm transition-all hover:shadow-xl hover:border-[#FFB800]/20 relative overflow-hidden">
                {/* Subtle Background Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -z-10 group-hover:bg-[#FFB800]/5 transition-colors" />
                
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-8 relative z-10">
                    {/* Stats Section */}
                    <div className="flex-1 flex flex-wrap items-center gap-8 md:gap-12">
                        {/* Token Balance */}
                        <div className="flex items-center gap-4">
                            <div className="bg-[#FFB800]/10 p-4 rounded-2xl shadow-inner group-hover:bg-[#FFB800]/20 transition-colors">
                                <Zap className="w-7 h-7 text-[#FFB800] fill-[#FFB800]" width={28} height={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Mevcut Bakiye</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-4xl font-black text-slate-900 tracking-tight">{credits}</span>
                                    <span className="text-sm font-black text-slate-400 uppercase underline decoration-[#FFB800] decoration-2 underline-offset-4">TOKEN</span>
                                </div>
                            </div>
                        </div>

                        {/* Trust Score */}
                        <div className="flex items-center gap-4">
                            <div className={cn("p-4 rounded-2xl border shadow-sm transition-all", trustColor)}>
                                <Shield className="w-7 h-7" width={28} height={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Hesap Puanı</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-4xl font-black text-slate-900 tracking-tight">{trustScore}</span>
                                    <span className="text-[10px] font-black text-[#059669] bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">GÜVENLİ</span>
                                </div>
                            </div>
                        </div>

                        {/* Package Info */}
                        <div className="flex flex-col gap-2">
                             <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest", pkgColors[pkg] || pkgColors.FREEMIUM)}>
                                <Star className="w-3.5 h-3.5 fill-current" width={14} height={14} />
                                {pkg} Üye
                            </div>
                            {completedTrips > 0 && (
                                <p className="text-[10px] font-bold text-slate-400 italic">
                                    {completedTrips} Başarılı Tur Tamamlandı
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions Section */}
                    <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
                        {pkg === 'FREEMIUM' ? (
                            <>
                                <Button 
                                    onClick={() => setIsQuizOpen(true)}
                                    className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase text-xs tracking-widest shadow-lg flex-1"
                                >
                                    <GraduationCap className="w-5 h-5 mr-2" width={20} height={20} />
                                    Sınavla Token Kazan
                                </Button>
                                <Button asChild className="h-14 px-8 rounded-2xl bg-[#FFB800] hover:bg-[#E6A600] text-black font-black uppercase text-xs tracking-widest shadow-lg shadow-[#FFB800]/20 flex-1">
                                    <Link href="/pricing" className="flex items-center">
                                        <Zap className="w-5 h-5 mr-2 fill-black" width={20} height={20} />
                                        Paket Al
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button asChild className="h-14 px-8 rounded-2xl bg-[#FFB800] hover:bg-[#E6A600] text-black font-black uppercase text-xs tracking-widest shadow-lg shadow-[#FFB800]/20 flex-1 lg:flex-none">
                                    <Link href="/pricing" className="flex items-center">
                                        <Zap className="w-5 h-5 mr-2 fill-black" width={20} height={20} />
                                        Token Yükle
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-600 font-bold flex-1 lg:flex-none">
                                    <Link href="/dashboard/credits" className="flex items-center">
                                        Geçmiş
                                        <ArrowRight className="w-4 h-4 ml-2" width={16} height={16} />
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            <UmrahQuizModal 
                isOpen={isQuizOpen} 
                onClose={() => setIsQuizOpen(false)} 
            />
        </div>
    );
}
