"use client";

import { ProviderCreditBalance as CreditBalance } from "@/components/dashboard/ProviderCreditBalance";
import { CreditPackages } from "@/components/dashboard/credit-packages";

import { SavedCards } from "@/components/dashboard/SavedCards";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ShieldCheck, CreditCard, Zap, Settings2 } from "lucide-react";

function BillingContent() {
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("success")) {
            toast.success("Ödeme başarılı! Tokenlar bakiyenize tanımlandı.");
        }
        if (searchParams.get("canceled")) {
            toast.error("Ödeme iptal edildi.");
        }
    }, [searchParams]);

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-slate-50/50 pb-20">
                <div className="container mx-auto py-10 px-4 max-w-6xl">
                    {/* Header Section */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest mb-4">
                                <ShieldCheck className="w-3 h-3" width={12} height={12} />
                                Güvenli Ödeme Merkezi
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none">
                                Ödemeler ve <span className="text-[#FFB800]">Tokenlar</span>
                            </h1>
                            <p className="text-slate-500 mt-4 font-bold max-w-xl">
                                Üyelik paketlerinizi yönetin, token bakiyenizi takip edin ve ödeme yöntemlerinizi güvenle saklayın.
                            </p>
                        </div>
                    </div>

                    {/* Main Stats (Token Balance) */}
                    <CreditBalance />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Packages */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-blue-50 rounded-xl">
                                        <Zap className="h-5 w-5 text-blue-600 fill-blue-600" width={20} height={20} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 leading-none">Token Paketleri</h2>
                                </div>
                                <CreditPackages />
                            </div>
                        </div>

                        {/* Right Column: Cards & Settings */}
                        <div className="space-y-8">
                            {/* Saved Cards */}
                            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-slate-50 rounded-xl">
                                        <CreditCard className="h-5 w-5 text-slate-600" width={20} height={20} />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 leading-none">Kayıtlı Kartlar</h2>
                                </div>
                                <SavedCards />
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function BillingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-[#FFB800] rounded-full animate-spin" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Yükleniyor...</p>
                </div>
            </div>
        }>
            <BillingContent />
        </Suspense>
    );
}
