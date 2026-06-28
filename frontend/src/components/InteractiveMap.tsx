"use client";

import React, { useEffect, useRef, useState } from "react";

export function InteractiveMap() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [mapUrl, setMapUrl] = useState(() => {
    if (typeof window === "undefined") return "";
    const defaultUrl = process.env.NEXT_PUBLIC_MAP_URL;
    return defaultUrl || `${window.location.protocol}//${window.location.hostname}:3001`;
  });

  useEffect(() => {    // PostMessage event listener skeleton
    const handleMessage = (event: MessageEvent) => {
      // Security check: ensure the origin is what we expect (either local or production map URL)
      // if (event.origin !== "http://localhost:3001" && event.origin !== process.env.NEXT_PUBLIC_MAP_URL) return;

      const data = event.data;
      if (data && data.type) {
        console.log("Interactive Map Message Received:", data);
        
        // Example integration: Disable body scroll on parent when map modal opens
        // if (data.type === "MODAL_OPEN") document.body.style.overflow = "hidden";
        // if (data.type === "MODAL_CLOSE") document.body.style.overflow = "";
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Ensure mapUrl is loaded before rendering iframe
  if (!mapUrl) return null;

  return (
    <section className="w-full py-16 bg-slate-50 dark:bg-slate-900/50 overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            Kutsal Toprakları Keşfedin
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Özel 2.5D interaktif haritamız ile Mekke ve Medine&apos;nin tarihi mekanlarında sanal bir yolculuğa çıkın. Turlara katılmadan önce ziyaret edeceğiniz mekanları önceden inceleyin.
          </p>
        </div>

        {/* Elegant Map Container */}
        <div className="w-full max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-900/5 dark:ring-white/10 relative">
          
          {/* Iframe embedding the Interactive Map System */}
          <iframe 
            ref={iframeRef}
            src={mapUrl}
            title="UmreBuldum Interactive Historical Map"
            className="w-full border-none block bg-transparent h-[85vh] md:h-[80vh]"
            style={{ 
              maxHeight: "900px" 
            }}
            loading="lazy"
            allow="fullscreen"
          />
        </div>
      </div>
    </section>
  );
}
