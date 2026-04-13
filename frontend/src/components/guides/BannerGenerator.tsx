'use client';

import { useState, useRef } from 'react';
import { toJpeg } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Loader2, Share2, MapPin, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ListingProps {
  id: string;
  title: string;
  thumbnail?: string;
  price?: string;
  rating?: number;
}

export function BannerGenerator({ listing }: { listing: ListingProps }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  const qrUrl = `https://umrebuldum.com/tours/${listing.id}`;

  const handleDownload = async () => {
    if (!bannerRef.current) return;
    setIsGenerating(true);
    try {
      // Adding a small delay to ensure images load
      await new Promise(resolve => setTimeout(resolve, 300));
      const dataUrl = await toJpeg(bannerRef.current, { quality: 0.95 });
      const link = document.createElement('a');
      link.download = `umrebuldum-afis-${listing.id}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Afiş oluşturulamadı:', err);
      alert('Afiş oluşturulurken bir hata oluştu.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors rounded-lg">
          <Share2 className="w-4 h-4" /> QR Afiş Paylaş
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gray-50 border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 border-b pb-4">
            Afiş Jeneratörü
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* BANNER PREVIEW CONTAINER */}
          <div className="rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/10 scale-90 sm:scale-100 transform origin-top">
            <div
              ref={bannerRef}
              className="w-[320px] h-[568px] bg-white relative overflow-hidden font-sans text-gray-900"
              style={{
                background: 'linear-gradient(160deg, #F8FAFC 0%, #E2E8F0 100%)',
              }}
            >
              {/* IMAGE HEADER */}
              <div className="h-2/5 w-full bg-gray-300 relative border-b-4 border-blue-600">
                {listing.thumbnail ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={listing.thumbnail}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center">
                    <span className="text-white text-4xl font-serif">Kabe</span>
                  </div>
                )}
                {/* LOGO BADGE */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur shadow-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-white/50">
                  <div className="bg-yellow-400 text-black font-bold font-serif w-5 h-5 flex items-center justify-center rounded-full text-xs">U</div>
                  <span className="text-sm font-bold text-blue-900 tracking-tight">Umrebuldum</span>
                </div>
              </div>

              {/* CONTENTS */}
              <div className="px-5 py-4 flex flex-col justify-between h-[340px]">
                <div>
                  <div className="inline-flex bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3 shadow-sm border border-blue-200">
                    Özel Fırsat
                  </div>
                  <h3 className="text-xl font-bold leading-tight line-clamp-3 text-gray-900 mb-2">
                    {listing.title}
                  </h3>
                  
                  {listing.rating && (
                    <div className="flex items-center gap-1 mb-4 text-sm font-medium text-gray-600">
                       <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                       {listing.rating} Değerlendirme
                    </div>
                  )}

                  <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                    <span className="text-[10px] text-gray-500 font-bold uppercase mb-0.5 block">Kişi Başı Başlayan</span>
                    <span className="text-2xl font-extrabold text-blue-600 tracking-tight">
                      {listing.price ? listing.price : "Fiyat Sorunuz"}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-xl p-3 text-white flex items-center justify-between shadow-md">
                   <div className="text-xs font-medium max-w-[150px]">
                     <span className="block opacity-70 text-[10px] uppercase tracking-wider mb-0.5">Hemen İncele</span>
                     Okutarak ilanın tüm detaylarına ulaşın
                   </div>
                   <div className="bg-white p-1.5 rounded-lg shadow-sm">
                     <QRCodeSVG 
                       value={qrUrl} 
                       size={64} 
                       level="H"
                       includeMargin={false}
                       imageSettings={{
                         src: "https://cdn-icons-png.flaticon.com/512/3069/3069356.png", // Mosque icon placeholder
                         x: undefined, y: undefined,
                         height: 16, width: 16,
                         excavate: true,
                       }}
                     />
                   </div>
                </div>
              </div>
              
              {/* DECOR TAPE */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400 translate-x-8 -translate-y-8 rotate-45" />
            </div>
          </div>

          <Button 
            onClick={handleDownload} 
            disabled={isGenerating}
            className="w-full h-12 text-md font-bold flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Hazırlanıyor...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Afişi İndir (JPG)
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-gray-500 -mt-2">
            Bu afişi WhatsApp, Instagram ve Facebook'ta paylaşabilirsiniz.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
