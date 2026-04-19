import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreditCard, ShieldCheck, Lock, ArrowLeft, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";

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
            <div className="min-h-screen bg-slate-50/50 pb-20">
                <div className="container mx-auto py-10 px-4 max-w-6xl">
                    <div className="mb-10">
                        <Link href="/dashboard/packages" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group">
                            <div className="p-2 border border-slate-200 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            <span className="font-black text-xs uppercase tracking-widest">Geri dön</span>
                        </Link>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-12 items-start">
                        {/* Left: Payment Form */}
                        <div className="lg:col-span-7 space-y-8">
                            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-8 md:p-12 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 text-slate-50 pointer-events-none">
                                    <CreditCard className="w-64 h-64 -mr-16 -mt-16 opacity-100" />
                                </div>

                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest mb-6">
                                        <ShieldCheck className="w-3 h-3 text-[#059669]" width={12} height={12} />
                                        Güvenli Ödeme Sahası
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-900 mb-2 leading-none">Ödeme Bilgileri</h2>
                                    <p className="text-slate-500 mb-12 font-bold max-w-sm">Kart bilgilerinizi girerek işleminizi güvenle tamamlayın.</p>

                                    {/* Card Preview (Modern Design) */}
                                    <div className="mb-12 bg-slate-900 rounded-[2rem] p-8 h-[240px] max-w-[420px] shadow-2xl relative overflow-hidden group border border-slate-800">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFB800]/10 rounded-bl-[4rem]" />
                                        
                                        <div className="relative z-10 flex flex-col h-full justify-between">
                                            <div className="flex justify-between items-start">
                                                <div className="w-14 h-10 bg-gradient-to-br from-amber-400 to-amber-200 rounded-lg shadow-lg" />
                                                <div className="text-white/20 italic font-black text-2xl tracking-tighter">PREMIUM</div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="text-white font-mono text-2xl tracking-[0.25em] shadow-sm">
                                                    **** **** **** 4242
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">Kart Sahibi</span>
                                                        <div className="text-white text-sm font-black uppercase tracking-widest truncate max-w-[200px]">AD SOYAD</div>
                                                    </div>
                                                    <div className="space-y-1 text-right">
                                                        <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">Valid Thru</span>
                                                        <div className="text-white text-sm font-black uppercase tracking-widest">MM/YY</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Inputs */}
                                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="cardName" className="font-black text-[10px] text-slate-400 uppercase tracking-widest ml-1">KART ÜZERİNDEKİ İSİM</Label>
                                            <Input id="cardName" placeholder="AD SOYAD" className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-[#FFB800]/10 transition-all font-black uppercase tracking-wider" />
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="cardNumber" className="font-black text-[10px] text-slate-400 uppercase tracking-widest ml-1">KART NUMARASI</Label>
                                            <div className="relative">
                                                <Input id="cardNumber" placeholder="0000 0000 0000 0000" className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white pl-14 focus:ring-4 focus:ring-[#FFB800]/10 transition-all font-mono text-lg tracking-widest" />
                                                <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" width={20} height={20} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="expiry" className="font-black text-[10px] text-slate-400 uppercase tracking-widest ml-1">SON KULLANMA</Label>
                                            <Input id="expiry" placeholder="AA / YY" className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-[#FFB800]/10 transition-all font-mono text-center tracking-widest" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cvv" className="font-black text-[10px] text-slate-400 uppercase tracking-widest ml-1">CVC / CVV</Label>
                                            <Input id="cvv" placeholder="***" type="password" className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-[#FFB800]/10 transition-all font-mono text-center" />
                                        </div>

                                        <div className="md:col-span-2 pt-6">
                                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-start gap-4">
                                                <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                                                    <ShieldCheck className="w-5 h-5 text-[#059669]" width={20} height={20} />
                                                </div>
                                                <p className="text-[11px] leading-relaxed font-bold text-slate-500">
                                                    Ödemeniz <strong className="text-slate-900">PCI-DSS</strong> uyumlu güvenli altyapı ile işlenir. 
                                                    Kart verileriniz asla sistemlerimizde saklanmaz.
                                                </p>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Right: Summary */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-10 flex flex-col relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -z-10 group-hover:bg-slate-100 transition-colors" />
                                
                                <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                    Sipariş Özeti
                                    <div className="h-px bg-slate-100 flex-1" />
                                </h2>
                                
                                <div className="space-y-8 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                                <Zap className="w-6 h-6 fill-[#FFB800] text-[#FFB800]" width={24} height={24} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 uppercase tracking-wider">{pkg.name} Paketi</p>
                                                <p className="text-[10px] font-black text-[#059669] bg-emerald-50 px-2 py-0.5 rounded w-fit mt-1 uppercase tracking-widest">{pkg.credits} Token Hediye</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-slate-900 text-xl tracking-tight">₺{pkg.priceTRY.toLocaleString('tr-TR')}</p>
                                    </div>

                                    <div className="space-y-4 py-8 border-y border-slate-50">
                                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                                            <span>Ara Toplam</span>
                                            <span className="text-slate-900 tracking-normal">₺{pkg.priceTRY.toLocaleString('tr-TR')}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                                            <span>KDV (%20)</span>
                                            <span className="text-[#059669] tracking-widest bg-emerald-50 px-2 py-0.5 rounded text-[9px]">DAHİL</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <span className="font-black text-slate-500 uppercase tracking-[0.3em] text-xs font-mono">TOPLAM</span>
                                        <span className="font-black text-slate-900 text-3xl tracking-tighter">₺{pkg.priceTRY.toLocaleString('tr-TR')}</span>
                                    </div>

                                    <div className="pt-4">
                                        <Button className="w-full min-h-[64px] rounded-2xl text-base font-black uppercase tracking-[0.2em] shadow-xl shadow-[#FFB800]/20 bg-[#FFB800] hover:bg-[#E6A600] text-black flex items-center justify-center gap-4 transition-all active:scale-95 group">
                                            ÖDEMEYİ TAMAMLA
                                            <CheckCircle2 className="w-5 h-5 group-hover:scale-125 transition-transform" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-center gap-2 pt-4 text-slate-400">
                                        <Lock className="w-4 h-4" width={16} height={16} />
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">AES-256 SSL Şifreleme</span>
                                    </div>
                                </div>
                            </div>

                            {/* Social Proof / Guarantee */}
                            <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white/60 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -z-10 group-hover:bg-white/10 transition-colors" />
                                <h4 className="text-white font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-[#FFB800] rounded-full" />
                                    Güvencemiz
                                </h4>
                                <p className="text-xs leading-relaxed font-bold">
                                    Satın aldığınız tokenlar anında hesabınıza tanımlanır. <br/><br/>
                                    Herhangi bir sorun yaşarsanız uzman ekibimiz 24 saat içinde çözüm garantisi veriyor.
                                    <br/><br/>
                                    <span className="text-white underline underline-offset-4 decoration-[#FFB800] decoration-2">destek@umrebuldum.com</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
