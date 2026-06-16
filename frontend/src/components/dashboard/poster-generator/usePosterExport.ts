import { useState, RefObject } from 'react';
import * as htmlToImage from 'html-to-image';
import { PackageLimits } from '@/lib/package-system';
import { PosterData } from './types';

function dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

export function usePosterExport(previewRef: RefObject<HTMLDivElement | null>, limits: PackageLimits, data: PosterData, selectedTemplateId: string) {
    const [generating, setGenerating] = useState(false);

    const handleShare = async () => {
        if (!previewRef.current) return;
        try {
            const options = {
                pixelRatio: 1.25,
                backgroundColor: '#ffffff',
                width: 1080,
                height: 1350,
            };

            await htmlToImage.toPng(previewRef.current, options).catch(() => {});
            const dataUrl = await htmlToImage.toPng(previewRef.current, options);
            if (!dataUrl || dataUrl === 'data:,') throw new Error("Could not generate image data");
            const blob = dataURItoBlob(dataUrl);
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

        let scale = 1; // 1080x1350 (Standard HD)
        if (limits.posterQuality === "NORMAL") scale = 1.25; 
        if (limits.posterQuality === "HIGH") scale = 1.5; 

        try {
            await new Promise(r => setTimeout(r, 800));

            const options = {
                pixelRatio: scale,
                backgroundColor: '#ffffff',
                width: 1080,
                height: 1350,
            };

            // Warm-up call (solves the famous html-to-image Safari/Chrome empty data bug)
            await htmlToImage.toPng(previewRef.current, options).catch(() => {});
            
            // Actual capture
            const dataUrl = await htmlToImage.toPng(previewRef.current, options);
            
            if (!dataUrl || dataUrl === 'data:,') {
                throw new Error("Image generation returned empty data.");
            }

            // Convert to Blob manually to prevent browser href string length limits (0kb error)
            const blob = dataURItoBlob(dataUrl);
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
