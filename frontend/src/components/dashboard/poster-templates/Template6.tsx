import React from 'react';
import { Phone, User, CheckCircle2, Hotel, ShieldCheck } from 'lucide-react';
import { PosterData } from '../poster-generator/types';
import { STOCK_BACKGROUNDS } from '@/components/dashboard/poster-generator/poster-assets';

export function Template6({ data, id }: { data: PosterData; id?: string }) {
    const bgImage = STOCK_BACKGROUNDS.find(b => b.id === data.backgroundImage)?.url || STOCK_BACKGROUNDS[0].url;

    return (
        <div
            id={id}
            className="w-[1080px] h-[1350px] relative overflow-hidden bg-white flex flex-col items-center text-center text-slate-900"
            style={{
                fontFamily: data.fontStyle === 'font-serif' ? 'Georgia, serif' : data.fontStyle === 'font-display' ? 'Impact, sans-serif' : 'Inter, sans-serif'
            }}
        >
            {/* === BACKGROUND LAYER === */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center grayscale opacity-[0.02]"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
            </div>

            {/* === CONTENT LAYER === */}
            <div className="relative z-10 flex flex-col h-full w-full px-32 py-32 items-center">
                
                {/* ── TOP: Brand ── */}
                <div className="mb-24 shrink-0">
                    <div className="text-slate-300 text-sm font-black tracking-[0.8em] uppercase">UMREBULDUM</div>
                </div>

                {/* ── HERO: Centered Typography ── */}
                <div className="mb-24 shrink-0 max-w-[800px]">
                    <h1 className="text-[110px] font-bold leading-none tracking-tighter text-slate-900 mb-10 uppercase">
                        {data.title}
                    </h1>
                    <div className="h-[2px] w-20 bg-[#d4af37]/40 mx-auto mb-10" />
                    <p className="text-2xl text-slate-400 font-medium tracking-[0.2em] uppercase italic">
                        {data.date}
                    </p>
                </div>

                {/* ── PRICE SECTION: Minimalist Vertical ── */}
                <div className="flex-1 flex flex-col justify-center gap-12 w-full max-w-[500px]">
                    {[
                        { label: "4 Kişilik Oda", price: data.price4Person },
                        { label: "3 Kişilik Oda", price: data.price3Person },
                        { label: "2 Kişilik Oda", price: data.price2Person }
                    ].map((tier, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                            <span className="text-[64px] font-bold text-slate-900 tracking-tighter leading-none mb-2">{tier.price}</span>
                            <span className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">{tier.label}</span>
                        </div>
                    ))}
                </div>

                {/* ── FOOTER: Centered Info ── */}
                <div className="mt-auto flex flex-col items-center w-full max-w-[650px] pr-24"> 
                    {/* pr-24 to push away from QR zone a bit more even if centered */}
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
                                <User className="w-12 h-12 text-slate-300" />
                                {data.isIdentityVerified && (
                                    <div className="absolute top-0 right-0 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-bold text-slate-900 tracking-tight mb-2 uppercase">{data.guideName}</span>
                            <div className="flex items-center gap-3 text-2xl font-medium text-slate-400 tracking-widest">
                                <Phone className="w-4 h-4 opacity-40" />
                                <span>{data.guidePhone}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
