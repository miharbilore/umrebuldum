import Link from "next/link";
import {
    ArrowRight,
    ShoppingBag,
    Smartphone,
    UtensilsCrossed,
    Heart,
    BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const guides = [
    {
        title: "Alışveriş Rehberi",
        description:
            "Hurma pazarları, geleneksel çarşılar ve modern AVM'ler hakkında kapsamlı bilgiler",
        icon: ShoppingBag,
        gradient: "from-amber-500 to-orange-600",
        bgGlow: "bg-amber-500/10",
    },
    {
        title: "Dijital Asistanlar",
        description:
            "Nusuk, Careem, HungerStation gibi hayat kurtaran uygulamalar",
        icon: Smartphone,
        gradient: "from-blue-500 to-indigo-600",
        bgGlow: "bg-blue-500/10",
    },
    {
        title: "Yeme-İçme",
        description: "Al Baik, Mandi, Kabsa ve yöresel lezzetlerin rehberi",
        icon: UtensilsCrossed,
        gradient: "from-emerald-500 to-teal-600",
        bgGlow: "bg-emerald-500/10",
    },
    {
        title: "Sağlık Rehberi",
        description:
            "Ayak bakımı, solunum yolu sağlığı ve acil durum bilgileri",
        icon: Heart,
        gradient: "from-rose-500 to-pink-600",
        bgGlow: "bg-rose-500/10",
    },
];

export function YasamRehberiPreview() {
    return (
        <section className="py-20 sm:py-28 bg-card">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-14">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        <BookOpen className="h-4 w-4" />
                        Pratik Bilgiler
                    </span>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
                        Umre <span className="text-primary">Yaşam Rehberi</span>
                    </h2>
                    <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                        Kutsal topraklardaki günlük yaşamı kolaylaştıracak pratik bilgiler ve
                        tavsiyeler
                    </p>
                </div>

                {/* Guide Cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
                    {guides.map((guide) => (
                        <Link
                            key={guide.title}
                            href="/yasam-rehberi"
                            className="group relative overflow-hidden rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20"
                        >
                            {/* Glow Effect */}
                            <div
                                className={`absolute -top-10 -right-10 w-28 h-28 rounded-full ${guide.bgGlow} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                            />

                            <div className="relative">
                                {/* Icon */}
                                <div
                                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${guide.gradient} mb-4`}
                                >
                                    <guide.icon className="h-6 w-6 text-white" />
                                </div>

                                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {guide.title}
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {guide.description}
                                </p>

                                {/* Arrow */}
                                <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                    Detayları Gör
                                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="h-14 px-10 text-lg font-semibold rounded-full border-2 border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                    >
                        <Link href="/rehber">
                            Umre Rehberi Merkezine Git
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
