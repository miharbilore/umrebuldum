import React from 'react';
import { Phone, User, CheckCircle2, Hotel, ShieldCheck, MapPin, Calendar } from 'lucide-react';
import { PosterData } from '../poster-generator/types';
import { STOCK_BACKGROUNDS } from '@/components/dashboard/poster-generator/poster-assets';

export function Template7({ data, id }: { data: PosterData; id?: string }) {
    const bgImage = STOCK_BACKGROUNDS.find(b => b.id === data.backgroundImage)?.url || STOCK_BACKGROUNDS[0].url;

    return (
        <div
            id={id}
            className="w-[1080px] h-[1350px] relative overflow-hidden bg-[#fafafa] flex flex-col text-slate-900"
            style={{
                fontFamily: data.fontStyle === 'font-serif' ? 'Georgia, serif' : data.fontStyle === 'font-display' ? 'Impact, sans-serif' : 'Inter, sans-serif'
            }}
        >
            {/* === BACKGROUND LAYER === */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center grayscale opacity-[0.04]"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
            </div>

            {/* === CONTENT LAYER === */}
            <div className="relative z-10 flex flex-col h-full px-20 py-20">
                
                {/* ── TOP SECTION: Grid Based ── */}
                <div className="grid grid-cols-2 gap-10 mb-16 shrink-0">
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-3 text-[#d4af37] mb-6">
                            <div className="w-8 h-[2px] bg-[#d4af37]" />
                            <span className="text-xs font-black tracking-[0.4em] uppercase">Modern Umre</span>
                        </div>
                        <h1 className="text-[80px] font-black leading-[0.9] tracking-tighter text-slate-900 uppercase">
                            {data.title}
                        </h1>
                    </div>
                    <div className="flex flex-col justify-center items-end text-right">
                        <div className="bg-white p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 max-w-[320px]">
                            <div className="flex items-center justify-end gap-3 text-slate-400 mb-2">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Planlanan Tarih</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900">{data.date}</div>
                        </div>
                    </div>
                </div>

                <div className="h-px w-full bg-slate-200 mb-16" />

                {/* ── MIDDLE: Price Grid ── */}
                <div className="flex-1 flex flex-col min-h-0 mb-16">
                    <div className="grid grid-cols-3 gap-8 flex-1 min-h-0">
                        {[
                            { label: "4 Kişilik", price: data.price4Person, icon: "👥👥" },
                            { label: "3 Kişilik", price: data.price3Person, icon: "👥👤" },
                            { label: "2 Kişilik", price: data.price2Person, icon: "👥" }
                        ].map((tier, idx) => (
                            <div key={idx} className="bg-white p-10 rounded-[40px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col items-center text-center transition-all hover:shadow-[0_25px_60px_rgba(0,0,0,0.06)] hover:-translate-y-2">
                                <div className="text-3xl mb-6">{tier.icon}</div>
                                <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">{tier.label} Oda</div>
                                <div className="text-5xl font-black text-slate-900 mb-8 tracking-tighter">{tier.price}</div>
                                <div className="mt-auto space-y-3 w-full">
                                    <div className="h-px w-full bg-slate-100 mb-4" />
                                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                        <span>Full Paket</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── HOTEL INFO SECTION ── */}
                <div className="grid grid-cols-2 gap-8 mb-16 shrink-0">
                    <div className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <Hotel className="w-8 h-8 text-slate-200" />
                        <div className="min-w-0">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mekke Oteli</div>
                            <div className="text-xl font-bold truncate">{data.hotelMecca}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <Hotel className="w-8 h-8 text-slate-200" />
                        <div className="min-w-0">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Medine Oteli</div>
                            <div className="text-xl font-bold truncate">{data.hotelMedina}</div>
                        </div>
                    </div>
                </div>

                {/* ── FOOTER: Grid Aligned ── */}
                <div className="mt-auto flex items-center justify-between max-w-[750px]">
                    <div className="flex items-center gap-10">
                        <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.05)] border border-slate-100 relative">
                            <User className="w-12 h-12 text-slate-200" />
                            {data.isIdentityVerified && (
                                <div className="absolute -top-2 -right-2 bg-[#d4af37] text-white p-1.5 rounded-xl shadow-lg">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <div className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.4em] mb-2">Tur Rehberi</div>
                            <div className="text-4xl font-black text-slate-900 tracking-tighter mb-1 uppercase">{data.guideName}</div>
                            <div className="flex items-center gap-3 text-2xl font-bold text-slate-400">
                                <Phone className="w-5 h-5 opacity-30" />
                                <span>{data.guidePhone}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
