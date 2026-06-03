import React from "react";
import { PosterData } from "../poster-generator/types";

export const Template19 = ({ data }: { data: PosterData }) => {
    return (
        <div className="w-[1080px] h-[1350px] bg-white text-[#0f172a] relative overflow-hidden pr-[280px] pb-[260px]">
            <div className="p-20 flex flex-col h-full">
                <div className="mb-4">
                    <div className="text-slate-400 font-bold tracking-[0.4em] text-xs mb-8 uppercase">UMREBULDUM</div>
                    <h1 className="text-[120px] font-black leading-[0.8] tracking-tighter text-[#0f172a] uppercase">
                        UMRE
                    </h1>
                </div>

                <div className="mt-8">
                    <p className="text-3xl text-slate-500 font-medium tracking-tight uppercase">
                        {data.title}
                    </p>
                    <div className="mt-8 h-1 w-20 bg-[#0f172a]" />
                </div>

                <div className="mt-20 space-y-12">
                    <div className="flex items-center gap-12">
                        <div className="text-right w-32 shrink-0">
                            <div className="text-sm text-slate-400 font-bold uppercase tracking-widest">Tarih</div>
                        </div>
                        <div className="text-5xl font-black uppercase">{data.date}</div>
                    </div>

                    <div className="flex items-center gap-12">
                        <div className="text-right w-32 shrink-0">
                            <div className="text-sm text-slate-400 font-bold uppercase tracking-widest">Fiyat</div>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <div className="text-7xl font-black">{data.price2Person}</div>
                            <div className="text-lg text-slate-400 font-bold uppercase tracking-widest">'dan başlayan</div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="flex items-center gap-12">
                        <div className="text-right w-32 shrink-0">
                            <div className="text-sm text-slate-400 font-bold uppercase tracking-widest">Rehber</div>
                        </div>
                        <div className="flex flex-col">
                            <div className="text-4xl font-black uppercase">{data.guideName}</div>
                            <div className="text-2xl font-bold text-slate-400 mt-1">{data.guidePhone}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
