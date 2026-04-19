
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, CreditCard, Tag, Loader2, X, Zap, Crown, Building2, Shield, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { PaymentCheckout } from "@/components/dashboard/PaymentCheckout";
import { cn } from "@/lib/utils";

interface CreditPackage {
    id: string;
    slug: string;
    name: string;
    credits: number;
    priceTRY: number;
    monthlyPrice: number;
    billingPeriod: number;
    roleTarget: string;
    sortOrder: number;
    features: any;
}

interface CouponState {
    code: string;
    valid: boolean | null;
    discountPercent: number;
    message: string;
    checking: boolean;
}

type BillingTab = 1 | 3 | 12;

const PERIOD_LABELS: Record<number, string> = { 1: "Aylık", 3: "3 Aylık", 12: "Yıllık" };
const PERIOD_SAVINGS: Record<number, string> = { 1: "", 3: "%7 Avantaj", 12: "%14 Avantaj" };

const TIER_STYLES: Record<string, { border: string; bg: string; badge: string; popular?: boolean; iconColor: string }> = {
    FREEMIUM:      { border: "border-slate-200", bg: "bg-white", badge: "bg-slate-100 text-slate-600", iconColor: "text-slate-400" },
    PREMIUM:       { border: "border-blue-200", bg: "bg-white", badge: "bg-blue-50 text-blue-700", iconColor: "text-blue-500" },
    PLUS:          { border: "border-[#FFB800]/30", bg: "bg-white", badge: "bg-amber-50 text-amber-800", popular: true, iconColor: "text-[#FFB800]" },
    PRO:           { border: "border-violet-300", bg: "bg-white", badge: "bg-violet-50 text-violet-800", iconColor: "text-violet-500" },
    BUSINESS:      { border: "border-emerald-300", bg: "bg-white", badge: "bg-emerald-50 text-[#059669]", popular: true, iconColor: "text-[#059669]" },
    BUSINESS_PLUS: { border: "border-purple-300", bg: "bg-white", badge: "bg-purple-50 text-purple-800", iconColor: "text-purple-600" },
};

function getTierStyle(slug: string) {
    return TIER_STYLES[slug] || TIER_STYLES.FREEMIUM;
}

function buildFeatureList(featsObj: any): string[] {
    if (!featsObj || typeof featsObj !== "object") return [];
    if (Array.isArray(featsObj)) return featsObj;

    const list: string[] = [];
    if (featsObj.maxListings) list.push(`${featsObj.maxListings} Aktif İlan Hakkı`);
    if (featsObj.listingDays) list.push(`${featsObj.listingDays} Gün Yayın Süresi`);
    if (featsObj.maxBoosts) list.push(`${featsObj.maxBoosts} Öne Çıkarma Hakkı`);
    if (featsObj.phoneVisible) list.push("Telefon Numarası Gösterimi");
    if (featsObj.spotlightEligible) list.push("Vitrin İlanı Erişimi");
    if (featsObj.priorityRanking) list.push("Öncelikli Sıralama");
    if (featsObj.canCreatePoster) list.push("Afiş Motoru Kullanımı");
    return list;
}

export function CreditPackages() {
    const { data: session } = useSession();
    const role = session?.user?.role;

    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [loading, setLoading] = useState<string | null>(null);
    const [billingTab, setBillingTab] = useState<BillingTab>(12); // Default to Annual for better conversion
    const [checkoutPkg, setCheckoutPkg] = useState<CreditPackage | null>(null);

    const [coupon, setCoupon] = useState<CouponState>({
        code: "",
        valid: null,
        discountPercent: 0,
        message: "",
        checking: false,
    });

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/admin/packages");
                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        setPackages(data.map((pkg: any) => ({
                            ...pkg,
                            features: pkg.features || {},
                        })));
                    }
                }
            } catch {
                console.error("Paketler yüklenirken hata oluştu.");
            }
        })();
    }, []);

    const isOrg = role === "ORGANIZATION";
    const displayPackages = packages.filter(pkg => {
        const forOrg = pkg.roleTarget === "ORGANIZATION";
        if (pkg.slug === "FREEMIUM") {
            return pkg.billingPeriod === 1 && (isOrg ? forOrg : !forOrg);
        }
        return (isOrg ? forOrg : !forOrg) && pkg.billingPeriod === billingTab;
    });

    const validateCoupon = async () => {
        if (!coupon.code.trim()) return;
        setCoupon((prev) => ({ ...prev, checking: true }));
        try {
            const res = await fetch("/api/billing/coupon/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: coupon.code.trim().toUpperCase() }),
            });
            const data = await res.json();
            setCoupon((prev) => ({
                ...prev,
                valid: data.valid,
                discountPercent: data.discountPercent || 0,
                message: data.message || "",
                checking: false,
            }));
            if (data.valid) toast.success(data.message);
            else toast.error(data.message || "Geçersiz kupon.");
        } catch {
            setCoupon((prev) => ({ ...prev, checking: false }));
            toast.error("Kupon doğrulama hatası.");
        }
    };

    const clearCoupon = () => {
        setCoupon({ code: "", valid: null, discountPercent: 0, message: "", checking: false });
    };

    const getDiscountedPrice = (originalPrice: number) => {
        if (coupon.valid && coupon.discountPercent > 0) {
            return originalPrice * (1 - coupon.discountPercent / 100);
        }
        return originalPrice;
    };

    const handleBuy = (pkg: CreditPackage) => {
        setCheckoutPkg(pkg);
    };

    const hasPaidPackages = packages.some(p => p.priceTRY > 0 && (isOrg ? p.roleTarget === "ORGANIZATION" : p.roleTarget === "GUIDE"));

    return (
        <div className="space-y-10">
            {/* Billing Period Tabs */}
            {hasPaidPackages && (
                <div className="flex items-center justify-center">
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                        {([1, 3, 12] as BillingTab[]).map((period) => (
                            <button
                                key={period}
                                onClick={() => setBillingTab(period)}
                                className={cn(
                                    "relative px-6 py-2.5 rounded-xl text-sm font-black transition-all min-h-[44px]",
                                    billingTab === period
                                        ? "bg-white shadow-md text-slate-900"
                                        : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                {PERIOD_LABELS[period]}
                                {PERIOD_SAVINGS[period] && (
                                    <span className={cn(
                                        "ml-2 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight",
                                        billingTab === period ? "bg-emerald-100 text-[#059669]" : "bg-white text-slate-400"
                                    )}>
                                        {PERIOD_SAVINGS[period]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Package Grid */}
            <div className={`grid gap-6 ${displayPackages.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4"}`}>
                {displayPackages.map((pkg) => {
                    const discountedPrice = getDiscountedPrice(pkg.priceTRY);
                    const hasDiscount = coupon.valid && coupon.discountPercent > 0;
                    const featuresList = buildFeatureList(pkg.features);
                    const style = getTierStyle(pkg.slug);
                    const isFree = pkg.priceTRY === 0;
                    const perMonth = billingTab > 1 && !isFree ? Math.round(pkg.priceTRY / billingTab) : null;

                    return (
                        <div
                            key={pkg.id}
                            className={cn(
                                "relative flex flex-col justify-between rounded-[2rem] border-2 p-8 transition-all hover:shadow-2xl hover:-translate-y-1 bg-white",
                                style.border,
                                style.popular && !isFree ? "ring-2 ring-[#FFB800]/20 shadow-xl" : "shadow-sm"
                            )}
                        >
                            {/* Popular badge */}
                            {style.popular && !isFree && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#FFB800] px-6 py-1.5 text-[10px] font-black text-black shadow-lg flex items-center gap-1.5 uppercase tracking-widest border-2 border-white">
                                    <Star className="h-3 w-3 fill-black" width={12} height={12} /> En Popüler
                                </div>
                            )}

                            {/* Discount badge */}
                            {hasDiscount && !isFree && (
                                <div className="absolute -top-3.5 right-6 rounded-full bg-[#059669] px-4 py-1.5 text-[10px] font-black text-white shadow-lg border-2 border-white">
                                    %{coupon.discountPercent} İNDİRİM
                                </div>
                            )}

                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full", style.badge)}>
                                        {pkg.slug.replace("_", " ")}
                                    </span>
                                    <div className={cn("p-2 rounded-xl bg-slate-50", style.iconColor)}>
                                        <Zap className="w-5 h-5" width={20} height={20} />
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 mb-4 leading-tight">
                                    {pkg.name.replace(/ — .*$/, "")}
                                </h3>

                                {/* Price */}
                                <div className="mb-6">
                                    {isFree ? (
                                        <div className="text-3xl font-black text-slate-900 tracking-tight">Ücretsiz</div>
                                    ) : (
                                        <div className="space-y-1">
                                            <div className="flex items-baseline gap-1.5">
                                                {hasDiscount ? (
                                                    <>
                                                        <span className="text-sm text-slate-300 line-through font-bold">
                                                            ₺{pkg.priceTRY.toLocaleString('tr-TR')}
                                                        </span>
                                                        <span className="text-4xl font-black text-[#059669]">
                                                            ₺{Math.round(discountedPrice).toLocaleString('tr-TR')}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-4xl font-black text-slate-900 tracking-tight">
                                                        ₺{pkg.priceTRY.toLocaleString('tr-TR')}
                                                    </span>
                                                )}
                                                <span className="text-xs font-bold text-slate-400 ml-1">/{PERIOD_LABELS[billingTab]}</span>
                                            </div>
                                            {perMonth && (
                                                <p className="text-[10px] font-black text-[#059669] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded w-fit">
                                                    AYLIK ~{perMonth.toLocaleString('tr-TR')}₺ AVANTAJ
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Tokens */}
                                <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-lg shadow-sm">
                                        <Zap className="h-5 w-5 text-[#FFB800] fill-[#FFB800]" width={20} height={20} />
                                    </div>
                                    <div>
                                        <div className="text-lg font-black text-slate-900 leading-none">{pkg.credits} Token</div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Hediye Bakiyesi</p>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="space-y-3 mb-10 pt-4 border-t border-slate-50">
                                    {featuresList.length > 0 ? (
                                        featuresList.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-3 group">
                                                <Check className="h-4 w-4 text-[#059669] mt-0.5 shrink-0" width={16} height={16} />
                                                <span className="text-xs font-bold text-slate-600 transition-colors group-hover:text-slate-900">{feature}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">Temel Özellikler</p>
                                    )}
                                </div>
                            </div>

                            {/* Buy button */}
                            {isFree ? (
                                <div className="w-full mt-4 text-center py-4 text-xs font-black text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-100 uppercase tracking-widest">
                                    Aktif Paketin
                                </div>
                            ) : (
                                <Button
                                    onClick={() => handleBuy(pkg)}
                                    disabled={loading !== null}
                                    className={cn(
                                        "w-full min-h-[56px] text-sm font-black rounded-2xl transition-all shadow-lg active:scale-95",
                                        style.popular
                                            ? "bg-[#FFB800] hover:bg-[#E6A600] text-black shadow-[#FFB800]/20"
                                            : "bg-slate-900 hover:bg-black text-white"
                                    )}
                                >
                                    {loading === pkg.id ? (
                                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> İşleniyor...</>
                                    ) : (
                                        <>
                                            <CreditCard className="mr-2 h-4 w-4" width={16} height={16} />
                                            {hasDiscount
                                                ? `${Math.round(discountedPrice).toLocaleString('tr-TR')}₺ ile Başlat`
                                                : "Hemen Başlat"}
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Coupon Input Section */}
            <div className="rounded-[2rem] border bg-white p-8 shadow-sm border-slate-100 max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-50 rounded-xl">
                        <Tag className="h-5 w-5 text-amber-600" width={20} height={20} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-slate-900 leading-none">İndirim Kuponu</h4>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Ekstra Avantaj Yakalayın</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Input
                        placeholder="KODU BURAYA YAZIN..."
                        value={coupon.code}
                        onChange={(e) =>
                            setCoupon((prev) => ({
                                ...prev,
                                code: e.target.value.toUpperCase(),
                                valid: null,
                                message: "",
                            }))
                        }
                        className="h-14 rounded-2xl uppercase tracking-widest bg-slate-50 border-slate-100 font-bold focus:ring-[#FFB800]/20"
                        disabled={coupon.valid === true}
                    />
                    {coupon.valid === true ? (
                        <Button variant="outline" className="h-14 w-14 rounded-2xl" onClick={clearCoupon}>
                            <X className="h-5 w-5" width={20} height={20} />
                        </Button>
                    ) : (
                        <Button
                            onClick={validateCoupon}
                            disabled={!coupon.code.trim() || coupon.checking}
                            className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase text-xs tracking-widest"
                        >
                            {coupon.checking ? <Loader2 className="h-5 w-5 animate-spin" /> : "Uygula"}
                        </Button>
                    )}
                </div>
                {coupon.message && (
                    <p className={cn(
                        "text-[10px] font-black mt-3 px-3 py-1.5 rounded-lg w-fit uppercase tracking-wider",
                        coupon.valid ? "bg-emerald-50 text-[#059669] border border-emerald-100" : "bg-red-50 text-red-500 border border-red-100"
                    )}>
                        {coupon.message}
                    </p>
                )}
            </div>

            {/* Payment Checkout Modal */}
            {checkoutPkg && (
                <PaymentCheckout
                    packageId={checkoutPkg.id}
                    packageName={checkoutPkg.name}
                    amountTRY={checkoutPkg.priceTRY}
                    credits={checkoutPkg.credits}
                    discountedAmount={coupon.valid ? getDiscountedPrice(checkoutPkg.priceTRY) : undefined}
                    couponCode={coupon.valid ? coupon.code.trim().toUpperCase() : undefined}
                    onClose={() => setCheckoutPkg(null)}
                    onSuccess={() => window.location.reload()}
                />
            )}
        </div>
    );
}
