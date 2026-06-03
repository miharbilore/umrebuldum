import React from 'react';
import { Phone, User, CheckCircle2, Hotel, ShieldCheck, Award } from 'lucide-react';
import { PosterData } from '../poster-generator/types';
import { STOCK_BACKGROUNDS } from '@/components/dashboard/poster-generator/poster-assets';

export function Template16({ data, id }: { data: PosterData; id?: string }) {
    const bgImage = STOCK_BACKGROUNDS.find(b => b.id === data.backgroundImage)?.url || STOCK_BACKGROUNDS[0].url;

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div
            id={id}
            className="w-[1080px] h-[1350px] relative overflow-hidden bg-[#0a0a0a] flex flex-col text-white"
            style={{
                fontFamily: data.fontStyle === 'font-serif' ? 'Georgia, serif' : data.fontStyle === 'font-display' ? 'Impact, sans-serif' : 'Inter, sans-serif'
            }}
        >
            {/* === PREMIUM BACKGROUND === */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center brightness-[0.3] contrast-[1.2] grayscale"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/50" />
            </div>

            {/* GOLD ACCENT FRAME */}
            <div className="absolute inset-10 border border-[#d4af37]/20 z-10 pointer-events-none" />

            {/* === CONTENT LAYER === */}
            <div className="relative z-20 flex flex-col h-full px-20 py-24 items-center">
                
                {/* PREMIUM GUIDE PORTRAIT */}
                <div className="mb-12 shrink-0">
                    <div className="w-[440px] h-[440px] rounded-full border-[12px] border-[#0a0a0a] shadow-[0_40px_80px_rgba(0,0,0,1)] relative group">
                        {/* Gold outer ring */}
                        <div className="absolute inset-[-14px] rounded-full border-2 border-[#d4af37]/30" />
                        
                        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-slate-900 border border-white/5">
                            {data.guideImage ? (
                                <img src={data.guideImage} alt={data.guideName} crossOrigin="anonymous" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#d4af37] text-[150px] font-black opacity-40">
                                    {getInitials(data.guideName)}
                                </div>
                            )}
                        </div>

                        {data.isIdentityVerified && (
                            <div className="absolute bottom-4 right-4 bg-[#d4af37] text-black p-4 rounded-full shadow-[0_10px_30px_rgba(212,175,55,0.4)] border-4 border-[#0a0a0a]">
                                <ShieldCheck className="w-10 h-10" />
                            </div>
                        )}
                    </div>
                </div>

                {/* TRUST BADGE SECTION */}
                <div className="flex items-center gap-6 mb-10 shrink-0">
                    <div className="h-px w-20 bg-[#d4af37]/40" />
                    <div className="flex items-center gap-2 text-[#d4af37]">
                        <Award className="w-5 h-5" />
                        <span className="text-sm font-black tracking-[0.5em] uppercase">Sertifikalı Tur Rehberi</span>
                    </div>
                    <div className="h-px w-20 bg-[#d4af37]/40" />
                </div>

                {/* BOLD IDENTITY */}
                <div className="text-center mb-16 shrink-0 relative">
                    {data.urgencyText && (
                        <div className="mb-6 inline-flex items-center gap-3 px-6 py-2 border-2 border-[#d4af37] text-[#d4af37] rounded-full font-black text-lg tracking-[0.3em] uppercase">
                            <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                            {data.urgencyText}
                            <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                        </div>
                    )}
                    <h1 className="text-[120px] font-black leading-none tracking-tighter uppercase mb-6 drop-shadow-2xl">
                        {data.guideName}
                    </h1>
                    <div className="inline-block px-10 py-3 bg-[#d4af37] text-black font-black text-2xl uppercase tracking-widest shadow-2xl skew-x-[-12deg]">
                        <span className="skew-x-[12deg] inline-block">{data.guidePhone}</span>
                    </div>
                </div>

                {/* TOUR PREVIEW CARD */}
                <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[40px] flex flex-col gap-10 flex-1 min-h-0">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <span className="text-[#d4af37] text-xs font-black uppercase tracking-[0.3em]">Program Detayı</span>
                            <h2 className="text-5xl font-black uppercase tracking-tight leading-none">{data.title}</h2>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Tarih</span>
                            <span className="text-3xl font-bold tracking-tighter">{data.date}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-10">
                        {[
                            { label: "4 Kişilik Oda", price: data.price4Person },
                            { label: "3 Kişilik Oda", price: data.price3Person },
                            { label: "2 Kişilik Oda", price: data.price2Person }
                        ].map((tier, idx) => (
                            <div key={idx} className="flex flex-col border-l-2 border-[#d4af37]/40 pl-6">
                                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">{tier.label}</span>
                                <span className="text-4xl font-black tracking-tighter">{tier.price}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-10">
                        <div className="flex items-center gap-4 text-white/60 font-bold uppercase tracking-widest text-xs">
                            <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
                            <span>Vip Karşılama</span>
                        </div>
                        <div className="flex items-center gap-4 text-white/60 font-bold uppercase tracking-widest text-xs">
                            <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
                            <span>Onaylı Acente</span>
                        </div>
                    </div>
                </div>

                {/* FOOTER PADDING FOR QR SAFE ZONE */}
                <div className="h-10 w-full pr-[280px]" />
            </div>
        </div>
    );
}
