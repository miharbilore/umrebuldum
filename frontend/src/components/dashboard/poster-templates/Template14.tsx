import React from 'react';
import { Phone, User, CheckCircle2, Hotel, ShieldCheck, Star } from 'lucide-react';
import { PosterData } from '../poster-generator/types';
import { STOCK_BACKGROUNDS } from '@/components/dashboard/poster-generator/poster-assets';

export function Template14({ data, id }: { data: PosterData; id?: string }) {
    const bgImage = STOCK_BACKGROUNDS.find(b => b.id === data.backgroundImage)?.url || STOCK_BACKGROUNDS[0].url;

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div
            id={id}
            className="w-[1080px] h-[1350px] relative overflow-hidden bg-white flex flex-col items-center text-slate-900"
            style={{
                fontFamily: data.fontStyle === 'font-serif' ? 'Georgia, serif' : data.fontStyle === 'font-display' ? 'Impact, sans-serif' : 'Inter, sans-serif'
            }}
        >
            {/* === BACKGROUND LAYER === */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center grayscale opacity-[0.05]"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
            </div>

            {/* === CONTENT LAYER === */}
            <div className="relative z-10 flex flex-col h-full items-center w-full px-20 py-24">
                
                {/* GUIDE AVATAR (Large Centered) */}
                <div className="mb-12 shrink-0">
                    <div className="w-[360px] h-[360px] bg-slate-50 rounded-full border-8 border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] flex items-center justify-center overflow-hidden relative">
                        {data.guideImage ? (
                            <img src={data.guideImage} alt={data.guideName} crossOrigin="anonymous" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] text-[120px] font-black">
                                {getInitials(data.guideName)}
                            </div>
                        )}
                        {data.isIdentityVerified && (
                            <div className="absolute bottom-6 right-6 bg-[#d4af37] text-white p-3 rounded-full shadow-2xl border-4 border-white">
                                <ShieldCheck className="w-10 h-10" />
                            </div>
                        )}
                    </div>
                </div>

                {/* TRUST BADGE */}
                <div className="flex items-center gap-3 mb-8 shrink-0">
                    <div className="h-px w-10 bg-[#d4af37]" />
                    <span className="text-[#d4af37] text-sm font-black tracking-[0.4em] uppercase">Güvenilir Rehber</span>
                    <div className="h-px w-10 bg-[#d4af37]" />
                </div>

                {/* NAME & TITLE */}
                <div className="text-center mb-16 shrink-0">
                    <h1 className="text-[96px] font-black leading-none tracking-tighter text-slate-900 uppercase mb-4">
                        {data.guideName}
                    </h1>
                    <div className="text-3xl font-bold text-slate-400 italic">Sizinle Bu Kutlu Yolculuğa Çıkıyoruz</div>
                </div>

                {/* TOUR INFO CARD */}
                <div className="bg-slate-50 w-full rounded-[48px] p-12 border border-slate-100 shadow-sm flex flex-col gap-10 flex-1 min-h-0">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-8">
                        <div className="flex flex-col">
                            <span className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Tur Başlığı</span>
                            <span className="text-4xl font-black text-slate-800 uppercase tracking-tight">{data.title}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Tarih</span>
                            <div className="text-3xl font-bold text-[#d4af37]">{data.date}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-8">
                        {[
                            { label: "4 Kişilik", price: data.price4Person },
                            { label: "3 Kişilik", price: data.price3Person },
                            { label: "2 Kişilik", price: data.price2Person }
                        ].map((tier, idx) => (
                            <div key={idx} className="flex flex-col">
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">{tier.label}</span>
                                <span className="text-4xl font-black text-slate-900 tracking-tighter">{tier.price}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto flex items-center justify-center gap-12">
                        <div className="flex items-center gap-4 text-slate-600 font-bold">
                            <Phone className="w-6 h-6 text-[#d4af37]" />
                            <span className="text-3xl">{data.guidePhone}</span>
                        </div>
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="flex items-center gap-3 text-slate-500 font-bold uppercase tracking-widest text-xs">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <span>Onaylı Program</span>
                        </div>
                    </div>
                </div>

                {/* FOOTER PADDING FOR QR SAFE ZONE */}
                <div className="h-20 w-full pr-[280px]" />
            </div>
        </div>
    );
}
