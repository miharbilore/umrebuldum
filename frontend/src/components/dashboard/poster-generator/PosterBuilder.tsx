'use client';

import React, { useState, useRef } from 'react';
import { Eye, Settings, Palette } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// Templates & Config
import { POSTER_TEMPLATES } from '@/components/dashboard/poster-templates/registry';
import { Template1 } from '@/components/dashboard/poster-templates/Template1';
import { Template2 } from '@/components/dashboard/poster-templates/Template2';
import { Template3 } from '@/components/dashboard/poster-templates/Template3';
import { Template4 } from '@/components/dashboard/poster-templates/Template4';
import { Template5 } from '@/components/dashboard/poster-templates/Template5';
import { Template6 } from '@/components/dashboard/poster-templates/Template6';
import { Template7 } from '@/components/dashboard/poster-templates/Template7';
import { Template8 } from '@/components/dashboard/poster-templates/Template8';
import { Template9 } from '@/components/dashboard/poster-templates/Template9';
import { Template10 } from '@/components/dashboard/poster-templates/Template10';
import { Template11 } from '@/components/dashboard/poster-templates/Template11';
import { Template12 } from '@/components/dashboard/poster-templates/Template12';
import { Template13 } from '@/components/dashboard/poster-templates/Template13';
import { Template14 } from '@/components/dashboard/poster-templates/Template14';
import { Template15 } from '@/components/dashboard/poster-templates/Template15';
import { Template16 } from '@/components/dashboard/poster-templates/Template16';
import { Template17 } from '@/components/dashboard/poster-templates/Template17';
import { Template18 } from '@/components/dashboard/poster-templates/Template18';
import { Template19 } from '@/components/dashboard/poster-templates/Template19';
import { Template20 } from '@/components/dashboard/poster-templates/Template20';
import { Template21 } from '@/components/dashboard/poster-templates/Template21';
import { Template22 } from '@/components/dashboard/poster-templates/Template22';
import { PackageLimits } from '@/lib/package-system';
import { PosterData } from './types';

interface TemplateProps {
    data: PosterData;
    id?: string;
    showWatermark?: boolean;
}

const TEMPLATE_COMPONENTS: Record<string, React.FC<TemplateProps>> = {
    'tpl-01-classic': Template1,
    'tpl-02-modern': Template2,
    'tpl-03-elegant': Template3,
    'tpl-04-premium': Template4,
    'tpl-05-luxury': Template5,
    'tpl-06-emerald': Template6,
    'tpl-07-rose': Template7,
    'tpl-08-indigo': Template8,
    'tpl-09-vibrant': Template9,
    'tpl-10-darkmatic': Template10,
    'tpl-11-card': Template11,
    'tpl-12-softcard': Template12,
    'tpl-13-pricecard': Template13,
    'tpl-14-guide': Template14,
    'tpl-15-guideside': Template15,
    'tpl-16-guidepremium': Template16,
    'tpl-17-ultra': Template17,
    'tpl-18-gold': Template18,
    'tpl-19-minimal': Template19,
    'tpl-20-photo': Template20,
    'tpl-21-card': Template21,
    'tpl-22-guide': Template22,
};

// Hooks & Sub-components
import { usePosterScale } from './usePosterScale';
import { usePosterExport } from './usePosterExport';
import { PosterSettingsForm } from './PosterSettingsForm';
import { PosterTemplateGrid } from './PosterTemplateGrid';
import { PosterActionButtons } from './PosterActionButtons';

const PACKAGE_RANK: Record<string, number> = {
    "FREEMIUM": 0,
    "PREMIUM": 1,
    "PRO": 2,
    "BUSINESS": 3,
};

interface PosterBuilderProps {
    packageType: string;
    limits: PackageLimits;
    initialData?: Partial<PosterData>;
}

export function PosterBuilder({ packageType, limits, initialData }: PosterBuilderProps) {
    const previewRef = useRef<HTMLDivElement>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState(POSTER_TEMPLATES[0].id);
    const [mobileTab, setMobileTab] = useState<'preview' | 'settings' | 'templates'>('preview');

    const [data, setData] = useState<PosterData>({
        title: initialData?.title || "UMREYE GİDİYORUZ",
        price4Person: "$1199",
        price3Person: "$1550",
        price2Person: "$1850",
        date: initialData?.date || new Date().toLocaleDateString('tr-TR'),
        guideName: initialData?.guideName || "Abdullah Ademoğlu",
        guidePhone: initialData?.guidePhone || "+123-456-7890",
        isIdentityVerified: false,
        backgroundImage: "bg-kabe-1",
        frameStyle: "frame-classic",
        fontStyle: "font-sans",
        hotelMecca: "Mekke Otel",
        hotelMedina: "Medine Otel",
        guideImage: initialData?.guideImage || "",
        urgencyText: initialData?.urgencyText || ""
    });

    const { previewScale, CANVAS_W, CANVAS_H } = usePosterScale(previewContainerRef, mobileTab);
    const { generating, handleShare, handleDownload } = usePosterExport(previewRef, limits, data, selectedTemplateId);

    const userRank = PACKAGE_RANK[packageType] ?? 0;

    const isTemplateLocked = (tplId: string, requiredTier: string) => {
        if (packageType === "FREEMIUM" && tplId !== "tpl-01-classic") return true;
        const requiredRank = PACKAGE_RANK[requiredTier] ?? 0;
        return userRank < requiredRank;
    };

    const SelectedTemplateComponent = TEMPLATE_COMPONENTS[selectedTemplateId];
    const currentTpl = POSTER_TEMPLATES.find(t => t.id === selectedTemplateId);
    const isLocked = isTemplateLocked(selectedTemplateId, currentTpl?.requiredTier || "PRO");

    const renderPosterCanvas = (
        <div ref={previewContainerRef} className="w-full h-full flex items-center justify-center">
            <div className="transition-transform duration-300 ease-in-out"
                style={{
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'center center',
                    width: CANVAS_W,
                    height: CANVAS_H,
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}>
                <div ref={previewRef} className="relative bg-white" style={{ width: CANVAS_W, height: CANVAS_H }}>
                    {SelectedTemplateComponent && (
                        <SelectedTemplateComponent
                            data={data}
                            id="poster-template-root"
                            showWatermark={packageType === "FREEMIUM" ? true : limits.watermark}
                        />
                    )}

                    <div className="absolute bottom-10 right-10 z-[30] flex flex-col items-center">
                        <div className="bg-[#020617]/95 backdrop-blur-xl p-6 rounded-[28px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border border-[#d4af37]/50 flex flex-col items-center group transition-all duration-500 hover:scale-[1.02]">
                            <div className="text-[11px] font-black text-[#d4af37] mb-3.5 tracking-[0.3em] uppercase opacity-90">UmreBuldum</div>
                            
                            <div className="relative p-3.5 bg-[#f9f7f2] rounded-2xl shadow-inner border border-white/20">
                                <QRCodeSVG
                                    value={`https://umrebuldum.com/guide/${data.guideName.toLowerCase().replace(/\s+/g, '-')}`}
                                    size={115}
                                    level="H"
                                    includeMargin={false}
                                    fgColor="#020617"
                                    bgColor="#ffffff"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-7 h-7 bg-white rounded-full p-[1.5px] shadow-lg border border-slate-100/50 flex items-center justify-center">
                                        <div className="w-full h-full bg-[#020617] rounded-full flex items-center justify-center text-[9px] font-black text-[#d4af37]">UB</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 flex flex-col items-center w-full">
                                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent mb-3" />
                                <div className="text-[10px] font-bold text-slate-200 uppercase tracking-[0.1em] text-center leading-tight">
                                    Fiyat ve detaylar için<br/>
                                    <span className="text-[#d4af37] text-[11px] font-black mt-1 inline-block">Hemen Tara</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {packageType === "FREEMIUM" && (
                        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden opacity-[0.04] select-none flex flex-wrap content-around justify-around">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <div key={i} className="text-4xl font-black text-slate-900 -rotate-45 p-12 whitespace-nowrap">
                                    UMREBULDUM
                                </div>
                            ))}
                        </div>
                    )}
                    {data.frameStyle !== 'frame-none' && (
                        <div className={`absolute inset-0 pointer-events-none z-40 ${data.frameStyle === 'frame-modern' ? 'border-[24px] border-white m-8 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]' :
                            data.frameStyle === 'frame-gold' ? 'border-[16px] border-double border-[#d4af37] m-8 rounded-[40px] opacity-80' :
                                data.frameStyle === 'frame-classic' ? 'border-[32px] border-[#1a1814]/5 m-6 mix-blend-multiply' : ''
                            }`} />
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="hidden lg:flex h-[85vh] border rounded-2xl overflow-hidden shadow-xl bg-white">
                <div className="w-[350px] border-r flex flex-col h-full bg-slate-50 flex-shrink-0">
                    <div className="p-6 border-b bg-white">
                        <h2 className="text-xl font-bold text-slate-900">Afiş Düzenleyici</h2>
                        <p className="text-sm text-slate-500 mt-1">İçeriği ve tasarımı kişiselleştirin.</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        <PosterSettingsForm data={data} setData={setData} />
                    </div>
                </div>

                <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-4 left-4 bg-slate-800/80 backdrop-blur text-slate-300 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border border-slate-700 flex items-center gap-2 z-50">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Canlı Önizleme
                    </div>
                    {renderPosterCanvas}
                </div>

                <div className="w-[350px] border-l flex flex-col h-full bg-slate-50 flex-shrink-0">
                    <div className="p-6 border-b bg-white">
                        <h2 className="text-xl font-bold text-slate-900">Şablonlar & Aktarım</h2>
                        <p className="text-sm text-slate-500 mt-1">Tasarımınızı seçin ve dışa aktarın.</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        <PosterTemplateGrid selectedTemplateId={selectedTemplateId} setSelectedTemplateId={setSelectedTemplateId} isTemplateLocked={isTemplateLocked} />
                    </div>
                    <div className="p-4 border-t bg-white">
                        <PosterActionButtons handleDownload={handleDownload} handleShare={handleShare} generating={generating} limits={limits} isLocked={isLocked} currentTpl={currentTpl} />
                    </div>
                </div>
            </div>

            <div className="lg:hidden flex flex-col h-[calc(100dvh-120px)] bg-white border rounded-2xl overflow-hidden shadow-xl">
                <div className="flex border-b bg-slate-50 shrink-0">
                    {([
                        { key: 'preview' as const, icon: Eye, label: 'Önizleme' },
                        { key: 'templates' as const, icon: Palette, label: 'Şablonlar' },
                        { key: 'settings' as const, icon: Settings, label: 'Düzenle' },
                    ]).map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setMobileTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${mobileTab === tab.key
                                ? 'text-primary border-b-2 border-primary bg-white'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {mobileTab === 'preview' && (
                        <div className="h-full bg-slate-900 flex flex-col">
                            <div className="flex-1 overflow-hidden">
                                {renderPosterCanvas}
                            </div>
                        </div>
                    )}

                    {mobileTab === 'templates' && (
                        <div className="h-full overflow-y-auto p-4">
                            <PosterTemplateGrid selectedTemplateId={selectedTemplateId} setSelectedTemplateId={setSelectedTemplateId} isTemplateLocked={isTemplateLocked} />
                        </div>
                    )}

                    {mobileTab === 'settings' && (
                        <div className="h-full overflow-y-auto p-4">
                            <PosterSettingsForm data={data} setData={setData} />
                        </div>
                    )}
                </div>

                <div className="p-3 border-t bg-white shrink-0">
                    <PosterActionButtons handleDownload={handleDownload} handleShare={handleShare} generating={generating} limits={limits} isLocked={isLocked} currentTpl={currentTpl} />
                </div>
            </div>
        </>
    );
}
