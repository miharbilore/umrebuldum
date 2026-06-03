'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Lock, Share2, Star, Eye, Settings, Palette } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { QRCodeCanvas } from 'qrcode.react';

// Templates
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
import { STOCK_BACKGROUNDS, FRAME_STYLES, FONT_STYLES } from '@/components/dashboard/poster-generator/poster-assets';
import { PosterData } from './types';

// ── Template props contract (eliminates `any`) ──
interface TemplateProps {
    data: PosterData;
    id?: string;
    showWatermark?: boolean;
}

// Map registry IDs to actual react components
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

// Map package ranks to determine access
const PACKAGE_RANK: Record<string, number> = {
    "FREEMIUM": 0,
    "PREMIUM": 1,
    "PRO": 2,
    "BUSINESS": 3,
};

// ── Canvas constants (single source of truth) ──
const CANVAS_W = 1080;
const CANVAS_H = 1350;

interface PosterBuilderProps {
    packageType: string;
    limits: PackageLimits;
    initialData?: Partial<PosterData>;
}

export function PosterBuilder({ packageType, limits, initialData }: PosterBuilderProps) {
    const previewRef = useRef<HTMLDivElement>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const [generating, setGenerating] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState(POSTER_TEMPLATES[0].id);
    const [mobileTab, setMobileTab] = useState<'preview' | 'settings' | 'templates'>('preview');
    const [previewScale, setPreviewScale] = useState(0.4);

    // Initial State Setup
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

    // ── Dynamic scale calculation ──
    const calcScale = useCallback(() => {
        if (!previewContainerRef.current) return;
        const rect = previewContainerRef.current.getBoundingClientRect();
        
        // Prevent calculating tiny scale if container isn't fully rendered yet
        if (rect.width < 100 || rect.height < 100) return;

        const padX = 32, padY = 32; // Minimal safe padding to maximize size
        const scaleX = (rect.width - padX) / CANVAS_W;
        const scaleY = (rect.height - padY) / CANVAS_H;
        const calculatedScale = Math.min(scaleX, scaleY);
        const isDesktop = window.innerWidth >= 1024;
        const maxScale = isDesktop ? 1 : 0.6;
        setPreviewScale(Math.max(0.1, Math.min(calculatedScale, maxScale)));
    }, []);

    useEffect(() => {
        const container = previewContainerRef.current;
        if (!container) return;

        // Use ResizeObserver to reliably catch layout changes and flexbox expansions
        const observer = new ResizeObserver(() => {
            calcScale();
        });

        observer.observe(container);
        
        // Initial call
        calcScale();

        return () => {
            observer.disconnect();
        };
    }, [calcScale, mobileTab]);

    // Permission Checking Logic
    const userRank = PACKAGE_RANK[packageType] ?? 0;

    const isTemplateLocked = (tplId: string, requiredTier: string) => {
        // Rule 1: FREEMIUM can only use tpl-01-classic
        if (packageType === "FREEMIUM" && tplId !== "tpl-01-classic") return true;

        const requiredRank = PACKAGE_RANK[requiredTier] ?? 0;
        return userRank < requiredRank;
    };

    const handleShare = async () => {
        if (!previewRef.current) return;
        try {
            const blob = await htmlToImage.toBlob(previewRef.current, { pixelRatio: 2 });
            if (!blob) throw new Error("Could not generate image blob");
            const file = new File([blob], 'umre-afis.png', { type: 'image/png' });

            const shareLink = `https://umrebuldum.com/guide/${data.guideName.toLowerCase().replace(/\s+/g, '-')}`;
            const shareText = `🕋 Umre yolculuğumuz için kontenjanlar hızla doluyor. Detaylar afişte! ⏳\n\nHemen inceleyin: ${shareLink}`;

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Umre Yolculuğu',
                    text: shareText,
                });
            } else {
                // Fallback to WhatsApp
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
                window.open(whatsappUrl, '_blank');
            }
        } catch (err) {
            console.error("Share failed", err);
        }
    };

    const handleDownload = async () => {
        if (!previewRef.current) return;
        setGenerating(true);

        // Quality Configuration based on package limits
        let scale = 1;
        if (limits.posterQuality === "NORMAL") scale = 2;
        if (limits.posterQuality === "HIGH") scale = 3;

        try {
            // Wait for any fonts/images to load (increased delay for reliability)
            await new Promise(r => setTimeout(r, 800));

            // Use html-to-image to bypass modern CSS unsupported issues
            // Added cacheBust and better error reporting
            const options = {
                pixelRatio: scale,
                backgroundColor: '#ffffff', // Ensure solid background
                cacheBust: true,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left',
                },
            };

            const blob = await htmlToImage.toBlob(previewRef.current, options);
            
            if (!blob) {
                throw new Error("Blob generation returned null. Possible memory issue or tainted canvas.");
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `umre-afis-${selectedTemplateId}-${Date.now()}.png`;
            link.href = url;
            link.click();
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (err: any) {
            console.error("Image export failed detail:", {
                message: err?.message,
                stack: err?.stack,
                error: err
            });
            alert("Afiş oluşturulurken bir hata oluştu. \n\nİpucu: Eğer rehber fotoğrafı eklediyseniz, fotoğrafın yüklendiğinden veya geçerli bir formatta olduğundan emin olun.");
        } finally {
            setGenerating(false);
        }
    };

    const SelectedTemplateComponent = TEMPLATE_COMPONENTS[selectedTemplateId];

    // ── Derived state ──
    const currentTpl = POSTER_TEMPLATES.find(t => t.id === selectedTemplateId);
    const isLocked = isTemplateLocked(selectedTemplateId, currentTpl?.requiredTier || "PRO");

    // ── Shared sub-components as JSX elements to prevent unmounts ──
    const renderTemplateGrid = (
        <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700">Şablon Seçimi</Label>
            <div className="grid grid-cols-2 gap-3 max-h-[400px] lg:max-h-[300px] overflow-y-auto pr-2 pb-2">
                {POSTER_TEMPLATES.map((tpl) => {
                    const locked = isTemplateLocked(tpl.id, tpl.requiredTier);
                    const active = selectedTemplateId === tpl.id;
                    return (
                        <button
                            key={tpl.id}
                            onClick={() => !locked && setSelectedTemplateId(tpl.id)}
                            className={`relative group rounded-xl border-2 overflow-hidden aspect-[4/5] transition-all duration-300 text-left flex flex-col ${
                                active ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-sm'
                            } ${locked ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] hover:shadow-lg'}`}
                        >
                            {locked && (
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center gap-2">
                                    <div className="p-3 bg-white/10 rounded-full border border-white/20 shadow-2xl">
                                        <Lock className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-tighter bg-slate-950/40 px-2 py-0.5 rounded-full">Kilitli</span>
                                </div>
                            )}
                            <div className={`flex-1 bg-slate-100 flex items-center justify-center p-2 relative transition-all duration-500 ${locked ? 'grayscale contrast-75' : ''}`}>
                                <div className="text-xs text-slate-400 font-mono absolute top-2 left-2">{tpl.id.split('-')[1]}</div>
                                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 rounded shadow-sm"></div>
                            </div>
                            <div className="p-2 bg-white">
                                <div className="text-xs font-semibold truncate pr-4">{tpl.name}</div>
                                {locked && (
                                    <div className="absolute bottom-2 right-2 text-red-500" title={`Requires ${tpl.requiredTier}`}>
                                        <Lock className="w-3 h-3" />
                                    </div>
                                )}
                                {active && !locked && (
                                    <div className="absolute bottom-2 right-2 text-primary">
                                        <Star className="w-3 h-3 fill-current" />
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const renderSettingsForm = (
        <div className="space-y-4">
            <Label className="text-sm font-bold text-slate-700">İçerik Düzenleme</Label>
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Arka Plan</Label>
                        <select className="w-full text-sm border rounded p-2" value={data.backgroundImage} onChange={e => setData({ ...data, backgroundImage: e.target.value })}>
                            {STOCK_BACKGROUNDS.map(bg => <option key={bg.id} value={bg.id}>{bg.label}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Çerçeve Stili</Label>
                        <select className="w-full text-sm border rounded p-2" value={data.frameStyle} onChange={e => setData({ ...data, frameStyle: e.target.value })}>
                            {FRAME_STYLES.map(fs => <option key={fs.id} value={fs.id}>{fs.label}</option>)}
                        </select>
                    </div>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Yazı Tipi</Label>
                    <select className="w-full text-sm border rounded p-2" value={data.fontStyle} onChange={e => setData({ ...data, fontStyle: e.target.value })}>
                        {FONT_STYLES.map(fs => <option key={fs.id} value={fs.id}>{fs.label}</option>)}
                    </select>
                </div>

                <hr className="my-2" />

                <div>
                    <Label className="text-xs text-slate-500 font-bold">Tur Detayları</Label>
                    <Input className="mt-1" placeholder="Tur Başlığı" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <Label className="text-xs text-slate-500 font-bold">Aciliyet Rozeti (Opsiyonel)</Label>
                        <Input className="mt-1 border-red-200 focus:border-red-500" placeholder="Örn: SON 3 KOLTUK veya ERKEN REZERVASYON" value={data.urgencyText} onChange={e => setData({ ...data, urgencyText: e.target.value })} />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <Label className="text-xs text-slate-500">4 Kişilik Oda</Label>
                        <Input value={data.price4Person} onChange={e => setData({ ...data, price4Person: e.target.value })} />
                    </div>
                    <div>
                        <Label className="text-xs text-slate-500">3 Kişilik Oda</Label>
                        <Input value={data.price3Person} onChange={e => setData({ ...data, price3Person: e.target.value })} />
                    </div>
                    <div>
                        <Label className="text-xs text-slate-500">2 Kişilik Oda</Label>
                        <Input value={data.price2Person} onChange={e => setData({ ...data, price2Person: e.target.value })} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-xs text-slate-500">Mekke Otel</Label>
                        <Input value={data.hotelMecca} onChange={e => setData({ ...data, hotelMecca: e.target.value })} />
                    </div>
                    <div>
                        <Label className="text-xs text-slate-500">Medine Otel</Label>
                        <Input value={data.hotelMedina} onChange={e => setData({ ...data, hotelMedina: e.target.value })} />
                    </div>
                </div>

                <hr className="my-2" />

                <div>
                    <Label className="text-xs text-slate-500 font-bold">Rehber ve İletişim</Label>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                        <Input placeholder="Ad Soyad" value={data.guideName} onChange={e => setData({ ...data, guideName: e.target.value })} />
                        <Input placeholder="Telefon" value={data.guidePhone} onChange={e => setData({ ...data, guidePhone: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2 mt-3 p-3 bg-slate-50 rounded-lg border">
                        <input
                            type="checkbox"
                            id="identityVerifiedToggle"
                            className="w-4 h-4 cursor-pointer"
                            checked={data.isIdentityVerified}
                            onChange={e => setData({ ...data, isIdentityVerified: e.target.checked })}
                        />
                        <Label htmlFor="identityVerifiedToggle" className="text-sm cursor-pointer select-none">Kimlik Onaylı Rehber Rozeti Ekle</Label>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderActionButtons = (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <Button
                    onClick={handleDownload}
                    disabled={generating || !limits.canCreatePoster || isLocked}
                    className="h-12 text-sm shadow-lg"
                    size="lg"
                >
                    {generating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : (isLocked || !limits.canCreatePoster ? <Lock className="w-5 h-5 mr-2" /> : <Download className="w-5 h-5 mr-2" />)}
                    {isLocked || !limits.canCreatePoster ? "Kilitli" : `İndir`}
                </Button>
                <Button
                    variant="outline"
                    onClick={handleShare}
                    disabled={generating || !limits.canCreatePoster || isLocked}
                    className="h-12 text-sm border-2"
                    size="lg"
                >
                    <Share2 className="w-5 h-5 mr-2 text-primary" />
                    Paylaş
                </Button>
            </div>
            {!limits.canCreatePoster && (
                <div className="text-center text-xs text-red-600 mt-2 font-medium">
                    Mevcut (Ücretsiz) paketiniz afiş oluşturmaya izin vermiyor.
                </div>
            )}
            {limits.canCreatePoster && isLocked && (
                <div className="text-center text-xs text-amber-600 mt-2 font-medium">
                    Bu tasarımı kullanabilmek için en az <strong>{currentTpl?.requiredTier}</strong> paketi gereklidir.
                </div>
            )}
            {limits.canCreatePoster && !isLocked && limits.watermark && (
                <div className="text-center text-xs text-amber-600 mt-2 font-medium">
                    Ücretsiz/Başlangıç paketlerinde filigran eklenir. Premium&apos;da filigran kalkar.
                </div>
            )}
        </div>
    );

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
                {/* The actual Render Container used by html-to-image */}
                <div ref={previewRef} className="relative bg-white" style={{ width: CANVAS_W, height: CANVAS_H }}>
                    {SelectedTemplateComponent && (
                        <SelectedTemplateComponent
                            data={data}
                            id="poster-template-root"
                            showWatermark={packageType === "FREEMIUM" ? true : limits.watermark}
                        />
                    )}

                    {/* Branded QR Code Card (Premium Luxury Layout) */}
                    <div className="absolute bottom-10 right-10 z-[30] flex flex-col items-center">
                        <div className="bg-[#020617]/95 backdrop-blur-xl p-6 rounded-[28px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border border-[#d4af37]/50 flex flex-col items-center group transition-all duration-500 hover:scale-[1.02]">
                            <div className="text-[11px] font-black text-[#d4af37] mb-3.5 tracking-[0.3em] uppercase opacity-90">UmreBuldum</div>
                            
                            <div className="relative p-3.5 bg-[#f9f7f2] rounded-2xl shadow-inner border border-white/20">
                                <QRCodeCanvas
                                    value={`https://umrebuldum.com/guide/${data.guideName.toLowerCase().replace(/\s+/g, '-')}`}
                                    size={115}
                                    level="H"
                                    includeMargin={false}
                                    fgColor="#020617"
                                    bgColor="#ffffff"
                                />
                                
                                {/* Center Branded Monogram */}
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

                    {/* FREEMIUM Watermark (Professional Repeating Pattern) */}
                    {packageType === "FREEMIUM" && (
                        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden opacity-[0.04] select-none flex flex-wrap content-around justify-around">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <div key={i} className="text-4xl font-black text-slate-900 -rotate-45 p-12 whitespace-nowrap">
                                    UMREBULDUM
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Global Frame Overlay */}
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
            {/* ═══════════════ DESKTOP LAYOUT ═══════════════ */}
            <div className="hidden lg:flex h-[85vh] border rounded-2xl overflow-hidden shadow-xl bg-white">
                {/* Left Sidebar - Settings */}
                <div className="w-[350px] border-r flex flex-col h-full bg-slate-50 flex-shrink-0">
                    <div className="p-6 border-b bg-white">
                        <h2 className="text-xl font-bold text-slate-900">Afiş Düzenleyici</h2>
                        <p className="text-sm text-slate-500 mt-1">İçeriği ve tasarımı kişiselleştirin.</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {renderSettingsForm}
                    </div>
                </div>

                {/* Center - Preview */}
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

                {/* Right Sidebar - Templates & Actions */}
                <div className="w-[350px] border-l flex flex-col h-full bg-slate-50 flex-shrink-0">
                    <div className="p-6 border-b bg-white">
                        <h2 className="text-xl font-bold text-slate-900">Şablonlar & Aktarım</h2>
                        <p className="text-sm text-slate-500 mt-1">Tasarımınızı seçin ve dışa aktarın.</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {renderTemplateGrid}
                    </div>
                    <div className="p-4 border-t bg-white">
                        {renderActionButtons}
                    </div>
                </div>
            </div>

            {/* ═══════════════ MOBILE LAYOUT ═══════════════ */}
            <div className="lg:hidden flex flex-col h-[calc(100dvh-120px)] bg-white border rounded-2xl overflow-hidden shadow-xl">
                {/* Mobile Tab Bar */}
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

                {/* Mobile Tab Content */}
                <div className="flex-1 overflow-hidden relative">
                    {/* Preview Tab */}
                    {mobileTab === 'preview' && (
                        <div className="h-full bg-slate-900 flex flex-col">
                            <div className="flex-1 overflow-hidden">
                                {renderPosterCanvas}
                            </div>
                        </div>
                    )}

                    {/* Templates Tab */}
                    {mobileTab === 'templates' && (
                        <div className="h-full overflow-y-auto p-4">
                            {renderTemplateGrid}
                        </div>
                    )}

                    {/* Settings Tab */}
                    {mobileTab === 'settings' && (
                        <div className="h-full overflow-y-auto p-4">
                            {renderSettingsForm}
                        </div>
                    )}
                </div>

                {/* Mobile Sticky Action Bar */}
                <div className="p-3 border-t bg-white shrink-0">
                    {renderActionButtons}
                </div>
            </div>
        </>
    );
}
