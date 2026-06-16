import { useState, RefObject } from 'react';
import * as htmlToImage from 'html-to-image';
import { PackageLimits } from '@/lib/package-system';
import { PosterData } from './types';

export function usePosterExport(previewRef: RefObject<HTMLDivElement | null>, limits: PackageLimits, data: PosterData, selectedTemplateId: string) {
    const [generating, setGenerating] = useState(false);

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

        let scale = 1;
        if (limits.posterQuality === "NORMAL") scale = 2;
        if (limits.posterQuality === "HIGH") scale = 3;

        try {
            await new Promise(r => setTimeout(r, 800));

            const options = {
                pixelRatio: scale,
                backgroundColor: '#ffffff',
                cacheBust: true,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left',
                },
            };

            const blob = await htmlToImage.toBlob(previewRef.current, options);
            
            if (!blob) {
                throw new Error("Blob generation returned null.");
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `umre-afis-${selectedTemplateId}-${Date.now()}.png`;
            link.href = url;
            link.click();
            
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (err: any) {
            console.error("Image export failed detail:", err);
            alert("Afiş oluşturulurken bir hata oluştu. \n\nİpucu: Eğer rehber fotoğrafı eklediyseniz, fotoğrafın yüklendiğinden veya geçerli bir formatta olduğundan emin olun.");
        } finally {
            setGenerating(false);
        }
    };

    return { generating, handleShare, handleDownload };
}
