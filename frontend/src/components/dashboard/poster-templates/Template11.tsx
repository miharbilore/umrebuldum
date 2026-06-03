import React from 'react';
import { Phone, User, CheckCircle2, Hotel, ShieldCheck, Calendar, MapPin } from 'lucide-react';
import { PosterData } from '../poster-generator/types';
import { STOCK_BACKGROUNDS } from '@/components/dashboard/poster-generator/poster-assets';

export function Template11({ data, id }: { data: PosterData; id?: string }) {
    const bgImage = STOCK_BACKGROUNDS.find(b => b.id === data.backgroundImage)?.url || STOCK_BACKGROUNDS[0].url;

    return (
        <div
            id={id}
            className="w-[1080px] h-[1350px] relative overflow-hidden bg-slate-100 flex flex-col text-slate-900"
            style={{
                fontFamily: data.fontStyle === 'font-serif' ? 'Georgia, serif' : data.fontStyle === 'font-display' ? 'Impact, sans-serif' : 'Inter, sans-serif'
            }}
        >
            {/* === BACKGROUND (Subtle Pattern) === */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center grayscale opacity-10"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
            </div>

            {/* === CONTENT LAYER === */}
            <div className="relative z-10 flex flex-col h-full px-12 py-12 gap-8">
                
                {/* TOP HEADER CARD */}
                <div className="bg-white p-12 rounded-[40px] shadow-sm border border-slate-200 flex flex-col items-center text-center shrink-0">
                    <div className="text-slate-400 text-xs font-black tracking-[0.5em] uppercase mb-6">Özel Umre Programı</div>
                    <h1 className="text-[72px] font-black leading-none tracking-tighter text-slate-900 uppercase mb-8">
                        {data.title}
                    </h1>
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-3 text-slate-500 font-bold">
                            <Calendar className="w-5 h-5 text-[#d4af37]" />
                            <span className="text-xl">{data.date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 font-bold">
                            <MapPin className="w-5 h-5 text-[#d4af37]" />
                            <span className="text-xl">Mekke & Medine</span>
                        </div>
                    </div>
                </div>

                {/* PRICE GRID CARD */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 flex flex-col h-full">
                        <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b border-slate-50 pb-4">Konaklama Paketleri</div>
                        <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
                            {[
                                { label: "4 Kişilik", price: data.price4Person },
                                { label: "3 Kişilik", price: data.price3Person },
                                { label: "2 Kişilik", price: data.price2Person }
                            ].map((tier, idx) => (
                                <div key={idx} className="bg-slate-50 rounded-[32px] p-8 flex flex-col items-center text-center border border-slate-100">
                                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">{tier.label}</span>
                                    <span className="text-4xl font-black text-slate-900 mb-6 tracking-tighter">{tier.price}</span>
                                    <div className="mt-auto flex flex-col items-center gap-2">
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                            <span>Paket Dahil</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* INFO ROW GRID */}
                <div className="grid grid-cols-2 gap-8 shrink-0">
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center shrink-0">
                            <Hotel className="w-8 h-8 text-[#d4af37]" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Mekke Oteli</div>
                            <div className="text-xl font-bold truncate">{data.hotelMecca}</div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center shrink-0">
                            <Hotel className="w-8 h-8 text-[#d4af37]" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Medine Oteli</div>
                            <div className="text-xl font-bold truncate">{data.hotelMedina}</div>
                        </div>
                    </div>
                </div>

                {/* FOOTER USER CARD */}
                <div className="bg-slate-900 p-8 rounded-[32px] shadow-lg flex items-center justify-between max-w-[700px] shrink-0">
                    <div className="flex items-center gap-8">
                        <div className="relative">
                            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden">
                                <User className="w-10 h-10 text-slate-200" />
                            </div>
                            {data.isIdentityVerified && (
                                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border-2 border-slate-900">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white text-3xl font-black uppercase tracking-tight mb-1">{data.guideName}</span>
                            <div className="flex items-center gap-2 text-slate-400 font-bold">
                                <Phone className="w-4 h-4 text-[#d4af37]" />
                                <span className="text-xl">{data.guidePhone}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
