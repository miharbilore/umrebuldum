import React from "react";
import { PosterData } from "../poster-generator/types";

export const Template21 = ({ data }: { data: PosterData }) => {
    return (
        <div className="w-[1080px] h-[1350px] bg-slate-900 text-white relative overflow-hidden pr-[280px] pb-[260px]">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full -mr-32 -mt-32 blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full -ml-32 -mb-32 blur-[100px]" />

            <div className="relative h-full flex flex-col p-16">
                <div className="mb-12">
                    <div className="text-[#d4af37] font-black tracking-[0.5em] text-xs uppercase mb-6">UMREBULDUM</div>
                    <h1 className="text-[100px] font-black leading-[0.9] tracking-tighter uppercase mb-6">
                        TUR<br/>
                        <span className="text-[#d4af37]">DETAYLARI</span>
                    </h1>
                    <p className="text-3xl text-slate-400 font-medium tracking-tight uppercase max-w-[600px]">
                        {data.title}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 w-full max-w-[650px]">
                    <div className="bg-slate-800/50 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 shadow-2xl group transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">4 Kişilik Oda</div>
                                <div className="text-6xl font-black text-white tracking-tighter">{data.price4Person}</div>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                                <div className="text-2xl font-bold text-[#d4af37]">04</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#d4af37] p-12 rounded-[40px] shadow-[0_40px_80px_-20px_rgba(212,175,55,0.3)] scale-[1.02] relative">
                        <div className="absolute top-6 right-8 text-black/10 text-8xl font-black italic">TOP</div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex flex-col">
                                <div className="text-xs text-black/60 font-bold uppercase tracking-widest mb-2">3 Kişilik Oda</div>
                                <div className="text-7xl font-black text-black tracking-tighter">{data.price3Person}</div>
                            </div>
                            <div className="w-20 h-20 rounded-2xl bg-black/10 flex items-center justify-center">
                                <div className="text-3xl font-black text-black">03</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">2 Kişilik Oda</div>
                                <div className="text-6xl font-black text-white tracking-tighter">{data.price2Person}</div>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                                <div className="text-2xl font-bold text-[#d4af37]">02</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-12 flex items-center justify-between border-t border-white/5">
                    <div className="flex flex-col">
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Tur Rehberi</div>
                        <div className="text-4xl font-black uppercase tracking-tight">{data.guideName}</div>
                        <div className="text-2xl font-bold text-[#d4af37] mt-1">{data.guidePhone}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Tarih</div>
                        <div className="text-4xl font-black text-white">{data.date}</div>
                    </div>
                </div>
            </div>

            {data.urgencyText && (
                <div className="absolute top-12 right-[300px] bg-white text-black px-6 py-2 rounded-xl text-sm font-black shadow-2xl z-20 uppercase tracking-widest">
                    {data.urgencyText}
                </div>
            )}
        </div>
    );
};
