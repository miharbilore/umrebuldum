import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, MapPin, Star, ShieldCheck } from "lucide-react";

export default function GuidePublicProfile({ params }: { params: { slug: string } }) {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="p-1 bg-white rounded-full">
                                <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center border-4 border-white">
                                    <User className="w-12 h-12 text-slate-400" />
                                </div>
                            </div>
                            <Button asChild variant="outline" className="rounded-xl">
                                <Link href="/dashboard/profile">Profili Düzenle</Link>
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-3xl font-bold text-slate-900">Rehber Profili</h1>
                                    <ShieldCheck className="w-6 h-6 text-blue-500" />
                                </div>
                                <p className="text-slate-500">@{params.slug}</p>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span>Konum Belirtilmemiş</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                                    <Star className="w-4 h-4 text-amber-500" />
                                    <span>Yeni Rehber</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <h2 className="text-xl font-bold text-slate-900 mb-3">Hakkında</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    Bu rehber henüz bir biyografi eklememiş. Profesyonel rehberlik hizmetleri ve deneyim detayları yakında burada görüntülenecek.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
