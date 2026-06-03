import React from 'react';
import { Phone, User, CheckCircle2, Hotel, ShieldCheck, MapPin, Calendar } from 'lucide-react';
import { PosterData } from '../poster-generator/types';
import { STOCK_BACKGROUNDS } from '@/components/dashboard/poster-generator/poster-assets';

export function Template2({ data, id }: { data: PosterData; id?: string }) {
    const bgImage = STOCK_BACKGROUNDS.find(b => b.id === data.backgroundImage)?.url || STOCK_BACKGROUNDS[0].url;

    return (
        <div
            id={id}
            className="w-[1080px] h-[1350px] relative overflow-hidden bg-black flex flex-col text-white"
            style={{
                fontFamily: data.fontStyle === 'font-serif' ? 'Georgia, serif' : data.fontStyle === 'font-display' ? 'Impact, sans-serif' : 'Inter, sans-serif'
            }}
        >
            {/* === BACKGROUND LAYER === */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-105"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
                {/* Dark premium overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
            </div>

            {/* Subtle Gold Dust / Pattern Overlay */}
            <div className="absolute inset-0 z-0 opacity-10 mix-blend-screen pointer-events-none"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23d4af37'/%3E%3Ccircle cx='50' cy='50' r='1.5' fill='%23d4af37'/%3E%3Ccircle cx='90' cy='10' r='0.8' fill='%23d4af37'/%3E%3C/svg%3E")` }} />

            {/* === CONTENT LAYER === */}
            <div className="relative z-10 flex flex-col h-full px-20 pt-16 pb-16">
                
                {/* ── TOP: Header Line ── */}
                <div className="flex items-center justify-center gap-4 mb-12 shrink-0">
                    <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#d4af37]" />
                    <div className="text-[#d4af37] text-sm font-black tracking-[0.6em] uppercase">Premium Umre Deneyimi</div>
                    <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#d4af37]" />
                </div>

                {/* MAIN TITLE & BADGE */}
                <div className="text-center mb-16 relative">
                    {data.urgencyText && (
                        <div className="inline-block px-8 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white font-black text-xl rounded-full shadow-[0_10px_30px_rgba(220,38,38,0.4)] mb-6 border-2 border-white/20 uppercase tracking-widest">
                            {data.urgencyText}
                        </div>
                    )}
                    <h1 className="text-[120px] font-black leading-none tracking-tighter text-white drop-shadow-2xl uppercase">
                        {data.title}
                    </h1>
                    <div className="flex items-center justify-center gap-6 mt-6">
                        <div className="flex items-center gap-2 text-[#d4af37] bg-[#d4af37]/10 px-4 py-2 rounded-full border border-[#d4af37]/20 shadow-lg">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-bold tracking-widest uppercase">{data.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#d4af37] bg-[#d4af37]/10 px-4 py-2 rounded-full border border-[#d4af37]/20 shadow-lg">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm font-bold tracking-widest uppercase">Kutsal Topraklar</span>
                        </div>
                    </div>
                </div>

                {/* ── PRICE SECTION: Highlighted Middle ── */}
                <div className="flex-1 flex flex-col min-h-0 mb-12">
                    <div className="grid grid-cols-3 gap-8 flex-1 min-h-0 items-center">
                        {/* 4 Person */}
                        <div className="bg-[#111] border border-white/10 rounded-[40px] p-8 flex flex-col h-[320px] shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/5 rounded-full -mr-12 -mt-12" />
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">4 Kişilik</div>
                            <div className="text-5xl font-black text-white mb-6 leading-none">{data.price4Person}</div>
                            <div className="mt-auto space-y-3">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
                                    <span>Konforlu Ulaşım</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
                                    <span>Ziyaretler</span>
                                </div>
                            </div>
                        </div>

                        {/* 3 Person (Highlighted) */}
                        <div className="bg-gradient-to-b from-[#d4af37] to-[#8a6d1d] rounded-[48px] p-10 flex flex-col h-[380px] shadow-[0_40px_80px_-20px_rgba(212,175,55,0.4)] relative transform scale-110 z-20 overflow-hidden group">
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%]" />
                            <div className="text-black/60 text-xs font-black uppercase tracking-[0.2em] mb-4">En Çok Tercih Edilen</div>
                            <div className="text-black text-sm font-bold uppercase tracking-widest mb-2">3 Kişilik Oda</div>
                            <div className="text-[64px] font-black text-black leading-none mb-8 tracking-tighter">{data.price3Person}</div>
                            <div className="mt-auto space-y-4">
                                <div className="flex items-center gap-3 text-black/80 font-bold text-sm">
                                    <CheckCircle2 className="w-5 h-5 text-black" />
                                    <span>Özel Rehberlik</span>
                                </div>
                                <div className="flex items-center gap-3 text-black/80 font-bold text-sm">
                                    <CheckCircle2 className="w-5 h-5 text-black" />
                                    <span>VIP Transfer</span>
                                </div>
                            </div>
                        </div>

                        {/* 2 Person */}
                        <div className="bg-[#111] border border-white/10 rounded-[40px] p-8 flex flex-col h-[320px] shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/5 rounded-full -mr-12 -mt-12" />
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">2 Kişilik</div>
                            <div className="text-5xl font-black text-white mb-6 leading-none">{data.price2Person}</div>
                            <div className="mt-auto space-y-3">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
                                    <span>Geniş Oda</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
                                    <span>Tüm İkramlar</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── HOTEL INFO ── */}
                <div className="grid grid-cols-2 gap-10 mb-14 shrink-0">
                    <div className="flex items-start gap-6 group">
                        <div className="w-16 h-16 bg-[#111] border border-[#d4af37]/30 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:border-[#d4af37] transition-colors">
                            <Hotel className="w-8 h-8 text-[#d4af37]" />
                        </div>
                        <div className="min-w-0 pt-1">
                            <div className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.3em] mb-2">Mekke Oteli</div>
                            <div className="text-3xl font-bold truncate leading-tight uppercase">{data.hotelMecca}</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-6 group">
                        <div className="w-16 h-16 bg-[#111] border border-[#d4af37]/30 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:border-[#d4af37] transition-colors">
                            <Hotel className="w-8 h-8 text-[#d4af37]" />
                        </div>
                        <div className="min-w-0 pt-1">
                            <div className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.3em] mb-2">Medine Oteli</div>
                            <div className="text-3xl font-bold truncate leading-tight uppercase">{data.hotelMedina}</div>
                        </div>
                    </div>
                </div>

                {/* ── FOOTER: Guide Info ── */}
                <div className="mt-auto pt-10 border-t border-white/5 flex items-center justify-between max-w-[750px]">
                    <div className="flex items-center gap-8">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-b from-[#d4af37] to-[#8a6d1d] rounded-[32px] p-1 shadow-2xl">
                                <div className="w-full h-full bg-[#050505] rounded-[28px] flex items-center justify-center overflow-hidden">
                                    <User className="w-12 h-12 text-[#d4af37]" />
                                </div>
                            </div>
                            {data.isIdentityVerified && (
                                <div className="absolute -top-2 -right-2 bg-[#d4af37] text-black p-1.5 rounded-full shadow-xl border-4 border-black">
                                    <ShieldCheck className="w-5 h-5 font-bold" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="text-[#d4af37] text-xs font-black uppercase tracking-[0.4em] mb-2">Profesyonel Rehber</div>
                            <div className="text-4xl font-black uppercase tracking-tight truncate mb-1">{data.guideName}</div>
                            <div className="flex items-center gap-3 text-2xl font-bold text-white/60">
                                <Phone className="w-5 h-5 text-[#d4af37]" />
                                <span className="tracking-tighter">{data.guidePhone}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Safe Zone Indicator (Hidden, for development visualization) */}
            {/* <div className="absolute bottom-10 right-10 w-[240px] h-[280px] border border-dashed border-red-500/20 pointer-events-none" /> */}

            <style jsx>{`
                @keyframes shimmer {
                    0% { background-position: -200% -200%; }
                    100% { background-position: 200% 200%; }
                }
            `}</style>
        </div>
    );
}
