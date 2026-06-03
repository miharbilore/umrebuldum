import React from 'react';
import { Phone, User, CheckCircle2, Hotel, ShieldCheck } from 'lucide-react';
import { PosterData } from '../poster-generator/types';
import { STOCK_BACKGROUNDS } from '@/components/dashboard/poster-generator/poster-assets';

export function Template1({ data, id, showWatermark = true }: { data: PosterData; id?: string, showWatermark?: boolean }) {

    const bgImage = STOCK_BACKGROUNDS.find(b => b.id === data.backgroundImage)?.url || STOCK_BACKGROUNDS[0].url;

    return (
        <div
            id={id}
            className="w-[1080px] h-[1350px] relative overflow-hidden bg-[#020617] flex flex-col text-white"
            style={{
                fontFamily: data.fontStyle === 'font-serif' ? 'Georgia, serif' : data.fontStyle === 'font-display' ? 'Impact, sans-serif' : 'Inter, sans-serif'
            }}
        >
            {/* === BACKGROUND LAYER === */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
            </div>

            {/* Subtle Islamic geometric pattern */}
            <div
                className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l2.5 12.5L45 15l-12.5 2.5L30 30l-2.5-12.5L15 15l12.5-2.5z' fill='%23d4af37' fill-rule='evenodd'/%3E%3C/svg%3E")` }}
            />

            {/* === CONTENT LAYER === */}
            <div className="relative z-10 flex flex-col h-full px-16 pt-12 pb-14">

                {/* ── TOP: Brand ── */}
                <div className="flex flex-col items-center mb-8 shrink-0">
                    <div className="text-[#d4af37] text-xl font-bold tracking-[0.4em] uppercase mb-3 flex items-center gap-3">
                        <span className="h-[1px] w-10 bg-[#d4af37]/40" />
                        UmreBuldum
                        <span className="h-[1px] w-10 bg-[#d4af37]/40" />
                    </div>
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />
                </div>

                {/* ── HERO: Title ── */}
                <div className="text-center mb-10 shrink-0">
                    <div className="inline-flex items-center gap-2 px-5 py-1.5 border border-[#d4af37]/25 rounded-full bg-[#d4af37]/10 mb-4">
                        <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                        <span className="text-xs font-bold tracking-[0.2em] text-[#d4af37] uppercase">Güvenilir & Huzurlu Yolculuk</span>
                    </div>
                    {/* Clamped title: max 3 lines, responsive sizing */}
                    <h1 className="text-[76px] font-black leading-[0.95] tracking-tight uppercase text-white"
                        style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {data.title}
                    </h1>
                    <p className="text-xl text-slate-400 font-light tracking-[0.15em] italic uppercase mt-4">
                        Kutlu Topraklarda Buluşuyoruz • {data.date}
                    </p>
                </div>

                {/* ── HOTEL INFO: Mekke / Medine ── */}
                <div className="grid grid-cols-2 gap-8 mb-10 shrink-0">
                    <div className="relative bg-[#0f172a]/60 border border-white/5 p-6 rounded-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37]/60" />
                        <div className="flex items-center gap-5 pl-2">
                            <div className="w-14 h-14 bg-[#d4af37] rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(212,175,55,0.15)]">
                                <Hotel className="w-7 h-7 text-[#020617]" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] font-bold text-[#d4af37] uppercase tracking-[0.25em] mb-0.5">Mekke-i Mükerreme</div>
                                <div className="text-2xl font-black truncate">{data.hotelMecca}</div>
                            </div>
                        </div>
                    </div>
                    <div className="relative bg-[#0f172a]/60 border border-white/5 p-6 rounded-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37]/60" />
                        <div className="flex items-center gap-5 pl-2">
                            <div className="w-14 h-14 bg-[#d4af37] rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(212,175,55,0.15)]">
                                <Hotel className="w-7 h-7 text-[#020617]" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] font-bold text-[#d4af37] uppercase tracking-[0.25em] mb-0.5">Medine-i Münevvere</div>
                                <div className="text-2xl font-black truncate">{data.hotelMedina}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── PRICE SECTION ── */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center gap-5 mb-6 shrink-0">
                        <span className="text-base font-bold tracking-[0.25em] text-[#d4af37] uppercase">Konaklama Seçenekleri</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-[#d4af37]/25 to-transparent" />
                    </div>
                    <div className="grid grid-cols-3 gap-6 flex-1 min-h-0 max-w-[750px]">
                        {[
                            { label: "4 Kişilik Oda", price: data.price4Person },
                            { label: "3 Kişilik Oda", price: data.price3Person },
                            { label: "2 Kişilik Oda", price: data.price2Person }
                        ].map((tier, idx) => (
                            <div key={idx} className="relative flex flex-col bg-[#0a0f1e] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                                {/* Gold accent top stripe */}
                                <div className="h-1 w-full bg-gradient-to-r from-[#d4af37]/60 via-[#d4af37] to-[#d4af37]/60 shrink-0" />
                                <div className="p-7 flex flex-col flex-1">
                                    <div className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">{tier.label}</div>
                                    <div className="text-[44px] font-black text-white leading-none mb-4">{tier.price}</div>
                                    <div className="mt-auto space-y-2.5 pt-5 border-t border-white/5">
                                        <div className="flex items-center gap-2 text-sm text-slate-300">
                                            <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
                                            <span>Full Program</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-300">
                                            <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
                                            <span>Özel Transfer</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── FOOTER: Guide Info ── */}
                {/* QR Safe Zone Protection: pr-[300px] ensures no overlap with bottom-right QR */}
                <div className="mt-10 shrink-0 pr-[300px]">
                    <div className="h-px w-full bg-gradient-to-r from-[#d4af37]/30 via-white/5 to-transparent mb-6" />
                    <div className="flex items-center gap-6">
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#d4af37] to-[#b8860b] rounded-2xl p-[3px] shadow-xl">
                                <div className="w-full h-full bg-[#020617] rounded-[13px] flex items-center justify-center">
                                    <User className="w-10 h-10 text-[#d4af37]" />
                                </div>
                            </div>
                            {data.isIdentityVerified && (
                                <div className="absolute -top-2 -right-2 bg-emerald-500 text-[#020617] p-1 rounded-full shadow-lg border-2 border-[#020617]">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="text-[#d4af37] text-[11px] font-bold uppercase tracking-[0.3em] mb-0.5">Tur Rehberi</div>
                            <div className="text-3xl font-black uppercase tracking-tight truncate">{data.guideName}</div>
                            <div className="flex items-center gap-2 text-xl font-bold text-slate-400 mt-0.5">
                                <Phone className="w-4 h-4 text-[#d4af37] shrink-0" />
                                <span className="truncate">{data.guidePhone}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Watermark is handled globally by PosterBuilder — do not duplicate here */}
        </div>
    );
}
