'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check, ShieldCheck, CreditCard, Banknote, Loader2, Package, Gavel, Copyleft, X } from 'lucide-react';
import { TOKEN_PACKAGES } from '@/lib/package-system';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogClose
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TermsContent, RefundPolicyContent } from '@/components/policies-content';

// ── Tip Tanımları ───────────────────────────────────────────────────────
interface CheckoutPackageData {
    id: string;
    name: string;
    priceTRY: number;
    billingPeriod: number;
    slug?: string;
    features?: Record<string, unknown>;
}

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const pkgId = searchParams.get('pkg');
    const tokenPkgId = searchParams.get('tokenPkg');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!pkgId);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [packageData, setPackageData] = useState<CheckoutPackageData | null>(null);
    const [viewingPolicy, setViewingPolicy] = useState<'terms' | 'refund' | null>(null);


    // Load package data if ID is present
    useEffect(() => {
        if (!pkgId) return;
        async function load() {
            try {
                const res = await fetch('/api/packages');
                if (res.ok) {
                    const all: CheckoutPackageData[] = await res.json();
                    const found = all.find((p) => p.id === pkgId);
                    setPackageData(found || null);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setFetching(false);
            }
        }
        load();
    }, [pkgId]);

    // Determine if it's an a la carte token purchase
    const tokenPkg = tokenPkgId ? TOKEN_PACKAGES.find(tp => tp.id === tokenPkgId) : null;
    const isTokenPurchase = !!tokenPkg;

    const totalPrice = isTokenPurchase && tokenPkg
        ? tokenPkg.priceTRY 
        : (packageData?.priceTRY || 0);

    const handlePayment = () => {
        if (!acceptedTerms) return;
        setLoading(true);
        // Simulate payment process
        setTimeout(() => {
            alert('Ödeme altyapısı entegrasyon aşamasındadır. Seçtiğiniz: ' + (isTokenPurchase ? 'Token Paketi' : packageData?.name));
            setLoading(false);
        }, 2000);
    };

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Paket Detayları Hazırlanıyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <main className="flex-1 py-12 px-4 md:py-20 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8">
                        
                        {/* Summary & Package Card */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-black text-slate-900 mb-8">Ödeme Detayları</h1>
                            
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-6">
                                <h2 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b">Seçilen Paket</h2>
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <p className="font-black text-2xl text-slate-900 uppercase">
                                            {isTokenPurchase ? `${tokenPkg?.tokens} Token Paketi` : (packageData?.name || 'Paket Bilgisi Yok')}
                                        </p>
                                        <p className="text-slate-500 font-medium italic">
                                            {isTokenPurchase ? 'Ek Token Yüklemesi' : `Abonelik Süresi: ${packageData?.billingPeriod === 12 ? 'Yıllık' : packageData?.billingPeriod === 3 ? '3 Aylık' : 'Aylık'}`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-blue-600">₺{totalPrice}</p>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Toplam Tutar</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3 mt-8">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                        <Check className="w-4 h-4 text-emerald-500" /> Kesintisiz Hizmet
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                        <Check className="w-4 h-4 text-emerald-500" /> Güvenli Ödeme Altyapısı
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                        <Check className="w-4 h-4 text-emerald-500" /> 7/24 Teknik Destek
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 rounded-2xl p-6 flex items-start gap-4 border border-blue-100">
                                <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
                                <div>
                                    <p className="font-bold text-blue-900">Güvenli İşlem</p>
                                    <p className="text-sm text-blue-700 leading-relaxed font-medium">
                                        Ödemeleriniz PCI-DSS uyumlu altyapı ile %100 güvence altındadır. Kart bilgileriniz asla sunucularımızda saklanmaz.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="w-full lg:w-[400px]">
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 h-full">
                                <h2 className="text-xl font-bold text-slate-800 mb-8">Ödeme Yöntemi</h2>
                                
                                <div className="grid grid-cols-1 gap-4 mb-8">
                                    <button className="flex items-center justify-between p-4 rounded-2xl border-2 border-blue-600 bg-blue-50/50 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                                                <CreditCard className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-slate-900 text-sm">Kredi / Banka Kartı</span>
                                        </div>
                                        <div className="w-5 h-5 rounded-full border-4 border-blue-600 bg-white"></div>
                                    </button>
                                    
                                    <button className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 hover:border-slate-200 transition-colors opacity-50 cursor-not-allowed group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                                <Banknote className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-slate-400 text-sm italic">Havale / EFT (Yakında)</span>
                                        </div>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm font-medium text-slate-500">
                                        <span>Ara Toplam</span>
                                        <span>₺{totalPrice}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium text-slate-500">
                                        <span>KDV (%20)</span>
                                        <span>Dahil</span>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                                        <span className="font-black text-slate-900">Genel Toplam</span>
                                        <span className="text-2xl font-black text-slate-900 tracking-tight">₺{totalPrice}</span>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-4">
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <Checkbox 
                                            id="terms" 
                                            checked={acceptedTerms}
                                            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                                            className="mt-1"
                                        />
                                        <label htmlFor="terms" className="text-xs text-slate-500 font-medium leading-relaxed cursor-pointer select-none">
                                            <button 
                                                type="button"
                                                onClick={() => setViewingPolicy('terms')}
                                                className="text-blue-600 hover:underline font-bold"
                                            >
                                                Kullanım Koşulları
                                            </button> ve <button 
                                                type="button"
                                                onClick={() => setViewingPolicy('refund')}
                                                className="text-blue-600 hover:underline font-bold"
                                            >
                                                İptal/İade Politikası
                                            </button>'nı okudum, kabul ediyorum.
                                        </label>
                                    </div>

                                    <Button 
                                        onClick={handlePayment} 
                                        className={cn(
                                            "w-full py-8 text-lg font-black rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center justify-center gap-2 transition-all",
                                            (!acceptedTerms || loading) && "opacity-50 grayscale cursor-not-allowed"
                                        )}
                                        disabled={!acceptedTerms || loading}
                                    >
                                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Ödemeyi Tamamla'}
                                    </Button>
                                </div>
                                
                                <p className="mt-4 text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                                    Güvenli 256-bit SSL ödeme altyapısı ile korunmaktadır.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Policy Preview Modals */}
            <Dialog open={viewingPolicy !== null} onOpenChange={(open) => !open && setViewingPolicy(null)}>
                <DialogContent showCloseButton={false} className="max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col rounded-3xl border-none shadow-2xl bg-white">
                    <DialogHeader className="p-6 border-b bg-slate-50/50 flex flex-row items-center justify-between shrink-0">
                        <DialogTitle className="flex items-center gap-3 text-xl font-black text-slate-900 uppercase tracking-tight">
                            {viewingPolicy === 'terms' ? (
                                <>
                                    <Gavel className="w-6 h-6 text-blue-600" />
                                    Kullanım Koşulları
                                </>
                            ) : (
                                <>
                                    <Copyleft className="w-6 h-6 text-red-600" />
                                    İptal ve İade Politikası
                                </>
                            )}
                        </DialogTitle>
                        <DialogClose className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm transition-all hover:scale-105 active:scale-95">
                            <X className="h-5 w-5" />
                        </DialogClose>
                    </DialogHeader>

                    <ScrollArea className="flex-1 overflow-y-auto">
                        <div className="p-6 md:p-10 pb-12">
                            {viewingPolicy === 'terms' ? <TermsContent /> : <RefundPolicyContent />}
                        </div>
                    </ScrollArea>

                    <div className="p-5 border-t bg-slate-50 flex justify-center shrink-0">
                        <Button 
                            variant="secondary" 
                            onClick={() => setViewingPolicy(null)}
                            className="font-bold px-8 rounded-xl"
                        >
                            Anladım, Kapat
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
