"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck, X, Mail } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ProfileProgressBar() {
    const { data, error, isLoading } = useSWR("/api/user/profile-stats", fetcher, {
        refreshInterval: 30000, // Refresh every 30s
    });

    const [isVisible, setIsVisible] = useState(true);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

    const handleActionClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
        if (link.startsWith("#")) {
            e.preventDefault();
            if (link === "#verify-identity") {
                setIsVerifyModalOpen(true);
            }
        }
    };

    if (isLoading || error || !data || !data.completion) return null;

    const { percentage, missingStep } = data.completion;
    const { trustScore } = data;

    // Don't show if 100% complete
    if (percentage >= 100) return null;

    return (
        <>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        key="banner"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="relative bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 p-4 sm:p-6 text-white shadow-lg border-b border-white/10">
                            <div className="container mx-auto max-w-7xl">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    
                                    {/* Left Side: Progress Info */}
                                    <div className="flex flex-col gap-2 w-full md:w-auto">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                                                <CheckCircle2 className="w-5 h-5 text-teal-100" />
                                            </div>
                                            <h3 className="font-semibold text-lg">Profilinizi Tamamlayın</h3>
                                        </div>
                                        <p className="text-teal-100 text-sm max-w-md">
                                            Profiliniz <span className="font-bold text-white">%{percentage}</span> oranında dolu. 
                                            Mavi Tik almak ve Güven Skorunuzu ({trustScore}/100) artırmak için profilinizi %100 tamamlayın.
                                        </p>
                                    </div>

                                    {/* Center: Progress Bar */}
                                    <div className="flex-1 w-full max-w-xl px-2">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-medium text-teal-50">
                                                <span>İlerleme</span>
                                                <span>%{percentage}</span>
                                            </div>
                                            <div className="relative">
                                                <Progress value={percentage} className="h-3 bg-white/20" />
                                                {/* Glow effect for the progress bar */}
                                                <div 
                                                    className="absolute top-0 left-0 h-3 bg-white/30 blur-sm rounded-full transition-all duration-500" 
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: Smart CTA */}
                                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                                        {missingStep && (
                                            <Link href={missingStep.link} onClick={(e) => handleActionClick(e, missingStep.link)} className="w-full sm:w-auto">
                                                <Button 
                                                    variant="secondary" 
                                                    className="w-full bg-white text-teal-700 hover:bg-teal-50 border-none font-bold group shadow-md"
                                                >
                                                    {missingStep.label}
                                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </Link>
                                        )}
                                        <button 
                                            onClick={() => setIsVisible(false)}
                                            className="p-1 hover:bg-white/10 rounded-full transition-colors hidden sm:block"
                                            aria-label="Kapat"
                                        >
                                            <X className="w-4 h-4 text-teal-200" />
                                        </button>
                                    </div>
                                </div>

                                {/* Pending Approval Warning */}
                                {data.completion.approvalStatus === "PENDING" && (
                                    <div className="mt-4 p-3 bg-amber-400/20 border border-amber-400/30 rounded-xl flex items-center gap-3 text-amber-50">
                                        <div className="p-1.5 bg-amber-400 rounded-lg">
                                            <ShieldCheck className="w-4 h-4 text-amber-900" />
                                        </div>
                                        <p className="text-sm font-medium">
                                            Hesabınız İnceleme Aşamasında. Onaylandıktan sonra profiliniz %100 tamamlanacaktır.
                                        </p>
                                    </div>
                                )}

                                {/* Visual Trust Indicator */}
                                <div className="mt-4 flex items-center gap-4 text-xs text-teal-100/80 border-t border-white/10 pt-4">
                                    <div className="flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>Doğrulanmış profiller %70 daha fazla ilgi görür.</span>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
                                        <span>Mavi Tik (Doğrulanmış Profil) ile %100 Güven Skoru garantilenir.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Identity Verification Modal */}
            <Dialog open={isVerifyModalOpen} onOpenChange={setIsVerifyModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                            Kimlik ve Belge Doğrulaması (Mavi Tik)
                        </DialogTitle>
                        <DialogDescription>
                            Profilinizin %100 tamamlanması ve ilanlarınızda onaylı <strong>Mavi Tik</strong> rozeti sergileyebilmeniz için belgelerinizi doğrulamamız gerekiyor.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg my-2 text-sm text-blue-800 space-y-3">
                        <p>Lütfen aşağıdaki belgeleri <strong>iletisim@umrebuldum.com</strong> adresine mail olarak gönderiniz:</p>
                        <ul className="list-disc list-inside space-y-1 ml-1 text-blue-700 font-medium">
                            <li>Diyanet personeli ya da bir acente personeli olduğunuzu gösteren belgenin arkalı önlü fotoğrafı (İsterseniz TC No ve Doğum Tarihi kısımlarını kapatabilirsiniz).</li>
                            <li>Kısa bir tanıtım yazısı veya portfolyo (Opsiyonel)</li>
                        </ul>
                        <div className="mt-2 text-xs text-blue-600/80 bg-blue-100/50 p-2 rounded border border-blue-200/50">
                            <strong>Önemli Not:</strong> Belgelerini gönderen kullanıcılar, verdikleri bilgilerin doğruluğunu ve platform kuralları çerçevesindeki hukuki sorumluluğu kabul etmiş sayılır.
                        </div>
                    </div>
                    
                    <p className="text-sm text-gray-500">
                        Ekibimiz belgelerinizi inceledikten sonra profilinizi onaylayacak ve güven skorunuz %100&apos;e ulaşacaktır. İşlem süresi genellikle 1-2 iş günüdür.
                    </p>

                    <DialogFooter className="mt-4 sm:justify-start">
                        <Button type="button" variant="default" onClick={() => setIsVerifyModalOpen(false)}>
                            Anladım, Teşekkürler
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <a href="mailto:iletisim@umrebuldum.com?subject=Kimlik%20ve%20Belge%20Doğrulaması%20Talebi" className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                E-posta Gönder
                            </a>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
