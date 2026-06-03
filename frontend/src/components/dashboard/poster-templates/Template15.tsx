import React from 'react';
import { Phone, User, CheckCircle2, Hotel, ShieldCheck } from 'lucide-react';
import { PosterData } from '../poster-generator/types';
import { STOCK_BACKGROUNDS } from '@/components/dashboard/poster-generator/poster-assets';

export function Template15({ data, id }: { data: PosterData; id?: string }) {
    const bgImage = STOCK_BACKGROUNDS.find(b => b.id === data.backgroundImage)?.url || STOCK_BACKGROUNDS[0].url;

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div
            id={id}
            className="w-[1080px] h-[1350px] relative overflow-hidden bg-slate-50 flex flex-col text-slate-900"
            style={{
                fontFamily: data.fontStyle === 'font-serif' ? 'Georgia, serif' : data.fontStyle === 'font-display' ? 'Impact, sans-serif' : 'Inter, sans-serif'
            }}
        >
            {/* === BACKGROUND LAYER === */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center grayscale opacity-[0.03]"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
            </div>

            {/* === CONTENT LAYER === */}
            <div className="relative z-10 flex flex-col h-full px-16 py-20">
                
                {/* HEADER SECTION (SIDE BY SIDE) */}
                <div className="flex items-center gap-16 mb-20 shrink-0">
                    <div className="w-[400px] h-[400px] bg-white rounded-[60px] border-8 border-white shadow-2xl flex items-center justify-center overflow-hidden shrink-0 relative">
                        {data.guideImage ? (
                            <img src={data.guideImage} alt={data.guideName} crossOrigin="anonymous" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-[#d4af37]/5 flex items-center justify-center text-[#d4af37] text-[140px] font-black">
                                {getInitials(data.guideName)}
                            </div>
                        )}
                        {data.isIdentityVerified && (
                            <div className="absolute top-6 right-6 bg-[#d4af37] text-white p-3 rounded-2xl shadow-xl border-4 border-white">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px w-8 bg-[#d4af37]" />
                            <span className="text-[#d4af37] text-sm font-black tracking-[0.4em] uppercase">Tur Rehberi</span>
                        </div>
                        <h1 className="text-[100px] font-black leading-none tracking-tighter text-slate-900 uppercase mb-6">
                            {data.guideName}
                        </h1>
                        <div className="flex items-center gap-4 text-3xl font-bold text-slate-400">
                            <Phone className="w-6 h-6 text-[#d4af37]" />
                            <span>{data.guidePhone}</span>
                        </div>
                    </div>
                </div>

                {/* BIG INFO CARD */}
                <div className="flex-1 bg-white rounded-[50px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-100 p-16 flex flex-col">
                    <div className="mb-12 border-b border-slate-50 pb-8">
                        <span className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Yolculuk Detayları</span>
                        <h2 className="text-[64px] font-black text-slate-900 leading-tight uppercase tracking-tight">
                            {data.title}
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-16 mb-16">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs">
                                <Hotel className="w-4 h-4 text-[#d4af37]" />
                                <span>Konaklama</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-700 uppercase leading-tight">
                                {data.hotelMecca} <br/> {data.hotelMedina}
                            </div>
                        </div>
                        <div className="space-y-4 text-right">
                            <div className="flex items-center justify-end gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs">
                                <span className="text-[#d4af37]">Program Tarihi</span>
                            </div>
                            <div className="text-4xl font-black text-slate-900 uppercase">{data.date}</div>
                        </div>
                    </div>

                    <div className="mt-auto grid grid-cols-3 gap-8">
                        {[
                            { label: "4 Kişilik Oda", price: data.price4Person },
                            { label: "3 Kişilik Oda", price: data.price3Person },
                            { label: "2 Kişilik Oda", price: data.price2Person }
                        ].map((tier, idx) => (
                            <div key={idx} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col items-center">
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">{tier.label}</span>
                                <span className="text-4xl font-black text-slate-900 tracking-tighter">{tier.price}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FOOTER SAFE ZONE */}
                <div className="h-10 pr-[280px]" />
            </div>
        </div>
    );
}
