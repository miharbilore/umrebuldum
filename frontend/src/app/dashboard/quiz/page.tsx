"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    CheckCircle2, 
    XCircle, 
    ChevronRight, 
    Trophy, 
    Zap, 
    Clock, 
    AlertCircle, 
    BookOpen,
    Loader2,
    Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// --- Types ---
interface Question {
    id: string;
    question: string;
    options: string[];
}

type ViewState = "LOADING" | "INTRO" | "QUIZ" | "SUCCESS" | "FAILURE" | "DENIED";

const QUESTION_TIME_LIMIT = 15; // seconds per question

export default function QuizPage() {
    const [view, setView] = useState<ViewState>("LOADING");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [userAnswers, setUserAnswers] = useState<{ id: string; answerIndex: number }[]>([]);
    const [denialReason, setDenialReason] = useState<string | null>(null);
    const [result, setResult] = useState<{ score: number; passed: boolean; bonusGranted: boolean; failureReason?: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    
    // Timer State
    const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Initial Fetch
    useEffect(() => {
        fetchQuizData();
    }, []);

    // Timer Logic
    useEffect(() => {
        if (view === "QUIZ") {
            // Reset timer for new question
            setTimeLeft(QUESTION_TIME_LIMIT);
            
            if (timerRef.current) clearInterval(timerRef.current);
            
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        handleTimeOut();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [view, currentStep]);

    const fetchQuizData = async () => {
        try {
            const res = await fetch("/api/guide/quiz");
            const data = await res.json();

            if (!data.canAttempt) {
                setDenialReason(data.reason);
                setView("DENIED");
                return;
            }

            setQuestions(data.questions);
            setView("INTRO");
        } catch (error) {
            toast.error("Sınav verileri yüklenemedi.");
            setView("DENIED");
            setDenialReason("Sistemde bir hata oluştu. Lütfen sonra tekrar deneyin.");
        }
    };

    const handleTimeOut = () => {
        setResult({ score: 0, passed: false, bonusGranted: false, failureReason: "Süreniz doldu! Sınavı tamamlamak için her soruda hızlı olmalısınız." });
        setView("FAILURE");
        toast.error("Süre doldu!", { description: "Çok yavaş kaldınız, sınav sonlandırıldı." });
    };

    const handleSelectOption = (optionIndex: number) => {
        if (submitting) return;

        const questionId = questions[currentStep].id;
        const newAnswers = [...userAnswers];
        const existingIndex = newAnswers.findIndex(a => a.id === questionId);
        
        if (existingIndex > -1) {
            newAnswers[existingIndex].answerIndex = optionIndex;
        } else {
            newAnswers.push({ id: questionId, answerIndex: optionIndex });
        }
        
        setUserAnswers(newAnswers);

        // Immediate transition logic (0.5s delay for visual feedback)
        setTimeout(() => {
            if (currentStep < questions.length - 1) {
                setCurrentStep(currentStep + 1);
            } else {
                handleSubmit(newAnswers);
            }
        }, 400);
    };

    const handleSubmit = async (finalAnswers = userAnswers) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setSubmitting(true);
        try {
            const res = await fetch("/api/guide/quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers: finalAnswers })
            });
            const data = await res.json();

            if (res.ok) {
                setResult(data);
                setView(data.passed ? "SUCCESS" : "FAILURE");
            } else {
                toast.error(data.error || "Değerlendirme yapılamadı.");
            }
        } catch (error) {
            toast.error("Sunucu bağlantı hatası.");
        } finally {
            setSubmitting(false);
        }
    };

    // --- Time Bar Color Helper ---
    const getTimeBarColor = () => {
        const percentage = (timeLeft / QUESTION_TIME_LIMIT) * 100;
        if (percentage > 50) return "bg-green-500";
        if (percentage > 25) return "bg-amber-500";
        return "bg-red-500";
    };

    // --- Sub-Components ---

    if (view === "LOADING") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Sınav motoru hazırlanıyor...</p>
            </div>
        );
    }

    if (view === "DENIED") {
        return (
            <div className="max-w-xl mx-auto mt-12">
                <Card className="border-2 border-amber-100 shadow-xl overflow-hidden">
                    <div className="h-2 bg-amber-500 w-full" />
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                            <Clock className="w-8 h-8 text-amber-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">Katılım Kısıtlaması</CardTitle>
                        <CardDescription className="text-lg mt-2 text-amber-800 font-medium">
                            {denialReason}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center text-gray-600">
                        <p>Daha önce başarılı olduysanız veya başarısız denemenizin üzerinden 24 saat geçmediyse sınava giremezsiniz.</p>
                    </CardContent>
                    <CardFooter className="justify-center pt-2 pb-8">
                        <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>Panele Dön</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (view === "INTRO") {
        return (
            <div className="max-w-2xl mx-auto mt-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="border-none shadow-2xl bg-gradient-to-b from-white to-purple-50">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-20 h-20 bg-purple-600 rounded-2xl rotate-3 flex items-center justify-center mb-6 shadow-lg shadow-purple-200">
                                <BookOpen className="w-10 h-10 text-white -rotate-3" />
                            </div>
                            <CardTitle className="text-3xl font-extrabold text-gray-900">Rehberlik Yeterlilik Sınavı</CardTitle>
                            <CardDescription className="text-gray-600 mt-2 font-medium">
                                Dikkat: Sınav <span className="text-red-600 font-bold uppercase underline">Hız ve Bilgi</span> odaklıdır!
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-purple-100 shadow-sm">
                                    <Timer className="w-5 h-5 text-red-500 mt-0.5 animate-pulse" />
                                    <div>
                                        <h4 className="font-bold text-sm">Hız Sınırı</h4>
                                        <p className="text-xs text-gray-500">Her soru için sadece 15 saniye!</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-purple-100 shadow-sm">
                                    <Zap className="w-5 h-5 text-amber-500 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-sm">Anlık Geçiş</h4>
                                        <p className="text-xs text-gray-500">Şık tıklandığı an bir sonraki soru.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-purple-100 shadow-sm">
                                    <Trophy className="w-5 h-5 text-purple-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-sm">%80 Başarı</h4>
                                        <p className="text-xs text-gray-500">Hızlı düşün, doğruyu işaretle.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-purple-100 shadow-sm border-dashed">
                                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-sm">Zaman Biterse</h4>
                                        <p className="text-xs text-gray-500">Süre biterse sınav başarısız sayılır.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pb-10 pt-4 px-10">
                            <Button className="w-full h-14 text-lg font-bold bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all hover:scale-[1.02] active:scale-95 group" onClick={() => setView("QUIZ")}>
                                Hazırım, Başlat!
                                <Zap className="ml-2 w-5 h-5 fill-amber-300 group-hover:scale-125 transition-transform" />
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (view === "QUIZ") {
        const currentQuestion = questions[currentStep];
        const progress = ((currentStep + 1) / questions.length) * 100;
        const selectedIndex = userAnswers.find(a => a.id === currentQuestion.id)?.answerIndex;

        return (
            <div className="max-w-3xl mx-auto mt-0 sm:mt-8 px-4 relative">
                {/* Global Time Bar */}
                <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-100 z-50">
                    <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: `${(timeLeft / QUESTION_TIME_LIMIT) * 100}%` }}
                        transition={{ duration: 1, ease: "linear" }}
                        className={`h-full ${getTimeBarColor()} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                    />
                </div>

                <div className="mb-8 space-y-4 pt-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                             <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                Soru {currentStep + 1}/{questions.length}
                             </div>
                             <div className={`flex items-center gap-1 font-mono text-sm font-bold ${timeLeft <= 5 ? 'text-red-500 animate-bounce' : 'text-gray-600'}`}>
                                <Clock size={14} />
                                {timeLeft}s
                             </div>
                        </div>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">İlerleme: %{Math.round(progress)}</span>
                    </div>
                    <Progress value={progress} className="h-1 bg-gray-100" />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05, y: -10 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 260,
                            damping: 20
                        }}
                    >
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-8 leading-tight">
                            {currentQuestion.question}
                        </h2>

                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                            {currentQuestion.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    disabled={selectedIndex !== undefined}
                                    onClick={() => handleSelectOption(idx)}
                                    className={`group flex items-center p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                                        selectedIndex === idx 
                                        ? 'border-purple-600 bg-purple-600 text-white shadow-xl scale-[1.02] z-10' 
                                        : 'border-white bg-white hover:border-purple-100 hover:shadow-md hover:-translate-y-0.5 shadow-sm disabled:opacity-50'
                                    }`}
                                >
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-sm mr-4 transition-all ${
                                        selectedIndex === idx ? 'bg-white text-purple-600' : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600'
                                    }`}>
                                        {String.fromCharCode(64 + (idx + 1))}
                                    </div>
                                    <span className={`font-bold text-sm sm:text-base ${selectedIndex === idx ? 'text-white' : 'text-gray-700'}`}>
                                        {option}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-12 flex items-center justify-center py-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                        <Zap size={14} className="text-amber-400" />
                        Seçim yaptığınızda otomatik geçiş yapılır
                    </div>
                </div>
            </div>
        );
    }

    if (view === "SUCCESS") {
        return (
            <div className="max-w-xl mx-auto mt-12 text-center p-6">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                    <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-xl shadow-green-100">
                        <Trophy className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">EFSANE PERFORMANS!</h1>
                        <p className="text-xl text-green-800 font-semibold opacity-80 underline decoration-2 decoration-green-200 underline-offset-4">Hız ve Bilginin Ustası</p>
                    </div>
                    
                    <div className="bg-white border-2 border-green-100 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 text-green-50/30">
                            <Zap size={140} fill="currentColor" />
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                            <span className="text-xs text-gray-400 font-black uppercase tracking-[0.2em] mb-2">Başarı Ödülü</span>
                            <div className="flex items-center gap-2">
                                <span className="text-7xl font-black text-gray-900 drop-shadow-sm">15</span>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-sm font-bold text-purple-600">JETON</span>
                                    <span className="text-lg font-black text-gray-900 italic">BONUS</span>
                                </div>
                            </div>
                            <div className="mt-6 p-4 bg-green-50 rounded-2xl text-green-700 text-sm font-bold flex items-center gap-2 border border-green-100/50">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                15 yeni teklif hakkı anında tanımlandı!
                            </div>
                        </div>
                    </div>

                    <Button className="w-full h-16 rounded-2xl bg-gray-900 hover:bg-black text-lg font-bold shadow-xl shadow-gray-200 transition-all hover:scale-[1.02] active:scale-95" onClick={() => window.location.href = "/dashboard"}>
                        Panele Dön ve Fırsatları Yakala
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (view === "FAILURE") {
        return (
            <div className="max-w-xl mx-auto mt-12 text-center p-6">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                    <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-inner">
                        <XCircle className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">ELENDİNİZ!</h1>
                        <p className="text-gray-500 font-medium px-4">
                            {result?.failureReason || `Başarı oranı %${result?.score} olarak kaydedildi. Hedef %80.`}
                        </p>
                    </div>
                    
                    <div className="bg-amber-50 rounded-3xl p-6 text-amber-900 text-left flex gap-4 border border-amber-100 shadow-sm relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-5 text-amber-900">
                             <Clock size={100} />
                        </div>
                        <Clock className="w-8 h-8 shrink-0 mt-1 text-amber-600" />
                        <div className="relative z-10">
                            <h4 className="font-black text-lg tracking-tight uppercase">Soğuma Süresi Başladı</h4>
                            <p className="text-sm font-medium opacity-80 mt-1">Sistem, hızlı ve doğru karar verebilen rehberler arıyor. Bilgilerinizi tazeleyin ve <span className="font-bold underline decoration-amber-500 underline-offset-2">24 saat sonra</span> tekrar deneyin.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-14 rounded-2xl font-bold border-2" onClick={() => window.location.href = "/dashboard"}>
                            Panele Dön
                        </Button>
                        <Button className="h-14 rounded-2xl font-bold bg-amber-600 hover:bg-amber-700" onClick={() => window.location.reload()}>
                            Tekrar Dene?
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return null;
}
