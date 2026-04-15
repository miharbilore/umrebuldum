"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Save, Loader2, Package, RefreshCw, Plus,
    Crown, Building2, ChevronDown, ChevronUp,
    Zap, Shield, Image as ImageIcon, Calendar
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

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
    features: Record<string, any>;
}

const NUMERIC_FEATURES = [
    { key: "maxListings", label: "Maks. İlan Sayısı", icon: "📋" },
    { key: "listingDays", label: "İlan Süresi (Gün)", icon: "📅" },
    { key: "maxBoosts", label: "Aylık Boost Hakkı", icon: "🚀" },
    { key: "boostDays", label: "Boost Süresi (Gün)", icon: "⏱️" },
];

const TOGGLE_FEATURES = [
    { key: "phoneVisible", label: "Telefon Görünürlüğü", icon: "📞" },
    { key: "spotlightEligible", label: "Vitrin İlanı (Spotlight)", icon: "⭐" },
    { key: "priorityRanking", label: "Öncelikli Sıralama", icon: "📊" },
    { key: "trustBoost", label: "Güven Puanı Desteği", icon: "🏆" },
    { key: "identityVerificationEligible", label: "Kimlik Doğrulama", icon: "✅" },
    { key: "canCreatePoster", label: "Afiş/Poster Motoru", icon: "🎨" },
    { key: "watermark", label: "Filigran Zorunlu", icon: "💧" },
];

const TIER_COLORS: Record<string, { gradient: string; border: string; badge: string }> = {
    FREEMIUM:      { gradient: "from-slate-50 to-gray-50", border: "border-slate-200", badge: "bg-slate-100 text-slate-700" },
    PREMIUM:       { gradient: "from-blue-50 to-indigo-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" },
    PLUS:          { gradient: "from-amber-50 to-orange-50", border: "border-amber-300", badge: "bg-amber-100 text-amber-800" },
    PRO:           { gradient: "from-violet-50 to-purple-50", border: "border-violet-300", badge: "bg-violet-100 text-violet-800" },
    BUSINESS:      { gradient: "from-emerald-50 to-teal-50", border: "border-emerald-300", badge: "bg-emerald-100 text-emerald-700" },
    BUSINESS_PLUS: { gradient: "from-purple-50 to-fuchsia-50", border: "border-purple-300", badge: "bg-purple-100 text-purple-800" },
};

function getTierColor(slug: string) {
    return TIER_COLORS[slug] || TIER_COLORS.FREEMIUM;
}

const PERIOD_LABEL: Record<number, string> = { 1: "Aylık", 3: "3 Aylık", 12: "Yıllık" };

export function PackageManager() {
    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [editData, setEditData] = useState<Record<string, Partial<CreditPackage>>>({});
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newPkg, setNewPkg] = useState<Partial<CreditPackage>>({
        slug: "PREMIUM",
        roleTarget: "GUIDE",
        billingPeriod: 1,
        credits: 100,
        priceTRY: 299,
        monthlyPrice: 299,
        features: {}
    });

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/packages");
            if (res.ok) {
                const data = await res.json();
                setPackages(data);
                const initial: Record<string, Partial<CreditPackage>> = {};
                data.forEach((pkg: CreditPackage) => {
                    let featObj = pkg.features;
                    if (Array.isArray(featObj)) featObj = {};
                    initial[pkg.id] = {
                        name: pkg.name,
                        credits: pkg.credits,
                        priceTRY: pkg.priceTRY,
                        monthlyPrice: pkg.monthlyPrice,
                        features: featObj || {},
                    };
                });
                setEditData(initial);
            } else {
                toast.error("Paketler yüklenemedi.");
            }
        } catch {
            toast.error("Bağlantı hatası.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPackages(); }, []);

    const handleFieldChange = (id: string, field: keyof CreditPackage, value: string | number) => {
        setEditData((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    };

    const handleFeatureChange = (id: string, key: string, value: any) => {
        setEditData((prev) => {
            const currentFeatures = prev[id].features || {};
            return { ...prev, [id]: { ...prev[id], features: { ...currentFeatures, [key]: value } } };
        });
    };

    const handleSave = async (pkg: CreditPackage) => {
        const edits = editData[pkg.id];
        if (!edits) return;
        setSaving(pkg.id);
        try {
            const res = await fetch("/api/admin/packages", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: pkg.id,
                    name: edits.name,
                    credits: Number(edits.credits),
                    priceTRY: Number(edits.priceTRY),
                    monthlyPrice: Number(edits.monthlyPrice),
                    features: edits.features,
                }),
            });
            if (res.ok) {
                toast.success(`"${edits.name}" güncellendi.`);
                fetchPackages();
            } else {
                const err = await res.json();
                toast.error(err.error || "Güncelleme başarısız.");
            }
        } catch {
            toast.error("Bağlantı hatası.");
        } finally {
            setSaving(null);
        }
    };

    const handleCreate = async () => {
        if (!newPkg.slug || !newPkg.name || !newPkg.roleTarget) {
            toast.error("Lütfen zorunlu alanları doldurun.");
            return;
        }
        setCreating(true);
        try {
            const res = await fetch("/api/admin/packages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPkg),
            });
            if (res.ok) {
                toast.success("Yeni paket oluşturuldu.");
                setShowCreateForm(false);
                fetchPackages();
            } else {
                const err = await res.json();
                toast.error(err.error || "Oluşturma başarısız.");
            }
        } catch {
            toast.error("Bağlantı hatası.");
        } finally {
            setCreating(false);
        }
    };


    const hasChanges = (pkg: CreditPackage) => {
        const edits = editData[pkg.id];
        if (!edits) return false;
        const featuresChanged = JSON.stringify(pkg.features || {}) !== JSON.stringify(edits.features || {});
        return (
            edits.name !== pkg.name ||
            Number(edits.credits) !== pkg.credits ||
            Number(edits.priceTRY) !== pkg.priceTRY ||
            Number(edits.monthlyPrice) !== pkg.monthlyPrice ||
            featuresChanged
        );
    };

    const toggleExpanded = (id: string) =>
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Paketler yükleniyor...</span>
            </div>
        );
    }

    if (packages.length === 0) {
        return (
            <div className="text-center py-16">
                <Package className="h-10 w-10 mx-auto mb-3 text-slate-400" />
                <p className="font-medium text-slate-700">Henüz paket bulunamadı</p>
                <p className="text-sm text-muted-foreground mt-1">
                    <code>npx ts-node scripts/setup-packages.ts</code> ile ekleyin.
                </p>
            </div>
        );
    }

    // Group: Guide vs Corporate, then by slug
    const guidePackages = packages.filter(p => p.roleTarget === "GUIDE");
    const corpPackages = packages.filter(p => p.roleTarget === "ORGANIZATION");

    // Group by slug
    const groupBySlug = (pkgs: CreditPackage[]) => {
        const groups: Record<string, CreditPackage[]> = {};
        for (const p of pkgs) {
            if (!groups[p.slug]) groups[p.slug] = [];
            groups[p.slug].push(p);
        }
        return Object.entries(groups);
    };

    const renderPackageGroup = (slug: string, variants: CreditPackage[]) => {
        const colors = getTierColor(slug);
        const isOrg = variants[0]?.roleTarget === "ORGANIZATION";
        const isFree = variants[0]?.priceTRY === 0;

        return (
            <div key={slug + variants[0]?.roleTarget} className={`rounded-2xl border-2 overflow-hidden ${colors.border} bg-gradient-to-br ${colors.gradient}`}>
                {/* Group header */}
                <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-200/60">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOrg ? "bg-emerald-100" : "bg-white"} shadow-sm`}>
                        {isOrg ? <Building2 className="h-4 w-4 text-emerald-600" /> : <Crown className="h-4 w-4 text-amber-500" />}
                    </div>
                    <div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${colors.badge}`}>
                            {slug.replace("_", " ")}
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            {isFree ? "Ücretsiz" : `${variants.length} dönem`}
                        </p>
                    </div>
                </div>

                {/* Period variants */}
                <div className="divide-y divide-slate-200/60">
                    {variants.map((pkg) => {
                        const edits = editData[pkg.id] || {};
                        const changed = hasChanges(pkg);
                        const features: any = edits.features || {};
                        const isOpen = expanded[pkg.id];

                        return (
                            <div key={pkg.id} className={`px-4 py-4 ${changed ? "bg-primary/5" : ""}`}>
                                {/* Period badge + core fields */}
                                <div className="flex items-center gap-2 mb-3">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-600">
                                        {PERIOD_LABEL[pkg.billingPeriod] || `${pkg.billingPeriod} Ay`}
                                    </span>
                                    {changed && (
                                        <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                            Değişiklik var
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-semibold text-slate-500 uppercase">Paket Adı</Label>
                                        <Input
                                            value={edits.name || ""}
                                            onChange={(e) => handleFieldChange(pkg.id, "name", e.target.value)}
                                            className="h-8 text-xs bg-white/80"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-semibold text-slate-500 uppercase">Kredi</Label>
                                        <Input
                                            type="number" min={0}
                                            value={edits.credits ?? ""}
                                            onChange={(e) => handleFieldChange(pkg.id, "credits", e.target.value)}
                                            className="h-8 text-xs bg-white/80"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-semibold text-slate-500 uppercase">Toplam Fiyat (₺)</Label>
                                        <Input
                                            type="number" min={0} step={1}
                                            value={edits.priceTRY ?? ""}
                                            onChange={(e) => handleFieldChange(pkg.id, "priceTRY", e.target.value)}
                                            className="h-8 text-xs bg-white/80"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-semibold text-slate-500 uppercase">Aylık Baz (₺)</Label>
                                        <Input
                                            type="number" min={0} step={1}
                                            value={edits.monthlyPrice ?? ""}
                                            onChange={(e) => handleFieldChange(pkg.id, "monthlyPrice", e.target.value)}
                                            className="h-8 text-xs bg-white/80"
                                        />
                                    </div>
                                </div>

                                {/* Expand features */}
                                <button
                                    onClick={() => toggleExpanded(pkg.id)}
                                    className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    {isOpen ? "Özellikleri Gizle" : "Özellikleri Düzenle"}
                                </button>

                                {isOpen && (
                                    <div className="mt-3 space-y-3">
                                        {/* Numeric */}
                                        <div className="bg-white/60 rounded-xl p-3 border border-slate-200/80">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <Zap className="h-3 w-3 text-blue-600" />
                                                <h4 className="text-[10px] font-bold text-slate-700 uppercase">Sayısal Limitler</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {NUMERIC_FEATURES.map((f) => (
                                                    <div key={f.key} className="space-y-0.5">
                                                        <Label className="text-[10px] text-slate-500">{f.icon} {f.label}</Label>
                                                        <Input
                                                            type="number"
                                                            value={features[f.key] ?? ""}
                                                            onChange={(e) => handleFeatureChange(pkg.id, f.key, Number(e.target.value))}
                                                            className="h-7 text-xs bg-white"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Toggles */}
                                        <div className="bg-white/60 rounded-xl p-3 border border-slate-200/80">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <Shield className="h-3 w-3 text-emerald-600" />
                                                <h4 className="text-[10px] font-bold text-slate-700 uppercase">Yetki & Görünürlük</h4>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                {TOGGLE_FEATURES.map((f) => (
                                                    <div
                                                        key={f.key}
                                                        className={`flex items-center justify-between px-2.5 py-2 rounded-lg border text-xs transition-all ${
                                                            features[f.key]
                                                                ? "bg-emerald-50/50 border-emerald-200"
                                                                : "bg-white border-slate-100"
                                                        }`}
                                                    >
                                                        <span className="text-slate-700">{f.icon} {f.label}</span>
                                                        <Switch
                                                            checked={!!features[f.key]}
                                                            onCheckedChange={(c) => handleFeatureChange(pkg.id, f.key, c)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Poster quality */}
                                        <div className="bg-white/60 rounded-xl p-3 border border-slate-200/80">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <ImageIcon className="h-3 w-3 text-violet-600" />
                                                <h4 className="text-[10px] font-bold text-slate-700 uppercase">Poster Kalitesi</h4>
                                            </div>
                                            <div className="flex gap-1.5">
                                                {["LOW", "NORMAL", "HIGH"].map((q) => (
                                                    <button
                                                        key={q}
                                                        onClick={() => handleFeatureChange(pkg.id, "posterQuality", q)}
                                                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border-2 transition-all ${
                                                            features.posterQuality === q
                                                                ? "border-primary bg-primary/10 text-primary"
                                                                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                                                        }`}
                                                    >
                                                        {q === "LOW" ? "Düşük" : q === "NORMAL" ? "Normal" : "Yüksek"}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Save */}
                                <Button
                                    onClick={() => handleSave(pkg)}
                                    disabled={!changed || saving === pkg.id}
                                    className={`w-full mt-3 h-8 text-xs ${
                                        changed ? "bg-primary hover:bg-primary/90 text-white" : "bg-slate-100 text-slate-400"
                                    }`}
                                    variant={changed ? "default" : "secondary"}
                                    size="sm"
                                >
                                    {saving === pkg.id
                                        ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Kaydediliyor...</>
                                        : <><Save className="h-3 w-3 mr-1.5" /> Kaydet</>
                                    }
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Abonelik Paketleri</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {packages.length} paket kaydı · Dinamik fiyatlandırma yönetimi
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowCreateForm(!showCreateForm)} className={`gap-1.5 text-xs transition-all ${showCreateForm ? 'bg-red-50 border-red-200 text-red-600' : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'}`}>
                        {showCreateForm ? <ChevronUp className="h-3 w-3" /> : <Plus className="h-3 w-3" />} 
                        {showCreateForm ? "Vazgeç" : "Yeni Paket Ekle"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={fetchPackages} disabled={loading} className="gap-1.5 text-xs">
                        <RefreshCw className="h-3 w-3" /> Yenile
                    </Button>
                </div>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <div className="p-5 bg-white border-2 border-emerald-100 rounded-2xl shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                        <Plus className="h-4 w-4" /> Yeni Paket Tanımla
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-600 uppercase">Slug (Örn: PREMIUM)</Label>
                            <Input value={newPkg.slug} onChange={e => setNewPkg({ ...newPkg, slug: e.target.value.toUpperCase() })} placeholder="PREMIUM" className="h-9" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-600 uppercase">Paket Adı</Label>
                            <Input value={newPkg.name} onChange={e => setNewPkg({ ...newPkg, name: e.target.value })} placeholder="Premium Paket" className="h-9" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-600 uppercase">Hedef Rol</Label>
                            <select 
                                value={newPkg.roleTarget} 
                                onChange={e => setNewPkg({ ...newPkg, roleTarget: e.target.value })}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:ring-2 focus:ring-emerald-500/20 outline-none"
                            >
                                <option value="GUIDE">REHBER</option>
                                <option value="ORGANIZATION">KURUMSAL</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-600 uppercase">Token (Kredi)</Label>
                            <Input type="number" value={newPkg.credits} onChange={e => setNewPkg({ ...newPkg, credits: Number(e.target.value) })} className="h-9" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-600 uppercase">Toplam Fiyat (₺)</Label>
                            <Input type="number" value={newPkg.priceTRY} onChange={e => setNewPkg({ ...newPkg, priceTRY: Number(e.target.value) })} className="h-9" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-600 uppercase">Dönem (Ay)</Label>
                            <select 
                                value={newPkg.billingPeriod} 
                                onChange={e => setNewPkg({ ...newPkg, billingPeriod: Number(e.target.value) })}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:ring-2 focus:ring-emerald-500/20 outline-none"
                            >
                                <option value={1}>1 Ay (Aylık)</option>
                                <option value={3}>3 Ay (Çeyrek)</option>
                                <option value={12}>12 Ay (Yıllık)</option>
                            </select>
                        </div>
                    </div>
                    <Button onClick={handleCreate} disabled={creating} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11">
                        {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Paketi Oluştur ve Kaydet
                    </Button>
                </div>
            )}

            {/* Guide Section */}
            {guidePackages.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                            <Crown className="h-3.5 w-3.5 text-white" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">Rehber Paketleri</h3>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                        {groupBySlug(guidePackages).map(([slug, variants]) =>
                            renderPackageGroup(slug, variants)
                        )}
                    </div>
                </section>
            )}

            {/* Corporate Section */}
            {corpPackages.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                            <Building2 className="h-3.5 w-3.5 text-white" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">Kurumsal Paketler</h3>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                        {groupBySlug(corpPackages).map(([slug, variants]) =>
                            renderPackageGroup(slug, variants)
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
