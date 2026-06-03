import React from 'react';
import { Phone, User, CheckCircle2, Hotel, ShieldCheck, Calendar } from 'lucide-react';
import { PosterData } from '../poster-generator/types';
import { STOCK_BACKGROUNDS } from '@/components/dashboard/poster-generator/poster-assets';

export function Template5({ data, id }: { data: PosterData; id?: string }) {
    const bgImage = STOCK_BACKGROUNDS.find(b => b.id === data.backgroundImage)?.url || STOCK_BACKGROUNDS[0].url;

    return (
        <div
            id={id}
            className="w-[1080px] h-[1350px] relative overflow-hidden bg-white flex flex-col text-slate-900"
            style={{
                fontFamily: data.fontStyle === 'font-serif' ? 'Georgia, serif' : data.fontStyle === 'font-display' ? 'Impact, sans-serif' : 'Inter, sans-serif'
            }}
        >
            {/* === BACKGROUND LAYER (Subtle) === */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center grayscale opacity-[0.03]"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
            </div>

            {/* === CONTENT LAYER === */}
            <div className="relative z-10 flex flex-col h-full px-24 py-24">
                
                {/* ── TOP: Minimal Logo ── */}
                <div className="flex items-center gap-4 mb-20 shrink-0">
                    <div className="w-12 h-[1px] bg-[#d4af37]" />
                    <div className="text-slate-400 text-xs font-bold tracking-[0.4em] uppercase">UmreBuldum</div>
                </div>

                {/* ── HERO: Clean Typography ── */}
                <div className="mb-24 shrink-0">
                    <h1 className="text-[100px] font-bold leading-tight tracking-tight text-slate-900 mb-6">
                        {data.title}
                    </h1>
                    <div className="flex items-center gap-4 text-[#d4af37]">
                        <Calendar className="w-5 h-5" />
                        <span className="text-xl font-medium tracking-wide">{data.date}</span>
                    </div>
                </div>

                {/* ── PRICE SECTION: Simple Blocks ── */}
                <div className="flex-1 flex flex-col min-h-0 mb-20">
                    <div className="grid grid-cols-3 gap-12 flex-1 min-h-0">
                        {[
                            { label: "4 Kişilik Oda", price: data.price4Person },
                            { label: "3 Kişilik Oda", price: data.price3Person },
                            { label: "2 Kişilik Oda", price: data.price2Person }
                        ].map((tier, idx) => (
                            <div key={idx} className="flex flex-col border-t border-slate-100 pt-8 group">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 group-hover:text-[#d4af37] transition-colors">{tier.label}</span>
                                <span className="text-[56px] font-medium text-slate-900 tracking-tighter mb-8 leading-none">{tier.price}</span>
                                <div className="mt-auto space-y-3">
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]/60" />
                                        <span>Konaklama Dahil</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]/60" />
                                        <span>Rehberlik</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── HOTEL INFO: Minimal Horizontal ── */}
                <div className="grid grid-cols-2 gap-20 mb-24 shrink-0">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-300">
                            <Hotel className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Mekke Oteli</span>
                        </div>
                        <div className="text-3xl font-medium text-slate-800 leading-tight border-l border-[#d4af37]/30 pl-6">{data.hotelMecca}</div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-300">
                            <Hotel className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Medine Oteli</span>
                        </div>
                        <div className="text-3xl font-medium text-slate-800 leading-tight border-l border-[#d4af37]/30 pl-6">{data.hotelMedina}</div>
                    </div>
                </div>

                {/* ── FOOTER: Apple-like Clean ── */}
                <div className="mt-auto flex items-center justify-between max-w-[700px]">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 relative shadow-sm">
                            <User className="w-10 h-10 text-slate-300" />
                            {data.isIdentityVerified && (
                                <div className="absolute bottom-0 right-0 bg-[#d4af37] text-white p-1 rounded-full shadow-lg border-2 border-white">
                                    <ShieldCheck className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em] mb-1">Rehber Bilgisi</span>
                            <span className="text-4xl font-bold text-slate-900 tracking-tight mb-1">{data.guideName}</span>
                            <div className="flex items-center gap-2 text-slate-500 font-medium">
                                <Phone className="w-3.5 h-3.5 opacity-40" />
                                <span className="text-xl tracking-tight">{data.guidePhone}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
