import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreditCard, ShieldCheck, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default async function CheckoutPage({ searchParams }: { searchParams: { pkgId?: string } }) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const pkgId = searchParams.pkgId;
    if (!pkgId) redirect("/dashboard/packages");

    const pkg = await prisma.creditPackage.findUnique({
        where: { id: pkgId }
    });

    if (!pkg) redirect("/dashboard/packages");

    return (
        <DashboardLayout>
            <div className="container mx-auto py-10 px-4 max-w-6xl">
                <div className="mb-10">
                    <Link href="/dashboard/packages" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group">
                        <div className="p-2 border border-slate-200 rounded-xl group-hover:bg-slate-100">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm">Geri dön</span>
                    </Link>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-start">
                    {/* Left: Payment Form */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 md:p-12 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 text-slate-100 pointer-events-none">
                                <CreditCard className="w-48 h-48 -mr-12 -mt-12 opacity-50" />
                            </div>

                            <div className="relative z-10">
                                <h2 className="text-3xl font-black text-slate-900 mb-2">Ödeme Bilgileri</h2>
                                <p className="text-slate-500 mb-10 font-medium">Güvenli ödeme altyapımız ile kart bilgilerinizi koruyoruz.</p>

                                {/* Card Preview (Glassmorphism) */}
                                <div className="mb-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 h-[220px] max-w-[400px] shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="w-12 h-8 bg-gradient-to-br from-amber-400 to-amber-200 rounded opacity-80" />
                                            <div className="text-white/40 italic font-black text-xl">VISA</div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="text-white font-mono text-2xl tracking-[0.2em]">
                                                **** **** **** 4242
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">Kart Sahibi</span>
                                                    <div className="text-white text-sm font-bold uppercase tracking-widest truncate max-w-[200px]">AD SOYAD</div>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">SKT</span>
                                                    <div className="text-white text-sm font-bold uppercase tracking-widest">MM/YY</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Inputs */}
                                <form className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="cardName" className="font-bold text-sm text-slate-700 ml-1">KART ÜZERİNDEKİ İSİM</Label>
                                        <Input id="cardName" placeholder="Ad Soyad" className="h-14 rounded-2xl border-2 focus:ring-4 focus:ring-blue-100 transition-all font-semibold" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cardNumber" className="font-bold text-sm text-slate-700 ml-1">KART NUMARASI</Label>
                                        <div className="relative">
                                            <Input id="cardNumber" placeholder="0000 0000 0000 0000" className="h-14 rounded-2xl border-2 pl-12 focus:ring-4 focus:ring-blue-100 transition-all font-mono text-lg" />
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="expiry" className="font-bold text-sm text-slate-700 ml-1">SON KULLANMA</Label>
                                            <Input id="expiry" placeholder="AA / YY" className="h-14 rounded-2xl border-2 focus:ring-4 focus:ring-blue-100 transition-all font-mono" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cvv" className="font-bold text-sm text-slate-700 ml-1">CVC / CVV</Label>
                                            <Input id="cvv" placeholder="***" type="password" className="h-14 rounded-2xl border-2 focus:ring-4 focus:ring-blue-100 transition-all font-mono" />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex items-center gap-4 text-slate-500">
                                            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                                            <p className="text-xs leading-relaxed">
                                                Ödemeniz <strong>TRUST_PCI_DSS</strong> uyumlu altyapımızla işlenmektedir. 
                                                Kredi kartı verileriniz asla sunucularımızda saklanmaz.
                                            </p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right: Summary */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl p-10 flex flex-col">
                            <h2 className="text-2xl font-black text-slate-900 mb-8 border-b pb-4">Sipariş Özeti</h2>
                            
                            <div className="space-y-6 flex-1">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-slate-900">{pkg.name} Paketi</p>
                                            <p className="text-xs text-slate-500">{pkg.credits} Token Hediye</p>
                                        </div>
                                    </div>
                                    <p className="font-black text-slate-900 text-lg">₺{pkg.priceTRY.toString()}</p>
                                </div>

                                <div className="space-y-3 py-6 border-y border-slate-100">
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Ara Toplam</span>
                                        <span className="font-semibold italic">₺{pkg.priceTRY.toString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>KDV (%20)</span>
                                        <span className="font-semibold italic font-mono text-emerald-600">Dahil</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-2xl">
                                    <span className="font-black text-slate-900 italic">TOPLAM</span>
                                    <span className="font-black text-blue-600 tracking-tighter">₺{pkg.priceTRY.toString()}</span>
                                </div>

                                <div className="pt-8">
                                    <Button className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                                        ÖDEMEYİ TAMAMLA
                                    </Button>
                                </div>

                                <div className="flex items-center justify-center gap-2 pt-6 text-slate-400">
                                    <Lock className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Güvenli SSL Ödeme</span>
                                </div>
                            </div>
                        </div>

                        {/* Social Proof / Guarantee */}
                        <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white/80">
                            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                                <div className="w-2 h-6 bg-amber-400 rounded-full" />
                                Memnuniyet Garantisi
                            </h4>
                            <p className="text-xs leading-relaxed">
                                Satın aldığınız tokenler anında hesabınıza tanımlanır. <br/><br/>
                                Herhangi bir teknik aksaklıkta veya paket değişikliği taleplerinizde, 
                                <strong> destek@umrebuldum.com</strong> üzerinden 24 saat içinde çözüm garantisi veriyoruz.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
