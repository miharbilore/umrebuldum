"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Sparkles, Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getProfileProgressData } from "@/app/actions/getProfileProgressData";

export function ProfileProgress() {
    const router = useRouter();
    const [isClaiming, setIsClaiming] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ user: any, guideProfile: any } | null>(null);

    useEffect(() => {
        getProfileProgressData().then((res) => {
            if (res) {
                setData(res);
                if (res.user.hasClaimedProfileBonus) {
                    setHidden(true);
                }
            }
            setLoading(false);
        });
    }, []);

    if (loading || !data) return null;

    const { user, guideProfile } = data;

    // If bonus is already claimed, hide completely or show a small tick.
    // The requirement says: "Eğer bonus zaten alınmışsa, bu bileşeni tamamen gizle veya küçük yeşil bir tik ile 'Profil %100 Tamamlandı' yaz."
    // We will render a tiny completed badge if claimed.

    const fields = [
        { key: "name", label: "Ad Soyad", isComplete: !!user.name && user.name.length > 2 },
        { key: "phone", label: "Telefon Numarası", isComplete: !!user.phone },
        { key: "city", label: "Şehir", isComplete: !!user.city },
        { key: "bio", label: "Biyografi", isComplete: !!user.bio && user.bio.length > 10 },
        { key: "image", label: "Profil Fotoğrafı", isComplete: !!user.image },
        { key: "experienceYears", label: "Deneyim Yılı", isComplete: guideProfile?.experienceYears !== null && guideProfile?.experienceYears !== undefined },
        { key: "languagesSpoken", label: "Konuşulan Diller", isComplete: !!guideProfile?.languagesSpoken && Object.keys(guideProfile.languagesSpoken).length > 0 },
    ];

    const completedFields = fields.filter((f) => f.isComplete);
    const missingFields = fields.filter((f) => !f.isComplete);
    
    const percentage = Math.round((completedFields.length / fields.length) * 100);
    const isPerfect = percentage === 100;

    const handleClaimBonus = async () => {
        if (!isPerfect) return;
        setIsClaiming(true);

        try {
            const res = await fetch("/api/guide/claim-bonus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bonusType: "PROFILE" }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Bonus alınamadı.");
            }

            toast.success(
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-emerald-600">Harika! Bonus Eklendi 🎉</span>
                    <span className="text-sm">Profilini %100 tamamladığın için teşekkürler.</span>
                </div>
            );
            
            // Gizle
            setHidden(true);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsClaiming(false);
        }
    };

    if (hidden) {
        return (
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30 w-max">
                <CheckCircle2 className="w-4 h-4" />
                Profil %100 Tamamlandı
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm overflow-hidden relative"
        >
            {/* Background Glow when perfect */}
            {isPerfect && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 -z-10" />
            )}

            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                
                {/* Left: Progress Info */}
                <div className="flex-1 w-full space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                Profil Doluluğu
                                {isPerfect && <Trophy className="w-5 h-5 text-yellow-500" />}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {isPerfect 
                                    ? "Profilin kusursuz görünüyor! Bonusunu almayı unutma." 
                                    : "Profilini tamamla, ilanlarında daha fazla güven ver ve bonus token kazan."}
                            </p>
                        </div>
                        <span className={cn(
                            "text-2xl font-black",
                            isPerfect ? "text-emerald-600" : "text-blue-600"
                        )}>
                            %{percentage}
                        </span>
                    </div>

                    <Progress 
                        value={percentage} 
                        className={cn("h-3", isPerfect ? "[&>div]:bg-emerald-500" : "[&>div]:bg-blue-600")} 
                    />

                    {/* Missing Fields List */}
                    <AnimatePresence>
                        {!isPerfect && missingFields.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex flex-wrap gap-2 pt-2"
                            >
                                {missingFields.map((f) => (
                                    <div key={f.key} className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800/50">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {f.label} eksik
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right: Action Button */}
                <div className="w-full md:w-auto flex flex-col gap-2 shrink-0">
                    {!isPerfect ? (
                        <Button 
                            variant="outline" 
                            className="w-full md:w-auto h-11 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            onClick={() => router.push("/dashboard/settings")}
                        >
                            Profili Düzenle
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleClaimBonus}
                            disabled={isClaiming}
                            className="w-full md:w-auto h-12 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 border-0 transition-all hover:scale-105 group relative overflow-hidden"
                        >
                            {/* Shine effect */}
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            
                            {isClaiming ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <Sparkles className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                            )}
                            {isClaiming ? "Alınıyor..." : "5 Token Bonus'u Al"}
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
