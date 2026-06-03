import React from 'react';
import { Phone, User, CheckCircle2, Hotel, ShieldCheck, MapPin } from 'lucide-react';
import { PosterData } from '../poster-generator/types';
import { STOCK_BACKGROUNDS } from '@/components/dashboard/poster-generator/poster-assets';

export function Template12({ data, id }: { data: PosterData; id?: string }) {
    const bgImage = STOCK_BACKGROUNDS.find(b => b.id === data.backgroundImage)?.url || STOCK_BACKGROUNDS[0].url;

    return (
        <div
            id={id}
            className="w-[1080px] h-[1350px] relative overflow-hidden bg-[#fdfcfb] flex flex-col text-slate-800"
            style={{
                fontFamily: data.fontStyle === 'font-serif' ? 'Georgia, serif' : data.fontStyle === 'font-display' ? 'Impact, sans-serif' : 'Inter, sans-serif'
            }}
        >
            {/* === BACKGROUND (Subtle Bloom) === */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center grayscale opacity-10 blur-sm"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#fdfcfb] via-transparent to-transparent" />
            </div>

            {/* === CONTENT LAYER === */}
            <div className="relative z-10 flex flex-col h-full px-16 py-16 gap-12">
                
                {/* SOFT HEADER SECTION */}
                <div className="flex flex-col items-center text-center shrink-0">
                    <div className="text-[#d4af37] text-sm font-bold tracking-[0.5em] uppercase mb-8">Kutsal Yolculuk</div>
                    <h1 className="text-[84px] font-black leading-tight tracking-tighter text-slate-900 mb-8 max-w-[800px]">
                        {data.title}
                    </h1>
                    <div className="flex items-center gap-4 bg-white/60 backdrop-blur px-8 py-3 rounded-full border border-white/80 shadow-sm">
                        <MapPin className="w-5 h-5 text-[#d4af37]" />
                        <span className="text-xl font-bold text-slate-600 uppercase tracking-widest">{data.date}</span>
                    </div>
                </div>

                {/* SOFT CARD GRID */}
                <div className="flex-1 flex flex-col min-h-0 justify-center">
                    <div className="grid grid-cols-3 gap-10">
                        {[
                            { label: "4 Kişilik Oda", price: data.price4Person, color: "bg-[#f8f9fa]" },
                            { label: "3 Kişilik Oda", price: data.price3Person, color: "bg-[#fdf9f2]" },
                            { label: "2 Kişilik Oda", price: data.price2Person, color: "bg-[#f8f9fa]" }
                        ].map((tier, idx) => (
                            <div key={idx} className={`${tier.color} p-12 rounded-[50px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white flex flex-col items-center text-center transition-transform hover:scale-[1.03]`}>
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">{tier.label}</span>
                                <span className="text-5xl font-black text-slate-900 mb-10 tracking-tighter leading-none">{tier.price}</span>
                                <div className="mt-auto flex flex-col items-center">
                                    <CheckCircle2 className="w-6 h-6 text-[#d4af37] mb-2 opacity-40" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Paket</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* INFO BLOCKS */}
                <div className="grid grid-cols-2 gap-10 shrink-0">
                    <div className="bg-white/40 p-8 rounded-[40px] border border-white/80 flex items-center gap-6">
                        <Hotel className="w-8 h-8 text-slate-300" />
                        <div className="min-w-0">
                            <div className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Mekke Konaklama</div>
                            <div className="text-2xl font-bold truncate">{data.hotelMecca}</div>
                        </div>
                    </div>
                    <div className="bg-white/40 p-8 rounded-[40px] border border-white/80 flex items-center gap-6">
                        <Hotel className="w-8 h-8 text-slate-300" />
                        <div className="min-w-0">
                            <div className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Medine Konaklama</div>
                            <div className="text-2xl font-bold truncate">{data.hotelMedina}</div>
                        </div>
                    </div>
                </div>

                {/* SOFT FOOTER */}
                <div className="mt-auto flex items-center gap-8 max-w-[700px]">
                    <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-md border border-white relative">
                        <User className="w-10 h-10 text-slate-200" />
                        {data.isIdentityVerified && (
                            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">{data.guideName}</span>
                        <div className="flex items-center gap-3 text-2xl font-bold text-slate-400">
                            <Phone className="w-5 h-5 opacity-30" />
                            <span>{data.guidePhone}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
