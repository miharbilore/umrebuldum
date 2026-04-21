"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Map, Building2, CheckCircle2, Loader2, Phone, Mail } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/brand/logo";

const roleThemes = {
    USER: {
        border: "border-blue-300",
        ring: "ring-blue-500",
        bg: "bg-blue-50",
        bgHover: "hover:bg-blue-100/70",
        iconColor: "text-blue-600",
        textColor: "text-blue-700",
        badgeBg: "bg-blue-100",
        accent: "from-blue-500 to-blue-600",
    },
    GUIDE: {
        border: "border-emerald-300",
        ring: "ring-emerald-500",
        bg: "bg-emerald-50",
        bgHover: "hover:bg-emerald-100/70",
        iconColor: "text-emerald-600",
        textColor: "text-emerald-700",
        badgeBg: "bg-emerald-100",
        accent: "from-emerald-500 to-emerald-600",
    },
    ORGANIZATION: {
        border: "border-amber-300",
        ring: "ring-amber-500",
        bg: "bg-amber-50",
        bgHover: "hover:bg-amber-100/70",
        iconColor: "text-amber-600",
        textColor: "text-amber-700",
        badgeBg: "bg-amber-100",
        accent: "from-amber-500 to-amber-600",
    },
} as const;

const roles = [
    {
        id: "USER" as const,
        title: "Umreci",
        description: "Umre ziyareti yapmak istiyorum. Turları inceleyip en uygun teklifi karşılaştıracağım.",
        icon: User,
        features: ["Tur arama & karşılaştırma", "Talep oluşturma", "Rehber değerlendirme"]
    },
    {
        id: "GUIDE" as const,
        title: "Rehber",
        description: "Umre turlarında rehberlik hizmeti veriyorum. Profil oluşturup müşteri kazanacağım.",
        icon: Map,
        features: ["Talep pazarına erişim", "Afiş ve ilan motoru", "Kimlik onay rozeti"]
    },
    {
        id: "ORGANIZATION" as const,
        title: "Organizasyon",
        description: "Tur şirketiyim. Umre turlarımı yayınlayıp geniş kitlelere ulaşmak istiyorum.",
        icon: Building2,
        features: ["Çoklu tur yönetimi", "Kurumsal panel", "Toplu kredi paketleri"]
    }
]

export default function OnboardingPage() {
    const { data: session, update, status } = useSession()
    const router = useRouter()
    const [selectedRole, setSelectedRole] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Form fields — pre-filled from session (OAuth data)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")

    // Pre-fill from session data
    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "")
            setEmail(session.user.email || "")
            if (session.user.phone) setPhone(session.user.phone)

            // If user already has a role and phone, redirect
            const role = session.user.role;
            const hasValidRole = ["USER", "GUIDE", "ORGANIZATION", "ADMIN"].includes(role || "");
            if (hasValidRole && session.user.phone) {
                if (role === "ADMIN") {
                    router.replace("/admin/dashboard");
                } else {
                    router.replace("/dashboard");
                }
            }

            // Pre-select role if already set (e.g. credentials registration)
            if (role && ["USER", "GUIDE", "ORGANIZATION"].includes(role)) {
                setSelectedRole(role);
            }
        }
    }, [session, router])

    // Redirect if not logged in
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    const handleComplete = async () => {
        if (!selectedRole) {
            toast.error("Lütfen bir hesap tipi seçin.")
            return
        }
        if (!phone.trim()) {
            toast.error("Telefon numarası zorunludur")
            return
        }
        if (!name.trim()) {
            toast.error("Ad Soyad alanını doldurmanız zorunludur")
            return
        }
        if (name.trim().length < 2) {
            toast.error("Ad Soyad en az 2 karakter olmalıdır")
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch('/api/choose-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: selectedRole,
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim()
                })
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Profil güncellenemedi');
            }

            // Await update to ensure session cookie is refreshed before navigating
            await update()

            toast.success("Profiliniz başarıyla oluşturuldu! Yönlendiriliyorsunuz...")

            router.push("/dashboard")
            router.refresh()

        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Bir hata oluştu. Lütfen tekrar deneyin.")
        } finally {
            setSubmitting(false)
        }
    }

    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-4 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[640px] lg:w-[860px]">

                {/* Header */}
                <div className="flex flex-col space-y-2 text-center">
                    <div className="flex justify-center mb-2">
                        <Logo size="lg" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Profilinizi Tamamlayın
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Umrebuldum'dan en iyi şekilde yararlanabilmeniz için bilgilerinizi tamamlayın.
                    </p>
                </div>

                {/* Personal Info Form */}
                <div className="bg-white dark:bg-gray-900 border rounded-2xl p-6 shadow-sm space-y-5">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
                        <Mail className="w-5 h-5 text-blue-500" />
                        Kişisel Bilgiler
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="onb-name">Ad Soyad <span className="text-red-500">*</span></Label>
                            <Input
                                id="onb-name"
                                placeholder="Adınız Soyadınız"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="onb-email">E-posta</Label>
                            <Input
                                id="onb-email"
                                type="email"
                                placeholder="ornek@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={!!session?.user?.email}
                            />
                            <p className="text-xs text-muted-foreground">
                                {session?.user?.email ? "E-posta değişikliği güvenlik nedeniyle devre dışıdır." : "Giriş yapacağınız e-posta adresini girin."}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2 max-w-sm">
                        <Label htmlFor="onb-phone" className="flex items-center gap-1.5">
                            <Phone className="w-4 h-4 text-emerald-500" />
                            Telefon Numarası <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="onb-phone"
                            type="tel"
                            placeholder="5XX XXX XX XX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">Rehberler bu numaraya WhatsApp üzerinden ulaşabilir.</p>
                    </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-100">
                        Hesap Tipinizi Seçin
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        {roles.map((role) => {
                            const Icon = role.icon
                            const isSelected = selectedRole === role.id
                            const theme = roleThemes[role.id]
                            return (
                                <Card
                                    key={role.id}
                                    className={cn(
                                        "cursor-pointer transition-all duration-200",
                                        theme.bgHover,
                                        isSelected
                                            ? `${theme.border} ${theme.bg} ring-2 ${theme.ring} shadow-md`
                                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                    )}
                                    onClick={() => setSelectedRole(role.id)}
                                >
                                    <CardHeader className="p-5 pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className={cn(
                                                "p-2 rounded-lg",
                                                isSelected ? theme.badgeBg : "bg-gray-100"
                                            )}>
                                                <Icon className={cn(
                                                    "h-6 w-6",
                                                    isSelected ? theme.iconColor : "text-muted-foreground"
                                                )} />
                                            </div>
                                            {isSelected && (
                                                <div className={cn("p-1 rounded-full", theme.badgeBg)}>
                                                    <CheckCircle2 className={cn("h-5 w-5", theme.iconColor)} />
                                                </div>
                                            )}
                                        </div>
                                        <CardTitle className={cn(
                                            "text-lg mt-2",
                                            isSelected ? theme.textColor : ""
                                        )}>
                                            {role.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-1">
                                        <CardDescription className="text-sm mb-3">
                                            {role.description}
                                        </CardDescription>
                                        <ul className="space-y-1">
                                            {role.features.map((f, i) => (
                                                <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                    <span className={cn(
                                                        "w-1 h-1 rounded-full",
                                                        isSelected ? theme.iconColor.replace("text-", "bg-") : "bg-gray-300"
                                                    )} />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex flex-col items-center gap-3">
                    <Button
                        size="lg"
                        className={cn(
                            "w-full sm:w-auto px-12 h-12 text-base font-semibold shadow-lg transition-all",
                            selectedRole
                                ? `bg-gradient-to-r ${roleThemes[selectedRole as keyof typeof roleThemes]?.accent} hover:opacity-90 text-white`
                                : ""
                        )}
                        disabled={!selectedRole || !phone.trim() || !name.trim() || submitting}
                        onClick={handleComplete}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Kaydediliyor...
                            </>
                        ) : "Profili Tamamla ve Devam Et"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center max-w-sm">
                        Devam ederek <a href="/terms" className="underline">Kullanım Şartları</a> ve <a href="/kvkk" className="underline">KVKK</a> metnini okuduğunuzu onaylarsınız.
                    </p>
                </div>

            </div>
        </div>
    )
}
