import { useState, useCallback, useEffect, RefObject } from 'react';

const CANVAS_W = 1080;
const CANVAS_H = 1350;

export function usePosterScale(previewContainerRef: RefObject<HTMLDivElement | null>, mobileTab: string) {
    const [previewScale, setPreviewScale] = useState(0.4);

    const calcScale = useCallback(() => {
        if (!previewContainerRef.current) return;
        const rect = previewContainerRef.current.getBoundingClientRect();
        
        if (rect.width < 100 || rect.height < 100) return;

        const padX = 32, padY = 32;
        const scaleX = (rect.width - padX) / CANVAS_W;
        const scaleY = (rect.height - padY) / CANVAS_H;
        const calculatedScale = Math.min(scaleX, scaleY);
        const isDesktop = window.innerWidth >= 1024;
        const maxScale = isDesktop ? 1 : 0.6;
        setPreviewScale(Math.max(0.1, Math.min(calculatedScale, maxScale)));
    }, [previewContainerRef]);

    useEffect(() => {
        const container = previewContainerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(() => {
            calcScale();
        });

        observer.observe(container);
        calcScale();

        return () => {
            observer.disconnect();
        };
    }, [calcScale, mobileTab, previewContainerRef]);

    return { previewScale, CANVAS_W, CANVAS_H };
}
