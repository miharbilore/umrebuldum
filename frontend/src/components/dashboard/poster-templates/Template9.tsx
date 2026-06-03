import React from 'react';
import { Phone, User, CheckCircle2, Hotel, ShieldCheck, Calendar } from 'lucide-react';
import { PosterData } from '../poster-generator/types';
import { STOCK_BACKGROUNDS } from '@/components/dashboard/poster-generator/poster-assets';

export function Template9({ data, id }: { data: PosterData; id?: string }) {
    const bgImage = STOCK_BACKGROUNDS.find(b => b.id === data.backgroundImage)?.url || STOCK_BACKGROUNDS[0].url;

    return (
        <div
            id={id}
            className="w-[1080px] h-[1350px] relative overflow-hidden bg-slate-50 flex flex-col"
            style={{
                fontFamily: data.fontStyle === 'font-serif' ? 'Georgia, serif' : data.fontStyle === 'font-display' ? 'Impact, sans-serif' : 'Inter, sans-serif'
            }}
        >
            {/* === TOP IMAGE SECTION === */}
            <div className="h-[60%] relative shrink-0 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Float title on image bottom */}
                <div className="absolute bottom-12 left-16 right-16">
                    <h1 className="text-[90px] font-black leading-none tracking-tighter text-white uppercase drop-shadow-2xl">
                        {data.title}
                    </h1>
                </div>
            </div>

            {/* === BOTTOM INFO PANEL === */}
            <div className="flex-1 bg-white relative z-10 -mt-10 rounded-t-[60px] shadow-[0_-20px_40px_rgba(0,0,0,0.1)] px-16 pt-16 pb-12 flex flex-col">
                
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                        <Calendar className="w-5 h-5 text-[#d4af37]" />
                        <span className="text-xl font-bold text-slate-800 uppercase tracking-widest">{data.date}</span>
                    </div>
                    <div className="text-slate-300 text-sm font-black tracking-[0.4em] uppercase">Bilgi Paneli</div>
                </div>

                <div className="grid grid-cols-3 gap-8 mb-12 shrink-0">
                    {[
                        { label: "4 Kişilik", price: data.price4Person },
                        { label: "3 Kişilik", price: data.price3Person },
                        { label: "2 Kişilik", price: data.price2Person }
                    ].map((tier, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 p-8 rounded-[32px] flex flex-col items-center">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{tier.label}</span>
                            <span className="text-4xl font-black text-slate-900 tracking-tighter">{tier.price}</span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-10 mb-auto">
                    <div className="flex flex-col border-l-4 border-[#d4af37] pl-6">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Mekke Otel</span>
                        <span className="text-2xl font-bold text-slate-800 truncate">{data.hotelMecca}</span>
                    </div>
                    <div className="flex flex-col border-l-4 border-[#d4af37] pl-6">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Medine Otel</span>
                        <span className="text-2xl font-bold text-slate-800 truncate">{data.hotelMedina}</span>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between max-w-[650px]">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center relative">
                            <User className="w-8 h-8 text-[#d4af37]" />
                            {data.isIdentityVerified && (
                                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-lg">
                                    <ShieldCheck className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-slate-900 uppercase truncate">{data.guideName}</span>
                            <div className="flex items-center gap-2 text-slate-500 font-bold">
                                <Phone className="w-4 h-4 text-[#d4af37]" />
                                <span>{data.guidePhone}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
