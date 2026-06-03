import React from 'react';
import { Phone, User, CheckCircle2, Hotel, ShieldCheck, MapPin, Calendar } from 'lucide-react';
import { PosterData } from '../poster-generator/types';
import { STOCK_BACKGROUNDS } from '@/components/dashboard/poster-generator/poster-assets';

export function Template3({ data, id }: { data: PosterData; id?: string }) {
    const bgImage = STOCK_BACKGROUNDS.find(b => b.id === data.backgroundImage)?.url || STOCK_BACKGROUNDS[0].url;

    return (
        <div
            id={id}
            className="w-[1080px] h-[1350px] relative overflow-hidden bg-white flex flex-col text-slate-900"
            style={{
                fontFamily: data.fontStyle === 'font-serif' ? 'Georgia, serif' : data.fontStyle === 'font-display' ? 'Impact, sans-serif' : 'Inter, sans-serif'
            }}
        >
            {/* === BACKGROUND LAYER === */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center grayscale opacity-10"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
                <div className="absolute inset-0 bg-white/95" />
            </div>

            {/* Subtle Border Frame */}
            <div className="absolute inset-12 border border-slate-200 z-10 pointer-events-none" />

            {/* === CONTENT LAYER === */}
            <div className="relative z-20 flex flex-col h-full px-24 py-24">
                
                {/* ── TOP: Minimal Brand ── */}
                <div className="flex flex-col items-center mb-16 shrink-0">
                    <div className="text-slate-400 text-xs font-bold tracking-[0.6em] uppercase mb-4">UmreBuldum Premium</div>
                    <div className="h-px w-16 bg-slate-200" />
                </div>

                {/* ── HERO: Elegant Typography ── */}
                <div className="mb-20 shrink-0">
                    <h1 className="text-[90px] font-light leading-[1.1] tracking-tight text-slate-900 mb-8">
                        {data.title}
                    </h1>
                    <div className="flex items-center gap-10 text-slate-500">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 opacity-50" />
                            <span className="text-sm font-medium tracking-widest uppercase">{data.date}</span>
                        </div>
                        <div className="h-4 w-px bg-slate-200" />
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 opacity-50" />
                            <span className="text-sm font-medium tracking-widest uppercase">Mekke & Medine</span>
                        </div>
                    </div>
                </div>

                {/* ── PRICE SECTION: Minimal List/Grid ── */}
                <div className="flex-1 flex flex-col min-h-0 mb-16">
                    <div className="grid grid-cols-1 gap-4 max-w-[600px]">
                        {[
                            { label: "2 Kişilik Oda", price: data.price2Person },
                            { label: "3 Kişilik Oda", price: data.price3Person },
                            { label: "4 Kişilik Oda", price: data.price4Person }
                        ].map((tier, idx) => (
                            <div key={idx} className="flex items-center justify-between py-8 border-b border-slate-100 last:border-0 group transition-all duration-300 hover:pl-4">
                                <div className="flex flex-col">
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{tier.label}</span>
                                    <span className="text-sm text-slate-500 font-medium italic">Kişi başı başlayan fiyatlar</span>
                                </div>
                                <div className="text-5xl font-light text-slate-900 tracking-tighter group-hover:text-[#d4af37] transition-colors">{tier.price}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── HOTEL INFO ── */}
                <div className="grid grid-cols-2 gap-16 mb-20 shrink-0 max-w-[800px]">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-400">
                            <Hotel className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Mekke Konaklama</span>
                        </div>
                        <div className="text-2xl font-light text-slate-800 leading-tight border-l-2 border-slate-100 pl-4">{data.hotelMecca}</div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-400">
                            <Hotel className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Medine Konaklama</span>
                        </div>
                        <div className="text-2xl font-light text-slate-800 leading-tight border-l-2 border-slate-100 pl-4">{data.hotelMedina}</div>
                    </div>
                </div>

                {/* ── FOOTER: Guide Info ── */}
                <div className="mt-auto flex items-center justify-between max-w-[700px]">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-sm relative">
                            <User className="w-10 h-10 text-slate-300" />
                            {data.isIdentityVerified && (
                                <div className="absolute -top-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-lg border-2 border-white">
                                    <ShieldCheck className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em] mb-1">Tur Sorumlusu</span>
                            <span className="text-3xl font-light text-slate-900 tracking-tight mb-1">{data.guideName}</span>
                            <div className="flex items-center gap-2 text-slate-500 font-medium">
                                <Phone className="w-3.5 h-3.5 opacity-50" />
                                <span className="text-lg">{data.guidePhone}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Safe zone indicator (debug) */}
            {/* <div className="absolute bottom-10 right-10 w-[240px] h-[280px] bg-red-500/5 border border-dashed border-red-500/20" /> */}
        </div>
    );
}
