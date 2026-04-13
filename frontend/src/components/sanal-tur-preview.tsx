import Link from "next/link";
import { ArrowRight, Compass, Star, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
    {
        title: "Mekke-i Mükerreme",
        description: "Kabe, Mescid-i Haram, Hira Mağarası ve daha fazlası",
        placeCount: 13,
        icon: Compass,
        gradient: "from-amber-500 to-orange-600",
        bgGlow: "bg-amber-500/10",
    },
    {
        title: "Medine-i Münevvere",
        description: "Mescid-i Nebevi, Ravza, Uhud Dağı ve daha fazlası",
        placeCount: 10,
        icon: Star,
        gradient: "from-emerald-500 to-teal-600",
        bgGlow: "bg-emerald-500/10",
    },
    {
        title: "Diğer Mekanlar",
        description: "Müzeler, Taif, Kabe Örtüsü Fabrikası ve daha fazlası",
        placeCount: 7,
        icon: Mountain,
        gradient: "from-slate-500 to-slate-700",
        bgGlow: "bg-slate-500/10",
    },
];

export function SanalTurPreview() {
    return (
        <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-14">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        <Compass className="h-4 w-4" />
                        Sanal Tur
                    </span>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
                        Kutsal Toprakları <span className="text-primary">Keşfedin</span>
                    </h2>
                    <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                        30 kutsal mekanı interaktif sanal tur ile detaylı bilgiler eşliğinde
                        keşfedin
                    </p>
                </div>

                {/* Category Cards */}
                <div className="grid gap-6 md:grid-cols-3 mb-12">
                    {categories.map((category) => (
                        <div
                            key={category.title}
                            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20"
                        >
                            {/* Glow Effect */}
                            <div
                                className={`absolute -top-12 -right-12 w-32 h-32 rounded-full ${category.bgGlow} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                            />

                            <div className="relative">
                                {/* Icon */}
                                <div
                                    className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${category.gradient} mb-5`}
                                >
                                    <category.icon className="h-7 w-7 text-white" />
                                </div>

                                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {category.title}
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                    {category.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                                        {category.placeCount} Mekan
                                    </span>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Button
                        asChild
                        size="lg"
                        className="h-14 px-10 text-lg font-semibold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                    >
                        <Link href="/rehber">
                            Rehberi Keşfet
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
