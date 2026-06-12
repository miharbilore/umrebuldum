"use client"

import { useState, useEffect, useMemo } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { 
    User, Map, Building2, CheckCircle2, Loader2, Phone, Mail, 
    ChevronRight, ChevronLeft, MapPin, Sparkles, Trophy, 
    Check, ChevronsUpDown, ShieldCheck, Info
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/brand/logo"
import { cities } from "@/lib/data/cities"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

const roleThemes = {
    USER: {
        border: "border-blue-300",
        ring: "ring-blue-500",
        bg: "bg-blue-50",
        bgHover: "hover:bg-blue-100/70",
        iconColor: "text-blue-600",
        textColor: "text-blue-700",
        badgeBg: "bg-blue-100",
        accent: "from-blue-600 to-indigo-600",
    },
    GUIDE: {
        border: "border-emerald-300",
        ring: "ring-emerald-500",
        bg: "bg-emerald-50",
        bgHover: "hover:bg-emerald-100/70",
        iconColor: "text-emerald-600",
        textColor: "text-emerald-700",
        badgeBg: "bg-emerald-100",
        accent: "from-emerald-600 to-teal-600",
    },
    ORGANIZATION: {
        border: "border-amber-300",
        ring: "ring-amber-500",
        bg: "bg-amber-50",
        bgHover: "hover:bg-amber-100/70",
        iconColor: "text-amber-600",
        textColor: "text-amber-700",
        badgeBg: "bg-amber-100",
        accent: "from-amber-600 to-orange-600",
    },
} as const;

const roles = [
    {
        id: "USER" as const,
        title: "Umreci",
        description: "En uygun Umre turlarını karşılaştırıp hayalindeki yolculuğu planla.",
        icon: User,
        features: ["Kişiselleştirilmiş Tur Önerileri", "Rehber Puanlama & Yorum", "Fiyat Karşılaştırma"]
    },
    {
        id: "GUIDE" as const,
        title: "Rehber",
        description: "Hizmetlerini sergile, umrecilerle buluş ve profesyonel ağını büyüt.",
        icon: Map,
        features: ["Dijital Kimlik Onayı", "Talep Pazarı Erişimi", "Gelişmiş Profil Paneli"]
    },
    {
        id: "ORGANIZATION" as const,
        title: "Organizasyon",
        description: "Acente turlarını yayınla, rezervasyonlarını yönet ve ekibini büyüt.",
        icon: Building2,
        features: ["Tur Yönetim Sistemi", "Kurumsal Marka Paneli", "Grup Teklif Motoru"]
    }
]

export default function OnboardingPage() {
    const { data: session, update, status } = useSession()
    const router = useRouter()
    
    // Step State
    const [step, setStep] = useState(1)
    const TOTAL_STEPS = 5

    // Form Fields
    const [selectedRole, setSelectedRole] = useState<string | null>(null)
    const [fullName, setFullName] = useState("")
    const [city, setCity] = useState("")
    const [phone, setPhone] = useState("")
    const [bio, setBio] = useState("")
    const [kvkkAccepted, setKvkkAccepted] = useState(false)
    
    // UI Helpers
    const [openCity, setOpenCity] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)

    // Pre-fill from session (OAuth data usually)
    useEffect(() => {
        if (session?.user) {
            if (session.user.name && !fullName) setFullName(session.user.name)
            if (session.user.phone && !phone) setPhone(session.user.phone)
            if (session.user.role && !selectedRole) setSelectedRole(session.user.role)
            
            // Auto-redirect ONLY if onboarding is officially marked as not required
            if (session.user.requires_onboarding === false && !isCompleted) {
                router.replace("/dashboard")
            }
        }
    }, [session, router, isCompleted])

    // Redirect if not logged in
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    // Anti-Bypass Bio Check
    const validateBio = (text: string) => {
        const phoneRegex = /\d{5,}/;
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        
        if (phoneRegex.test(text) || emailRegex.test(text)) {
            toast.info("Lütfen iletişim bilgilerinizi profilinizdeki iletişim ayarlarına saklayınız.", {
                description: "Güvenliğiniz için biyografi alanına telefon veya e-posta eklenemez.",
                duration: 5000,
            });
            return false;
        }
        return true;
    };

    const nextStep = () => {
        // Validation per step
        if (step === 1 && !selectedRole) {
            toast.error("Lütfen bir hesap tipi seçin.")
            return
        }
        if (step === 2) {
            if (fullName.trim().length < 3) {
                toast.error("Ad Soyad en az 3 karakter olmalıdır.")
                return
            }
            if (!city) {
                toast.error("Lütfen yaşadığınız şehri seçin.")
                return
            }
        }
        if (step === 3 && !phone.trim().startsWith("+")) {
            toast.error("Lütfen telefon numaranızı + formatında girin (Örn: +90...).")
            return
        }
        if (step === 4 && !validateBio(bio)) {
            return
        }

        setStep(prev => Math.min(prev + 1, TOTAL_STEPS))
        window.scrollTo(0, 0)
    }

    const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

    const handleComplete = async () => {
        if (!kvkkAccepted) {
            toast.error("Lütfen KVKK metnini onaylayın.")
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch('/api/choose-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: selectedRole,
                    name: fullName.trim(),
                    phone: phone.trim(),
                    city,
                    bio: bio.trim()
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Profil güncellenemedi')
            }

            // Sync session with the new data to prevent middleware loops
            await update({
                role: selectedRole,
                fullName: fullName.trim(),
                phone: phone.trim(),
                city: city,
            })
            
            setIsCompleted(true)
            toast.success("Mükemmel! Onboarding tamamlandı.")

            // Give a small delay for toast/success screen then push
            setTimeout(() => {
                router.push("/dashboard")
                router.refresh()
            }, 1500)

        } catch (error: any) {
            toast.error(error.message || "Bir hata oluştu.")
        } finally {
            setSubmitting(false)
        }
    }

    const progressValue = (step / TOTAL_STEPS) * 100

    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                    <p className="text-muted-foreground animate-pulse">Sizin için hazırlanıyoruz...</p>
                </div>
            </div>
        )
    }

    if (isCompleted) {
        const isGuideOrOrg = selectedRole === 'GUIDE' || selectedRole === 'ORGANIZATION';

        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900 p-6">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full text-center space-y-8"
                >
                    <div className="relative inline-block">
                        <div className="absolute inset-0 animate-ping rounded-full bg-blue-100 dark:bg-blue-900/40 opacity-75"></div>
                        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-5 rounded-full shadow-2xl">
                            <Trophy className="w-12 h-12 text-white" />
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Harika Bir Başlangıç!</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Profilinizi başarıyla tamamladınız. Yolculuğunuz şimdi daha ödüllendirici hale geldi.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {isGuideOrOrg && (
                            <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-blue-200 dark:border-blue-900/50 rounded-3xl p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2">
                                    <Sparkles className="w-5 h-5 text-yellow-500 animate-bounce" />
                                </div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Tebrikler!</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-5xl font-black text-gray-900 dark:text-white">5</span>
                                    <span className="text-2xl font-bold text-gray-500">TOKEN</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-4">
                                    Profil tamamlama ödülünüz hesabınıza tanımlandı. Bu tokenları ilan öne çıkarmada kullanabilirsiniz.
                                </p>
                            </div>
                        )}

                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-dashed border-emerald-200 dark:border-emerald-900/50 rounded-3xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2">
                                <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                            </div>
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Sürpriz Hediye!</p>
                            <div className="flex flex-col items-center justify-center gap-2">
                                <span className="text-3xl font-black text-emerald-900 dark:text-white">%10 İNDİRİM</span>
                                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg font-mono text-xl font-bold tracking-widest border border-emerald-200 dark:border-emerald-800">
                                    beyobası10
                                </div>
                            </div>
                            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-4 px-2">
                                beyobası.com'da 1000 TL ve üzeri alışverişlerinizde geçerli indirim kuponunuz!
                            </p>
                        </div>
                    </div>

                    <Button 
                        size="lg" 
                        className="w-full min-h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl shadow-blue-500/20"
                        onClick={() => {
                            router.push("/dashboard")
                            router.refresh()
                        }}
                    >
                        Kontrol Paneline Git
                        <ChevronRight className="ml-2 w-5 h-5" />
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-gray-950">
            {/* Minimal Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b">
                <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Logo size="sm" />
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground hidden sm:inline-block">ADIM {step} / {TOTAL_STEPS}</span>
                        <div className="w-32 sm:w-48">
                            <Progress value={progressValue} className="h-2 bg-blue-100 dark:bg-gray-800" />
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })} className="text-muted-foreground hover:text-red-500 font-medium">
                        Çıkış Yap
                    </Button>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-2xl"
                    >
                        {/* STEP 1: ROLE SELECTION */}
                        {step === 1 && (
                            <div className="space-y-8">
                                <div className="text-center space-y-2">
                                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Kimliği Tanımla</h1>
                                    <p className="text-muted-foreground">Sana en uygun deneyimi sunmamız için hesap tipini seç.</p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    {roles.map((role) => {
                                        const Icon = role.icon
                                        const isSelected = selectedRole === role.id
                                        const theme = roleThemes[role.id]
                                        return (
                                            <Card
                                                key={role.id}
                                                className={cn(
                                                    "cursor-pointer transition-all duration-300 relative group overflow-hidden border-2",
                                                    theme.bgHover,
                                                    isSelected
                                                        ? `${theme.border} ${theme.bg} shadow-lg ring-1 ${theme.ring}`
                                                        : "border-transparent bg-white dark:bg-gray-900 hover:border-gray-200"
                                                )}
                                                onClick={() => setSelectedRole(role.id)}
                                            >
                                                <CardHeader className="p-5 pb-2 text-center sm:text-left">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center mx-auto sm:mx-0 transition-transform group-hover:scale-110",
                                                        isSelected ? theme.badgeBg : "bg-slate-100 dark:bg-gray-800"
                                                    )}>
                                                        <Icon className={cn("w-6 h-6", isSelected ? theme.iconColor : "text-gray-400")} />
                                                    </div>
                                                    <CardTitle className={cn("mt-4 text-lg font-bold", isSelected ? theme.textColor : "")}>
                                                        {role.title}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-5 pt-1">
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        {role.description}
                                                    </p>
                                                    {isSelected && (
                                                        <div className="mt-4 space-y-2">
                                                            {role.features.map((f, i) => (
                                                                <div key={i} className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-gray-500">
                                                                    <div className={cn("w-1 h-1 rounded-full", theme.textColor.replace("text-", "bg-"))}></div>
                                                                    {f}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: PERSONAL IDENTITY */}
                        {step === 2 && (
                            <div className="space-y-8">
                                <div className="text-center space-y-2">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Seni Tanıyalım</h1>
                                    <p className="text-muted-foreground">Profilinde görünecek temel bilgilerini gir.</p>
                                </div>
                                <Card className="border-none shadow-none bg-transparent">
                                    <CardContent className="space-y-6 pt-0">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullname" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                AD SOYAD <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="fullname"
                                                placeholder="Örn: Ahmet Yılmaz"
                                                className="min-h-12 text-base rounded-xl border-gray-200 focus:ring-blue-500"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                            />
                                            <p className="text-[11px] text-muted-foreground">Yasal isminiz platformda güven oluşturur.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                YAŞADIĞIN ŞEHİR <span className="text-red-500">*</span>
                                            </Label>
                                            <Popover open={openCity} onOpenChange={setOpenCity}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openCity}
                                                        className="w-full justify-between min-h-12 text-base rounded-xl border-gray-200"
                                                    >
                                                        {city ? cities.find((c) => c === city) : "Şehir seçin..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-2xl">
                                                    <Command>
                                                        <CommandInput placeholder="Şehir ara..." className="h-12" />
                                                        <CommandList className="max-h-[300px]">
                                                            <CommandEmpty>Şehir bulunamadı.</CommandEmpty>
                                                            <CommandGroup>
                                                                {cities.map((cityName) => (
                                                                    <CommandItem
                                                                        key={cityName}
                                                                        value={cityName}
                                                                        onSelect={(currentValue) => {
                                                                            setCity(currentValue === city ? "" : currentValue)
                                                                            setOpenCity(false)
                                                                        }}
                                                                        className="h-11"
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                city === cityName ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {cityName}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* STEP 3: CONTACT & MOBILE */}
                        {step === 3 && (
                            <div className="space-y-8 text-center sm:text-left">
                                <div className="text-center space-y-2">
                                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Phone className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">İletişim Hattı</h1>
                                    <p className="text-muted-foreground">Organizasyonlar veya rehberler sizinle WhatsApp üzerinden iletişim kurabilir.</p>
                                </div>
                                <div className="max-w-md mx-auto space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                            TELEFON NUMARASI (E.164 FORMADI)
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="+905XXXXXXXXX"
                                            className="min-h-12 text-lg font-mono rounded-xl border-gray-200"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl mt-2 border border-blue-100 dark:border-blue-800">
                                            <Info className="w-4 h-4 text-blue-600 shrink-0" />
                                            <p className="text-[10px] sm:text-[11px] text-blue-700 dark:text-blue-300 text-left">
                                                Lütfen numaranızın başına <b>+</b> koyun ve ülke kodunu ekleyin. (Örn: +90505...)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: BIO / CV */}
                        {step === 4 && (
                            <div className="space-y-8">
                                <div className="text-center space-y-2">
                                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Sparkles className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Kısa Bir Biyografi</h1>
                                    <p className="text-muted-foreground">Kendinden veya tecrübelerinden bahset. İlk izlenim her şeydir!</p>
                                </div>
                                <div className="space-y-4">
                                    <Textarea
                                        placeholder="Örn: 5 yıllık Umre rehberi tecrübem var. Bölgeye ve siyer bilgisine hakimim..."
                                        className="min-h-[160px] rounded-xl border-gray-200 text-base p-4 focus:ring-blue-500"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                    />
                                    <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                                        <span className={cn(bio.length > 500 ? "text-red-500 font-bold" : "")}>
                                            {bio.length} / 500 Karakter
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" />
                                            İletişim bilgisi girmeyiniz.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 5: FINAL APPROVAL */}
                        {step === 5 && (
                            <div className="space-y-8">
                                <div className="text-center space-y-2">
                                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Neredeyse Hazırız</h1>
                                    <p className="text-muted-foreground">Profil bilgilerini kontrol et ve topluluk kurallarımızı onayla.</p>
                                </div>
                                <Card className="border-2 border-blue-50 dark:border-blue-900/20 bg-white dark:bg-gray-900 rounded-3xl overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 border-b">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-gray-900 dark:text-white">Profil Özeti</h3>
                                                <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="text-blue-600 text-xs font-bold hover:bg-blue-100">DÜZENLE</Button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">İSİM</p>
                                                    <p className="text-sm font-semibold">{fullName}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">ŞEHİR</p>
                                                    <p className="text-sm font-semibold">{city}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">ROLY</p>
                                                    <p className="text-sm font-semibold">{roles.find(r => r.id === selectedRole)?.title}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">TELEFON</p>
                                                    <p className="text-sm font-semibold">{phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="flex items-start space-x-3 group cursor-pointer" onClick={() => setKvkkAccepted(!kvkkAccepted)}>
                                                <Checkbox checked={kvkkAccepted} className="mt-1 w-5 h-5 rounded-md" />
                                                <div className="space-y-1">
                                                    <Label className="text-sm font-medium leading-none cursor-pointer">
                                                        Üyelik Sözleşmesini ve KVKK metnini okudum, onaylıyorum.
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Kayıt olarak platform kurallarına uymayı taahhüt edersiniz.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Navigation Controls */}
                        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                            {step > 1 ? (
                                <Button 
                                    variant="ghost" 
                                    onClick={prevStep} 
                                    className="w-full sm:w-auto h-12 px-6 rounded-xl text-gray-500 font-bold"
                                    disabled={submitting}
                                >
                                    <ChevronLeft className="mr-2 w-4 h-4" />
                                    Geri
                                </Button>
                            ) : <div className="hidden sm:block"></div>}

                            {step < TOTAL_STEPS ? (
                                <Button 
                                    onClick={nextStep} 
                                    className="w-full sm:w-auto min-h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20"
                                >
                                    Devam Et
                                    <ChevronRight className="ml-2 w-5 h-5" />
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleComplete} 
                                    className="w-full sm:w-auto min-h-12 px-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-black rounded-xl shadow-xl shadow-blue-600/30"
                                    disabled={submitting || !kvkkAccepted}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        <>
                                            Profilimi Tamamla & Ödülümü Al
                                            <Sparkles className="ml-2 w-5 h-5" />
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer Background Decor */}
            <div className="fixed bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-50/50 to-transparent -z-10 pointer-events-none dark:from-blue-900/5"></div>
        </div>
    )
}
