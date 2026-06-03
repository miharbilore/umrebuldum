import React from "react";
import { PosterData } from "../poster-generator/types";
import { STOCK_BACKGROUNDS } from '@/components/dashboard/poster-generator/poster-assets';

export const Template20 = ({ data }: { data: PosterData }) => {
    const bgImage = STOCK_BACKGROUNDS.find(b => b.id === data.backgroundImage)?.url || STOCK_BACKGROUNDS[0].url;

    return (
        <div className="w-[1080px] h-[1350px] relative text-white overflow-hidden pr-[280px] pb-[260px]">
            {/* Background Image */}
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImage})` }}
            />
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-black/20" />

            {/* Content Container */}
            <div className="relative h-full flex flex-col p-16">
                <div className="mb-auto">
                    <div className="text-white/80 font-bold tracking-[0.5em] text-xs uppercase mb-4">UMREBULDUM</div>
                    <h1 className="text-[140px] font-black leading-[0.8] tracking-tighter uppercase drop-shadow-2xl">
                        KUTSAL<br/>
                        <span className="text-[#d4af37]">TOPRAKLAR</span>
                    </h1>
                </div>

                <div className="mt-auto">
                    <div className="max-w-[700px]">
                        <h2 className="text-5xl font-bold leading-tight uppercase mb-6 drop-shadow-lg">
                            {data.title}
                        </h2>
                        <div className="flex items-center gap-8 mb-10">
                            <div className="h-px w-20 bg-[#d4af37]" />
                            <div className="text-3xl font-black uppercase tracking-widest">{data.date}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-12 border-t border-white/20 pt-10">
                        <div className="flex flex-col">
                            <div className="text-xs text-white/50 font-bold uppercase tracking-widest mb-1">Başlangıç</div>
                            <div className="text-5xl font-black text-[#d4af37]">{data.price2Person}</div>
                        </div>
                        <div className="h-12 w-px bg-white/10" />
                        <div className="flex flex-col">
                            <div className="text-xs text-white/50 font-bold uppercase tracking-widest mb-1">Tur Rehberi</div>
                            <div className="text-3xl font-black uppercase tracking-tight">{data.guideName}</div>
                            <div className="text-xl font-bold text-white/60">{data.guidePhone}</div>
                        </div>
                    </div>
                </div>
            </div>

            {data.urgencyText && (
                <div className="absolute top-12 left-16 bg-[#d4af37] text-black px-8 py-3 rounded-full text-lg font-black shadow-2xl z-20 uppercase tracking-widest">
                    {data.urgencyText}
                </div>
            )}
        </div>
    );
};
