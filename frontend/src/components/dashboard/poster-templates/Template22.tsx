import React from "react";
import { PosterData } from "../poster-generator/types";
import { User, Phone, ShieldCheck, MapPin, Calendar } from 'lucide-react';

const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
};

export const Template22 = ({ data }: { data: PosterData }) => {
    return (
        <div className="w-[1080px] h-[1350px] bg-slate-50 text-black relative overflow-hidden pr-[280px] pb-[260px]">
            {/* Soft background accents */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-[#d4af37]/5 skew-y-[-6deg] -translate-y-32" />
            
            <div className="relative h-full flex flex-col p-20">
                {/* Brand Header */}
                <div className="flex items-center justify-between mb-24">
                    <div className="text-slate-300 font-black tracking-[0.5em] text-xs uppercase">UMREBULDUM</div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
                        <ShieldCheck className="w-4 h-4" />
                        Onaylı Rehber
                    </div>
                </div>

                <div className="flex flex-col items-center text-center mb-24">
                    <div className="relative mb-10">
                        <div className="w-64 h-64 rounded-[80px] bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] flex items-center justify-center border border-slate-100 overflow-hidden relative">
                            {data.guideImage ? (
                                <img src={data.guideImage} alt={data.guideName} crossOrigin="anonymous" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-[#d4af37] text-[100px] font-black opacity-20 select-none">
                                    {getInitials(data.guideName)}
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-3xl shadow-xl border border-slate-100">
                            <User className="w-10 h-10 text-[#d4af37]" />
                        </div>
                    </div>

                    <h2 className="text-[64px] font-black text-slate-900 leading-tight uppercase tracking-tighter mb-4">
                        {data.guideName}
                    </h2>

                    <div className="flex items-center gap-6 text-3xl font-bold text-slate-400 italic">
                        <div className="flex items-center gap-2">
                            <Phone className="w-6 h-6 text-[#d4af37]" />
                            <span>{data.guidePhone}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[50px] p-16 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-100 relative">
                    <div className="absolute -top-8 left-16 bg-[#d4af37] text-black px-8 py-3 rounded-2xl font-black text-xl uppercase tracking-widest shadow-xl">
                        TUR DETAYI
                    </div>

                    <div className="space-y-10">
                        <div>
                            <h3 className="text-5xl font-black text-slate-900 leading-none uppercase tracking-tight mb-4">
                                {data.title}
                            </h3>
                            <div className="flex items-center gap-4 text-slate-400 font-bold uppercase tracking-widest text-lg">
                                <Calendar className="w-6 h-6" />
                                <span>{data.date}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-12 pt-10 border-t border-slate-100">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[#d4af37] font-black text-xs uppercase tracking-[0.2em]">
                                    <MapPin className="w-4 h-4" />
                                    Konaklama
                                </div>
                                <div className="text-2xl font-bold text-slate-700 leading-tight">
                                    {data.hotelMecca} <br/> {data.hotelMedina}
                                </div>
                            </div>
                            <div className="space-y-2 text-right">
                                <div className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Fiyat (En Düşük)</div>
                                <div className="text-6xl font-black text-slate-900 tracking-tighter">{data.price4Person}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {data.urgencyText && (
                <div className="absolute top-32 right-16 bg-red-500 text-white px-8 py-3 rounded-full text-lg font-black shadow-2xl z-20 uppercase tracking-widest rotate-12">
                    {data.urgencyText}
                </div>
            )}
        </div>
    );
};
