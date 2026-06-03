"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ProfileProgressBar() {
    const { data, error, isLoading } = useSWR("/api/user/profile-stats", fetcher, {
        refreshInterval: 30000, // Refresh every 30s
    });

    const [isVisible, setIsVisible] = useState(true);

    if (isLoading || error || !data || !data.completion) return null;

    const { percentage, missingStep } = data.completion;
    const { trustScore } = data;

    // Don't show if 100% complete
    if (percentage >= 100) return null;

    // Also allow manual closing for the session
    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
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
                                    Güven skorunuzu ({trustScore}/100) artırmak için bilgilerinizi tamamlayın.
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
                                    <Link href={missingStep.link} className="w-full sm:w-auto">
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
                                <span>Mavi Tik için minimum 80 güven skoru gereklidir.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
