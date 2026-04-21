'use client';

import { Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function ArticleActions() {
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Bağlantı kopyalandı!', {
        description: 'Makale linki panonuza eklendi.',
      });
    }
  };

  const handleSave = () => {
    toast.info('Gelecek Özellik', {
      description: 'Favorilere eklemek için yakında giriş yapabileceksiniz.',
    });
  };

  return (
    <div className="flex items-center gap-4">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleShare}
        className="w-12 h-12 rounded-2xl hover:bg-slate-50 hover:text-primary transition-all duration-300 group"
      >
        <Share2 className="w-5 h-5 text-slate-400 group-hover:text-primary" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleSave}
        className="w-12 h-12 rounded-2xl hover:bg-slate-50 hover:text-primary transition-all duration-300 group"
      >
        <Bookmark className="w-5 h-5 text-slate-400 group-hover:text-primary" />
      </Button>
    </div>
  );
}
