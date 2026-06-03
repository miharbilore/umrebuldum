import React from 'react';
import { Phone, User, CheckCircle2, ShieldCheck, MapPin, Star } from 'lucide-react';
import { PosterData } from '../poster-generator/types';
import { STOCK_BACKGROUNDS } from '@/components/dashboard/poster-generator/poster-assets';

export function Template10({ data, id }: { data: PosterData; id?: string }) {
    const bgImage = STOCK_BACKGROUNDS.find(b => b.id === data.backgroundImage)?.url || STOCK_BACKGROUNDS[0].url;

    return (
        <div
            id={id}
            className="w-[1080px] h-[1350px] relative overflow-hidden bg-black flex flex-col items-center justify-center text-white"
            style={{
                fontFamily: data.fontStyle === 'font-serif' ? 'Georgia, serif' : data.fontStyle === 'font-display' ? 'Impact, sans-serif' : 'Inter, sans-serif'
            }}
        >
            {/* === CINEMATIC BACKGROUND === */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center brightness-50 contrast-[1.1]"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
                {/* Double Vignette and Center Spotlight */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)]" />
                <div className="absolute inset-0 bg-black/30" />
            </div>

            {/* Subtle Frame */}
            <div className="absolute inset-16 border border-white/10 z-10 pointer-events-none" />

            {/* === CONTENT LAYER (CENTERED) === */}
            <div className="relative z-20 flex flex-col items-center w-full px-24">
                
                {/* TOP BADGE */}
                <div className="flex flex-col items-center mb-16">
                    <Star className="w-8 h-8 text-[#d4af37] mb-4" />
                    <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
                </div>

                {/* MASSIVE CENTER TITLE */}
                <div className="text-center mb-20">
                    <h1 className="text-[130px] font-black leading-[0.8] tracking-tighter uppercase drop-shadow-[0_20px_50px_rgba(0,0,0,1)] mb-8">
                        {data.title}
                    </h1>
                    <div className="text-3xl font-bold tracking-[0.4em] text-[#d4af37] uppercase">
                        {data.date}
                    </div>
                </div>

                {/* HORIZONTAL PRICE LIST */}
                <div className="flex items-center justify-center gap-12 mb-24 w-full">
                    {[
                        { label: "4 Kişilik", price: data.price4Person },
                        { label: "3 Kişilik", price: data.price3Person },
                        { label: "2 Kişilik", price: data.price2Person }
                    ].map((tier, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-3">{tier.label}</span>
                            <span className="text-5xl font-black text-white drop-shadow-lg tracking-tighter">{tier.price}</span>
                        </div>
                    ))}
                </div>

                {/* CINEMATIC FOOTER INFO */}
                <div className="flex items-center justify-center gap-20 w-full mb-12">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40">Mekke Otel</span>
                        <span className="text-xl font-bold uppercase tracking-widest">{data.hotelMecca}</span>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40">Medine Otel</span>
                        <span className="text-xl font-bold uppercase tracking-widest">{data.hotelMedina}</span>
                    </div>
                </div>
            </div>

            {/* ABSOLUTE BOTTOM FOOTER (Left-Aligned to avoid QR) */}
            <div className="absolute bottom-20 left-24 flex items-center gap-8 max-w-[600px]">
                <div className="relative">
                    <div className="w-20 h-20 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center overflow-hidden">
                        <User className="w-10 h-10 text-white/80" />
                    </div>
                    {data.isIdentityVerified && (
                        <div className="absolute top-0 right-0 bg-[#d4af37] p-1.5 rounded-full border-2 border-black">
                            <ShieldCheck className="w-4 h-4 text-black" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] mb-1">Rehber</span>
                    <span className="text-4xl font-black uppercase tracking-tight leading-none mb-2">{data.guideName}</span>
                    <div className="flex items-center gap-2 text-2xl font-bold text-[#d4af37]">
                        <Phone className="w-5 h-5" />
                        <span>{data.guidePhone}</span>
                    </div>
                </div>
            </div>

            {/* Bottom Right QR Zone is kept empty */}
        </div>
    );
}
