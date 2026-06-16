import { Label } from "@/components/ui/label";
import { Lock, Star } from 'lucide-react';
import { POSTER_TEMPLATES } from '@/components/dashboard/poster-templates/registry';

interface PosterTemplateGridProps {
    selectedTemplateId: string;
    setSelectedTemplateId: (id: string) => void;
    isTemplateLocked: (tplId: string, requiredTier: string) => boolean;
}

export function PosterTemplateGrid({ selectedTemplateId, setSelectedTemplateId, isTemplateLocked }: PosterTemplateGridProps) {
    return (
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
}
