import React from 'react';
import { Phone, User, CheckCircle2, Hotel, ShieldCheck, Tag } from 'lucide-react';
import { PosterData } from '../poster-generator/types';
import { STOCK_BACKGROUNDS } from '@/components/dashboard/poster-generator/poster-assets';

export function Template13({ data, id }: { data: PosterData; id?: string }) {
    const bgImage = STOCK_BACKGROUNDS.find(b => b.id === data.backgroundImage)?.url || STOCK_BACKGROUNDS[0].url;

    return (
        <div
            id={id}
            className="w-[1080px] h-[1350px] relative overflow-hidden bg-slate-900 flex flex-col text-white"
            style={{
                fontFamily: data.fontStyle === 'font-serif' ? 'Georgia, serif' : data.fontStyle === 'font-display' ? 'Impact, sans-serif' : 'Inter, sans-serif'
            }}
        >
            {/* === BACKGROUND LAYER === */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
            </div>

            {/* === CONTENT LAYER === */}
            <div className="relative z-10 flex flex-col h-full px-16 py-16">
                
                {/* HEADER CARD */}
                <div className="bg-white p-12 rounded-[40px] shadow-2xl flex flex-col mb-12 text-slate-900 relative overflow-hidden">
                    {data.urgencyText && (
                        <div className="absolute top-0 right-0 bg-[#d4af37] text-white px-8 py-3 font-black text-lg uppercase tracking-tighter rounded-bl-[20px] shadow-lg">
                            {data.urgencyText}
                        </div>
                    )}
                    <div className="flex items-center gap-3 text-[#d4af37] mb-6">
                        <Tag className="w-5 h-5" />
                        <span className="text-xs font-black tracking-[0.5em] uppercase">Vip Umre Teklifi</span>
                    </div>
                    <h1 className="text-[90px] font-black leading-[0.9] tracking-tighter uppercase mb-4">
                        {data.title}
                    </h1>
                    <div className="text-2xl font-bold text-slate-400 uppercase tracking-widest">{data.date}</div>
                </div>

                {/* BIG PRICE CARD SECTION */}
                <div className="flex-1 flex flex-col mb-12">
                    <div className="bg-gradient-to-br from-[#d4af37] to-[#b8860b] p-12 rounded-[50px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] flex flex-col h-full text-black relative overflow-hidden max-w-[700px]">
                        {/* Decorative Pattern */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
                        
                        <div className="flex items-center gap-5 mb-12">
                            <span className="h-[2px] w-12 bg-black" />
                            <span className="text-sm font-black uppercase tracking-[0.4em]">Konaklama Seçenekleri</span>
                        </div>

                        <div className="grid grid-cols-1 gap-6 flex-1">
                            {[
                                { label: "2 Kişilik Oda", price: data.price2Person },
                                { label: "3 Kişilik Oda", price: data.price3Person },
                                { label: "4 Kişilik Oda", price: data.price4Person }
                            ].map((tier, idx) => (
                                <div key={idx} className="bg-black/5 border border-black/10 rounded-[32px] p-8 flex items-center justify-between group transition-all hover:bg-black/10">
                                    <div className="flex flex-col">
                                        <span className="text-black/60 text-xs font-black uppercase tracking-widest mb-1">{tier.label}</span>
                                        <span className="text-sm font-bold text-black/80">Her şey dahil fiyat</span>
                                    </div>
                                    <span className="text-6xl font-black tracking-tighter">{tier.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FOOTER AREA - Stacked to clear QR zone */}
                <div className="flex flex-col gap-6 pr-[280px]">
                    <div className="flex gap-6">
                        {/* Hotel Info Block */}
                        <div className="flex-1 bg-white/10 backdrop-blur-md p-6 rounded-[32px] border border-white/10 flex items-center gap-6">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                <Hotel className="w-6 h-6 text-[#d4af37]" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-0.5">Konaklama</div>
                                <div className="text-lg font-bold truncate">Mekke & Medine Otelleri</div>
                            </div>
                        </div>

                        {/* Guide Info Block */}
                        <div className="flex-1 bg-white p-6 rounded-[32px] flex items-center gap-6 text-slate-900 shadow-2xl">
                            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shrink-0">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none block">Rehber</span>
                                <div className="text-xl font-black truncate leading-tight">{data.guideName}</div>
                                <div className="flex items-center gap-2 text-md font-bold text-[#d4af37]">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>{data.guidePhone}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
