"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UMRAH_QUIZ_DATA, QuizQuestion } from "@/data/quiz-data";
import { Timer, CheckCircle2, XCircle, GraduationCap, AlertCircle, Trophy, Coins, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import useSWR from "swr";

interface UmrahQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UmrahQuizModal({ isOpen, onClose }: UmrahQuizModalProps) {
    // State
    const [step, setStep] = useState<"intro" | "quiz" | "result">("intro");
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [loading, setLoading] = useState(false);
    
    const { mutate } = useSWRConfig();
    const { data: userStats, mutate: refreshStats } = useSWR('/api/guide/profile', (url) => fetch(url).then(res => res.json()));

    // Start quiz
    const startQuiz = () => {
        if (userStats?.quizAttempts >= 3 && !userStats?.hasCompletedQuiz) {
            toast.error("Maksimum deneme sayısına ulaştınız.");
            return;
        }
        
        const shuffled = [...UMRAH_QUIZ_DATA]
            .sort(() => Math.random() - 0.5)
            .slice(0, 10);
        setQuestions(shuffled);
        setCurrentIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setTimeLeft(30);
        setStep("quiz");
    };

    // Handle timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (step === "quiz" && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && step === "quiz") {
            handleNext(false); 
        }
        return () => clearInterval(timer);
    }, [step, timeLeft]);

    const handleNext = (isCorrect: boolean) => {
        if (isCorrect) setScore((prev) => prev + 1);
        
        if (currentIndex < 9) {
            setCurrentIndex((prev) => prev + 1);
            setSelectedAnswer(null);
            setTimeLeft(30);
        } else {
            finishQuiz(isCorrect ? score + 1 : score);
        }
    };

    const finishQuiz = async (finalScore: number) => {
        setStep("result");
        setLoading(true);
        try {
            const res = await fetch("/api/user/quiz-reward", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ score: finalScore }),
            });
            const data = await res.json();
            
            if (res.ok) {
                refreshStats(); // Update profile stats
                mutate("/api/guide/credits"); // Update balance UI
                
                if (data.isPassed) {
                    toast.success("Tebrikler! 15 Token kazandınız.");
                } else {
                    toast.info(`Sınav bitti. Skor: ${finalScore}/10.`);
                }
            } else {
                toast.error(data.message || "Bir hata oluştu.");
            }
        } catch (error) {
            toast.error("Bağlantı hatası.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (index: number) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(index);
        const isCorrect = index === questions[currentIndex].correctAnswer;
        setTimeout(() => handleNext(isCorrect), 800);
    };

    const reset = () => {
        setStep("intro");
        onClose();
    };

    if (!isOpen) return null;

    const attemptsUsed = userStats?.quizAttempts ?? 0;
    const hasCompleted = userStats?.hasCompletedQuiz ?? false;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px] border-none bg-white p-0 overflow-hidden rounded-[2rem] shadow-2xl transition-all">
                {step === "intro" && (
                    <div className="p-8 text-center bg-gradient-to-b from-blue-50/50 to-white">
                        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
                            <GraduationCap className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Umre Mini Sınavı</h2>
                        <div className="flex justify-center mb-6">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${attemptsUsed >= 3 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                Hak Durumu: {attemptsUsed} / 3
                            </span>
                        </div>
                        
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Umrah bilginizi tazeleyin ve <span className="font-bold text-blue-600">15 Token</span> kazanın! 10 sorudan 7'sini bilmeniz yeterli.
                        </p>

                        <div className="space-y-3 mb-8">
                            {[
                                "30 saniye cevap süresi",
                                "Geri dönüş imkanı yoktur",
                                "7/10 başarı sınırı",
                                "24 saatte bir yeni hak"
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    </div>
                                    {text}
                                </div>
                            ))}
                        </div>

                        {hasCompleted ? (
                            <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-700 text-sm font-medium border border-emerald-100">
                                Bu ödülü zaten kazandınız. Teşekkürler!
                            </div>
                        ) : attemptsUsed >= 3 ? (
                            <div className="p-4 bg-red-50 rounded-2xl text-red-700 text-sm font-medium border border-red-100">
                                3 deneme hakkınızı da kullandınız.
                            </div>
                        ) : (
                            <Button 
                                onClick={startQuiz}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-6 h-auto text-lg font-bold shadow-lg shadow-blue-200"
                            >
                                Başla ⚡
                            </Button>
                        )}
                    </div>
                )}

                {step === "quiz" && questions.length > 0 && (
                    <div className="p-0">
                        <div className="bg-blue-600 p-6 text-white">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold uppercase tracking-wider opacity-90">Soru {currentIndex + 1} / 10</span>
                                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-black ${timeLeft < 10 ? 'bg-red-500 animate-pulse outline outline-4 outline-red-500/30' : 'bg-white/20'}`}>
                                    <Timer className="w-4 h-4" />
                                    {timeLeft}s
                                </div>
                            </div>
                            <Progress value={((currentIndex + 1) / 10) * 100} className="h-1.5 bg-white/10" />
                        </div>
                        <div className="p-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-8 leading-snug min-h-[4rem]">
                                {questions[currentIndex].question}
                            </h3>
                            <div className="grid gap-3">
                                {questions[currentIndex].options.map((option, i) => (
                                    <button
                                        key={i}
                                        disabled={selectedAnswer !== null}
                                        onClick={() => handleAnswerSelect(i)}
                                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between
                                            ${selectedAnswer === null ? 'border-gray-100 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-50' : 
                                              selectedAnswer === i ? (i === questions[currentIndex].correctAnswer ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-50' : 'border-red-500 bg-red-50') : 
                                              i === questions[currentIndex].correctAnswer ? 'border-emerald-500/50 bg-emerald-50/50' : 'border-gray-50 opacity-40'}
                                        `}
                                    >
                                        <span className="font-bold text-gray-700">{option}</span>
                                        {selectedAnswer === i && (
                                            i === questions[currentIndex].correctAnswer ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === "result" && (
                    <div className="p-10 text-center">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center gap-6">
                                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                                <div className="space-y-2">
                                    <p className="text-gray-900 font-bold text-xl">Sonuçlar İşleniyor</p>
                                    <p className="text-gray-500 text-sm">Lütfen bekleyiniz...</p>
                                </div>
                            </div>
                        ) : score >= 7 ? (
                            <div className="animate-in zoom-in duration-500 slide-in-from-bottom-5">
                                <div className="w-24 h-24 bg-gradient-to-tr from-amber-100 to-yellow-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-100">
                                    <Trophy className="w-12 h-12 text-amber-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-2">Mübarek Olsun!</h2>
                                <p className="text-gray-600 mb-8">
                                    <span className="font-bold text-emerald-600">{score}/10</span> skorla sınavı başarıyla geçtiniz.
                                </p>
                                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-8 mb-8 text-white relative overflow-hidden group shadow-2xl shadow-blue-200">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-500" />
                                    <div className="relative flex flex-col items-center">
                                        <div className="bg-white/20 p-3 rounded-2xl mb-3 backdrop-blur-sm">
                                            <Coins className="w-8 h-8 text-amber-300" />
                                        </div>
                                        <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Hesabınıza Eklendi</p>
                                        <p className="text-4xl font-black">+15 TOKEN</p>
                                    </div>
                                </div>
                                <Button onClick={reset} className="w-full bg-gray-900 hover:bg-black text-white rounded-2xl py-6 h-auto font-bold text-lg">
                                    Tamamla
                                </Button>
                            </div>
                        ) : (
                            <div className="animate-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-gray-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle className="w-10 h-10 text-gray-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Devam Et!</h2>
                                <p className="text-gray-600 mb-10 leading-relaxed">
                                    Skorunuz: <span className="font-bold">{score}/10</span>. Geçmek için en az 7 doğru gerekiyordu. Haklarınız tükenene kadar 24 saat sonra tekrar deneyebilirsiniz.
                                </p>
                                <Button onClick={reset} className="w-full bg-gray-900 hover:bg-black text-white rounded-2xl py-6 h-auto font-bold text-lg">
                                    Anladım
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
