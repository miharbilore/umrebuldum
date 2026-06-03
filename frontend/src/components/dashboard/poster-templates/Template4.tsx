import React from 'react';
import { Phone, User, CheckCircle2, Hotel, ShieldCheck, Star } from 'lucide-react';
import { PosterData } from '../poster-generator/types';
import { STOCK_BACKGROUNDS } from '@/components/dashboard/poster-generator/poster-assets';

export function Template4({ data, id }: { data: PosterData; id?: string }) {
    const bgImage = STOCK_BACKGROUNDS.find(b => b.id === data.backgroundImage)?.url || STOCK_BACKGROUNDS[0].url;

    return (
        <div
            id={id}
            className="w-[1080px] h-[1350px] relative overflow-hidden bg-[#050505] flex flex-col text-white"
            style={{
                fontFamily: data.fontStyle === 'font-serif' ? 'Georgia, serif' : data.fontStyle === 'font-display' ? 'Impact, sans-serif' : 'Inter, sans-serif'
            }}
        >
            {/* === BACKGROUND LAYER === */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center brightness-50 contrast-125 scale-110"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.15)_0%,_transparent_60%)]" />
            </div>

            {/* Bold Luxury Borders */}
            <div className="absolute inset-8 border-[12px] border-[#d4af37]/40 z-10 pointer-events-none" />
            <div className="absolute inset-14 border-2 border-[#d4af37]/60 z-10 pointer-events-none" />

            {/* === CONTENT LAYER === */}
            <div className="relative z-20 flex flex-col h-full px-24 py-24">
                
                {/* ── TOP: Luxury Seal ── */}
                <div className="flex flex-col items-center mb-16 shrink-0">
                    <div className="w-20 h-20 border-2 border-[#d4af37] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                        <Star className="w-10 h-10 text-[#d4af37] fill-[#d4af37]/20" />
                    </div>
                    <div className="text-[#d4af37] text-lg font-black tracking-[0.5em] uppercase">Mübarek Yolculuk</div>
                    <div className="h-1 w-32 bg-[#d4af37] mt-4 shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                </div>

                {/* ── HERO: Dramatic Title ── */}
                <div className="text-center mb-16 shrink-0">
                    <h1 className="text-[110px] font-black leading-none tracking-tighter uppercase text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] mb-4">
                        {data.title}
                    </h1>
                    <div className="inline-block px-8 py-3 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent text-black font-black text-xl uppercase tracking-widest italic shadow-2xl">
                        {data.date}
                    </div>
                </div>

                {/* ── PRICE SECTION: Dramatic Shadow Cards ── */}
                <div className="flex-1 flex flex-col min-h-0 mb-16">
                    <div className="grid grid-cols-3 gap-10 flex-1 min-h-0">
                        {[
                            { label: "4 Kişilik", price: data.price4Person, active: false },
                            { label: "2 Kişilik", price: data.price2Person, active: true },
                            { label: "3 Kişilik", price: data.price3Person, active: false }
                        ].map((tier, idx) => (
                            <div key={idx} 
                                className={`relative flex flex-col border-t-8 ${tier.active ? 'border-[#d4af37] bg-[#111]' : 'border-white/20 bg-black/40'} p-10 rounded-b-3xl shadow-[0_40px_70px_-15px_rgba(0,0,0,0.9)] transition-all duration-500 overflow-hidden`}>
                                
                                {tier.active && (
                                    <div className="absolute -right-12 -top-12 w-24 h-24 bg-[#d4af37] rotate-45 flex items-end justify-center pb-2">
                                        <Star className="w-5 h-5 text-black" />
                                    </div>
                                )}

                                <div className="text-[#d4af37] text-sm font-black uppercase tracking-[0.2em] mb-6">{tier.label} Oda</div>
                                <div className="text-6xl font-black text-white mb-8 tracking-tighter">{tier.price}</div>
                                
                                <div className="mt-auto space-y-4 pt-8 border-t border-white/5">
                                    <div className="flex items-center gap-3 text-sm text-slate-300 font-bold">
                                        <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
                                        <span>Full Program</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-300 font-bold">
                                        <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
                                        <span>Lüks Otel</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── HOTEL INFO ── */}
                <div className="grid grid-cols-2 gap-12 mb-16 shrink-0 max-w-[850px]">
                    <div className="relative group">
                        <div className="flex items-center gap-6 p-6 bg-[#111] border-2 border-white/5 rounded-3xl shadow-2xl group-hover:border-[#d4af37]/50 transition-all">
                            <div className="w-16 h-16 bg-[#d4af37] rounded-2xl flex items-center justify-center shrink-0 shadow-[0_10px_20px_rgba(212,175,55,0.2)]">
                                <Hotel className="w-9 h-9 text-black" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.3em] mb-1">Mekke-i Mükerreme</div>
                                <div className="text-2xl font-black truncate text-white uppercase tracking-tight">{data.hotelMecca}</div>
                            </div>
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="flex items-center gap-6 p-6 bg-[#111] border-2 border-white/5 rounded-3xl shadow-2xl group-hover:border-[#d4af37]/50 transition-all">
                            <div className="w-16 h-16 bg-[#d4af37] rounded-2xl flex items-center justify-center shrink-0 shadow-[0_10px_20px_rgba(212,175,55,0.2)]">
                                <Hotel className="w-9 h-9 text-black" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.3em] mb-1">Medine-i Münevvere</div>
                                <div className="text-2xl font-black truncate text-white uppercase tracking-tight">{data.hotelMedina}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── FOOTER: Professional Guide ── */}
                <div className="mt-auto pt-10 flex items-center gap-10 max-w-[750px]">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-[#d4af37] to-[#8a6d1d] rounded-3xl p-1 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                            <div className="w-full h-full bg-[#050505] rounded-2xl flex items-center justify-center overflow-hidden">
                                <User className="w-12 h-12 text-[#d4af37]" />
                            </div>
                        </div>
                        {data.isIdentityVerified && (
                            <div className="absolute -top-3 -right-3 bg-[#d4af37] text-black p-2 rounded-full shadow-2xl border-4 border-[#050505]">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="text-[#d4af37] text-xs font-black uppercase tracking-[0.5em] mb-2">Tur Rehberi</div>
                        <div className="text-5xl font-black text-white uppercase tracking-tighter truncate mb-2">{data.guideName}</div>
                        <div className="flex items-center gap-4 text-3xl font-bold text-slate-400">
                            <Phone className="w-6 h-6 text-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                            <span>{data.guidePhone}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
