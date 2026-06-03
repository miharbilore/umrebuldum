import React from "react";
import { PosterData } from "../poster-generator/types";

export const Template18 = ({ data }: { data: PosterData }) => {
    return (
        <div className="w-[1080px] h-[1350px] relative bg-[#020617] text-white overflow-hidden pr-[280px] pb-[260px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-black" />
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#d4af37]/20 to-transparent" />

            <div className="relative z-10 p-12">
                <div className="text-[#d4af37] tracking-[0.3em] text-sm mb-6 uppercase">
                    UMREBULDUM
                </div>

                <h1 className="text-[96px] font-extrabold leading-none uppercase">
                    UMRE
                    <span className="block text-[#d4af37]">YOLCULUĞU</span>
                </h1>

                <p className="mt-4 text-slate-300 italic text-2xl">
                    {data.title}
                </p>
                <p className="mt-2 text-[#d4af37] font-bold text-3xl">
                    {data.date}
                </p>
            </div>

            {data.urgencyText && (
                <div className="absolute top-12 right-[300px] bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg z-20">
                    {data.urgencyText}
                </div>
            )}

            <div className="relative z-10 px-12 mt-10 flex gap-6 items-center">
                <div className="flex-1 bg-white/5 backdrop-blur p-6 rounded-3xl border border-white/5">
                    <div className="text-sm text-slate-400 uppercase">4 Kişilik</div>
                    <div className="text-4xl font-bold mt-2 tracking-tighter">{data.price4Person}</div>
                </div>

                <div className="flex-1 bg-[#d4af37] text-black p-8 rounded-3xl scale-110 shadow-2xl">
                    <div className="text-sm font-bold uppercase">3 Kişilik</div>
                    <div className="text-5xl font-black mt-2 tracking-tighter">{data.price3Person}</div>
                </div>

                <div className="flex-1 bg-white/5 backdrop-blur p-6 rounded-3xl border border-white/5">
                    <div className="text-sm text-slate-400 uppercase">2 Kişilik</div>
                    <div className="text-4xl font-bold mt-2 tracking-tighter">{data.price2Person}</div>
                </div>
            </div>

            <div className="absolute bottom-12 left-12 z-10">
                <div className="text-sm text-slate-400 uppercase tracking-widest mb-1">Tur Rehberi</div>
                <div className="text-3xl font-black uppercase tracking-tight">{data.guideName}</div>
                <div className="text-2xl font-bold text-[#d4af37] mt-1">{data.guidePhone}</div>
            </div>
        </div>
    );
};
