import React from "react";
import { PosterData } from "../poster-generator/types";

export const Template17 = ({ data }: { data: PosterData }) => {
    return (
        <div className="w-[1080px] h-[1350px] relative bg-[#020617] text-white overflow-hidden font-sans pr-[280px] pb-[260px]">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617]" />

            {/* Gold Glow */}
            <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[#d4af37]/20 to-transparent" />

            {/* HEADER */}
            <div className="relative z-10 p-12">
                <div className="text-[#d4af37] tracking-[0.3em] text-sm mb-4">
                    UMREBULDUM
                </div>

                <h1 className="text-[96px] font-extrabold leading-none uppercase">
                    UMRE
                    <span className="block text-[#d4af37]">
                        YOLCULUĞU
                    </span>
                </h1>

                <p className="mt-6 text-2xl text-slate-300 italic">
                    {data.title}
                </p>
            </div>

            {/* URGENCY BADGE */}
            {data.urgencyText && (
                <div className="absolute top-12 right-[300px] bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg z-20">
                    {data.urgencyText}
                </div>
            )}

            {/* HOTEL */}
            <div className="relative z-10 px-12 mt-6 flex gap-6">
                <div className="flex-1 bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/5">
                    <div className="text-[#d4af37] text-xs mb-2 uppercase tracking-widest">
                        MEKKE OTELİ
                    </div>
                    <div className="text-2xl font-bold">
                        {data.hotelMecca}
                    </div>
                </div>

                <div className="flex-1 bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/5">
                    <div className="text-[#d4af37] text-xs mb-2 uppercase tracking-widest">
                        MEDİNE OTELİ
                    </div>
                    <div className="text-2xl font-bold">
                        {data.hotelMedina}
                    </div>
                </div>
            </div>

            {/* PRICING */}
            <div className="relative z-10 px-12 mt-10 flex gap-6 items-end">
                <div className="flex-1 bg-[#020617] border border-white/10 rounded-3xl p-6">
                    <div className="text-sm text-slate-400 mb-1">4 Kişilik</div>
                    <div className="text-4xl font-black">{data.price4Person}</div>
                </div>

                <div className="flex-1 bg-[#d4af37] text-black rounded-3xl p-8 scale-110 shadow-2xl z-20">
                    <div className="text-sm font-bold mb-1">3 Kişilik</div>
                    <div className="text-5xl font-black">{data.price3Person}</div>
                </div>

                <div className="flex-1 bg-[#020617] border border-white/10 rounded-3xl p-6">
                    <div className="text-sm text-slate-400 mb-1">2 Kişilik</div>
                    <div className="text-4xl font-black">{data.price2Person}</div>
                </div>
            </div>

            {/* DATE */}
            <div className="relative z-10 px-12 mt-16">
                <div className="text-[#d4af37] text-sm font-bold uppercase tracking-[0.4em] mb-2">Tur Tarihi</div>
                <div className="text-5xl font-black text-white">{data.date}</div>
            </div>

            {/* FOOTER */}
            <div className="absolute bottom-12 left-12 z-10">
                <div className="text-sm text-slate-400 uppercase tracking-widest mb-1">Tur Rehberi</div>
                <div className="text-3xl font-black uppercase tracking-tight">
                    {data.guideName}
                </div>
                <div className="text-2xl font-bold text-[#d4af37] mt-1">
                    {data.guidePhone}
                </div>
            </div>
        </div>
    );
};
