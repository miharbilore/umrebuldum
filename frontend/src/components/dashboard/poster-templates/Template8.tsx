import React from 'react';
import { Phone, User, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { PosterData } from '../poster-generator/types';
import { STOCK_BACKGROUNDS } from '@/components/dashboard/poster-generator/poster-assets';

export function Template8({ data, id }: { data: PosterData; id?: string }) {
    const bgImage = STOCK_BACKGROUNDS.find(b => b.id === data.backgroundImage)?.url || STOCK_BACKGROUNDS[0].url;

    return (
        <div
            id={id}
            className="w-[1080px] h-[1350px] relative overflow-hidden bg-black flex flex-col text-white"
            style={{
                fontFamily: data.fontStyle === 'font-serif' ? 'Georgia, serif' : data.fontStyle === 'font-display' ? 'Impact, sans-serif' : 'Inter, sans-serif'
            }}
        >
            {/* === FULL BACKGROUND IMAGE === */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
                {/* Intense dark gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
            </div>

            {/* === CONTENT LAYER === */}
            <div className="relative z-10 flex flex-col h-full px-20 py-20">
                
                {/* ── TOP: Brand & Urgency ── */}
                <div className="flex items-center justify-between mb-auto shrink-0">
                    <div className="text-white/80 text-sm font-bold tracking-[0.5em] uppercase border-b border-white/20 pb-2">UmreBuldum</div>
                    {data.urgencyText && (
                        <div className="px-6 py-2 bg-red-600/90 backdrop-blur-md text-white font-black text-lg rounded-xl border border-white/20 shadow-2xl uppercase tracking-widest">
                            {data.urgencyText}
                        </div>
                    )}
                </div>

                {/* ── HERO: Massive Title ── */}
                <div className="mb-12 shrink-0">
                    <h1 className="text-[120px] font-black leading-[0.85] tracking-tighter uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] mb-6">
                        {data.title}
                    </h1>
                    <div className="flex items-center gap-4 text-2xl font-bold italic text-[#d4af37] tracking-widest drop-shadow-lg">
                        <MapPin className="w-6 h-6" />
                        <span>{data.date}</span>
                    </div>
                </div>

                {/* ── MINIMAL PRICES ── */}
                <div className="grid grid-cols-3 gap-8 mb-16 shrink-0 max-w-[800px]">
                    {[
                        { label: "4 Kişilik", price: data.price4Person },
                        { label: "3 Kişilik", price: data.price3Person },
                        { label: "2 Kişilik", price: data.price2Person }
                    ].map((tier, idx) => (
                        <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
                            <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">{tier.label}</div>
                            <div className="text-3xl font-black">{tier.price}</div>
                        </div>
                    ))}
                </div>

                {/* ── FOOTER: Minimal ── */}
                <div className="flex items-center gap-6 max-w-[650px]">
                    <div className="relative">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                            <User className="w-10 h-10 text-white" />
                            {data.isIdentityVerified && (
                                <div className="absolute -top-2 -right-2 bg-emerald-500 p-1.5 rounded-full shadow-lg border-2 border-black">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-black uppercase tracking-tight">{data.guideName}</span>
                        <div className="flex items-center gap-2 text-xl font-bold text-white/70">
                            <Phone className="w-4 h-4 text-[#d4af37]" />
                            <span>{data.guidePhone}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
