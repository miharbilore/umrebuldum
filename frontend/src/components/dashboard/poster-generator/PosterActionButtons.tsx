import { Button } from "@/components/ui/button";
import { Download, Loader2, Lock, Share2 } from 'lucide-react';
import { PackageLimits } from '@/lib/package-system';

interface PosterActionButtonsProps {
    handleDownload: () => void;
    handleShare: () => void;
    generating: boolean;
    limits: PackageLimits;
    isLocked: boolean;
    currentTpl?: { requiredTier: string };
}

export function PosterActionButtons({
    handleDownload,
    handleShare,
    generating,
    limits,
    isLocked,
    currentTpl
}: PosterActionButtonsProps) {
    return (
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
                    Ücretsiz/Başlangıç paketlerinde filigran eklenir. Premium'da filigran kalkar.
                </div>
            )}
        </div>
    );
}
