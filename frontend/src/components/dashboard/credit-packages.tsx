
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, CreditCard, Tag, Loader2, X, Zap, Crown, Building2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { PaymentCheckout } from "@/components/dashboard/PaymentCheckout";

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
const PERIOD_SAVINGS: Record<number, string> = { 1: "", 3: "%7 Tasarruf", 12: "%14 Tasarruf" };

const TIER_STYLES: Record<string, { border: string; bg: string; badge: string; popular?: boolean }> = {
    FREEMIUM:      { border: "border-slate-200", bg: "bg-white", badge: "bg-slate-100 text-slate-600" },
    PREMIUM:       { border: "border-blue-200", bg: "bg-gradient-to-b from-blue-50/50 to-white", badge: "bg-blue-100 text-blue-700" },
    PLUS:          { border: "border-amber-300", bg: "bg-gradient-to-b from-amber-50/50 to-white", badge: "bg-amber-100 text-amber-800", popular: true },
    PRO:           { border: "border-violet-300", bg: "bg-gradient-to-b from-violet-50/50 to-white", badge: "bg-violet-100 text-violet-800" },
    BUSINESS:      { border: "border-emerald-300", bg: "bg-gradient-to-b from-emerald-50/50 to-white", badge: "bg-emerald-100 text-emerald-700", popular: true },
    BUSINESS_PLUS: { border: "border-purple-300", bg: "bg-gradient-to-b from-purple-50/50 to-white", badge: "bg-purple-100 text-purple-800" },
};

function getTierStyle(slug: string) {
    return TIER_STYLES[slug] || TIER_STYLES.FREEMIUM;
}

function buildFeatureList(featsObj: any): string[] {
    if (!featsObj || typeof featsObj !== "object") return [];
    if (Array.isArray(featsObj)) return featsObj;

    const list: string[] = [];
    if (featsObj.maxListings) list.push(`Maksimum ${featsObj.maxListings} İlan Hakkı`);
    if (featsObj.listingDays) list.push(`${featsObj.listingDays} Gün İlan Süresi`);
    if (featsObj.maxBoosts) list.push(`Aylık ${featsObj.maxBoosts} Öne Çıkarma`);
    if (featsObj.phoneVisible) list.push("Telefon Numarası Görünürlüğü");
    if (featsObj.spotlightEligible) list.push("Vitrin İlanı (Spotlight)");
    if (featsObj.priorityRanking) list.push("Öncelikli Sıralama");
    if (featsObj.trustBoost) list.push("Güven Puanı Desteği");
    if (featsObj.identityVerificationEligible) list.push("Kimlik Doğrulama İzni");
    if (featsObj.canCreatePoster) list.push("Afiş/Poster Oluşturma");
    if (featsObj.posterQuality && featsObj.posterQuality !== "LOW") list.push(`${featsObj.posterQuality} Kalite Medya`);
    if (featsObj.canCreatePoster && featsObj.watermark === false) list.push("Filigransız Tasarım");
    return list;
}

export function CreditPackages() {
    const { data: session } = useSession();
    const role = session?.user?.role;

    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [loading, setLoading] = useState<string | null>(null);
    const [billingTab, setBillingTab] = useState<BillingTab>(1);
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

    // Filter by role and billing period
    const isOrg = role === "ORGANIZATION";
    const displayPackages = packages.filter(pkg => {
        const forOrg = pkg.roleTarget === "ORGANIZATION";
        // FREEMIUM: show only period 1, match role
        if (pkg.slug === "FREEMIUM") {
            return pkg.billingPeriod === 1 && (isOrg ? forOrg : !forOrg);
        }
        // Paid: match role and selected billing period
        return (isOrg ? forOrg : !forOrg) && pkg.billingPeriod === billingTab;
    });

    // Coupon validation
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

    // Check if there are paid packages to show tabs
    const hasPaidPackages = packages.some(p => p.priceTRY > 0 && (isOrg ? p.roleTarget === "ORGANIZATION" : p.roleTarget === "GUIDE"));

    return (
        <div className="space-y-6">
            {/* Billing Period Tabs */}
            {hasPaidPackages && (
                <div className="flex items-center justify-center">
                    <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        {([1, 3, 12] as BillingTab[]).map((period) => (
                            <button
                                key={period}
                                onClick={() => setBillingTab(period)}
                                className={`
                                    relative px-5 py-2 rounded-lg text-sm font-medium transition-all
                                    ${billingTab === period
                                        ? "bg-white shadow-sm text-slate-900"
                                        : "text-slate-500 hover:text-slate-700"
                                    }
                                `}
                            >
                                {PERIOD_LABELS[period]}
                                {PERIOD_SAVINGS[period] && (
                                    <span className={`
                                        ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full
                                        ${billingTab === period ? "bg-green-100 text-green-700" : "bg-green-50 text-green-600"}
                                    `}>
                                        {PERIOD_SAVINGS[period]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Coupon Input Section */}
            <div className="rounded-xl border bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:from-amber-950/20 dark:to-orange-950/20">
                <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">İndirim Kuponu</span>
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="Kupon kodunu girin..."
                        value={coupon.code}
                        onChange={(e) =>
                            setCoupon((prev) => ({
                                ...prev,
                                code: e.target.value.toUpperCase(),
                                valid: null,
                                message: "",
                            }))
                        }
                        className="flex-1 uppercase tracking-wider bg-white dark:bg-gray-900"
                        disabled={coupon.valid === true}
                    />
                    {coupon.valid === true ? (
                        <Button variant="outline" size="icon" onClick={clearCoupon}>
                            <X className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={validateCoupon}
                            disabled={!coupon.code.trim() || coupon.checking}
                            variant="secondary"
                        >
                            {coupon.checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Uygula"}
                        </Button>
                    )}
                </div>
                {coupon.message && (
                    <p className={`text-xs mt-2 ${coupon.valid ? "text-green-600" : "text-red-500"}`}>
                        {coupon.message}
                    </p>
                )}
            </div>

            {/* Package Grid */}
            <div className={`grid gap-5 ${displayPackages.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4"}`}>
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
                            className={`
                                relative flex flex-col justify-between rounded-2xl border-2 p-6 
                                transition-all hover:shadow-lg hover:-translate-y-0.5
                                ${style.border} ${style.bg}
                                ${style.popular && !isFree ? "ring-2 ring-primary/20 shadow-md" : "shadow-sm"}
                            `}
                        >
                            {/* Popular badge */}
                            {style.popular && !isFree && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow-sm flex items-center gap-1">
                                    <Zap className="h-3 w-3" /> En Popüler
                                </div>
                            )}

                            {/* Discount badge */}
                            {hasDiscount && !isFree && (
                                <div className="absolute -top-3 right-3 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                                    %{coupon.discountPercent} İndirim
                                </div>
                            )}

                            <div className="mb-4">
                                {/* Tier badge */}
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${style.badge}`}>
                                        {pkg.slug.replace("_", " ")}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900">
                                    {pkg.name.replace(/ â€” .*$/, "")}
                                </h3>

                                {/* Price */}
                                <div className="mt-3">
                                    {isFree ? (
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-extrabold text-gray-900">Ücretsiz</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-baseline gap-1">
                                                {hasDiscount ? (
                                                    <>
                                                        <span className="text-sm text-gray-400 line-through">
                                                            {pkg.priceTRY.toLocaleString('tr-TR')}₺
                                                        </span>
                                                        <span className="text-3xl font-extrabold text-green-600">
                                                            {Math.round(discountedPrice).toLocaleString('tr-TR')}
                                                        </span>
                                                        <span className="text-sm font-medium text-green-600">₺</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-3xl font-extrabold text-gray-900">
                                                            {pkg.priceTRY.toLocaleString('tr-TR')}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-500">₺</span>
                                                    </>
                                                )}
                                            </div>
                                            {perMonth && (
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    aylık ~{perMonth.toLocaleString('tr-TR')}₺
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Credits */}
                                <div className="mt-2 flex items-center gap-1.5 text-sm">
                                    <CreditCard className="h-3.5 w-3.5 text-amber-500" />
                                    <span className="font-semibold text-amber-700">{pkg.credits}</span>
                                    <span className="text-gray-500">Kredi</span>
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="mb-6 space-y-2 text-sm text-gray-600 flex-1">
                                {featuresList.length > 0 ? (
                                    featuresList.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="flex items-center gap-2 text-gray-400 italic">
                                        <span>Temel Özellikler</span>
                                    </li>
                                )}
                            </ul>

                            {/* Buy button */}
                            {isFree ? (
                                <div className="w-full mt-4 text-center py-2.5 text-sm font-medium text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                    Mevcut Paketiniz
                                </div>
                            ) : (
                                <Button
                                    onClick={() => handleBuy(pkg)}
                                    disabled={loading !== null}
                                    className={`w-full mt-4 h-11 text-sm font-semibold ${
                                        style.popular
                                            ? "bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                                            : "bg-gray-900 hover:bg-gray-800 text-white"
                                    }`}
                                >
                                    {loading === pkg.id ? (
                                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> İşleniyor...</>
                                    ) : (
                                        <>
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            {hasDiscount
                                                ? `${Math.round(discountedPrice).toLocaleString('tr-TR')}₺ ile Satın Al`
                                                : "Satın Al"}
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    );
                })}
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
