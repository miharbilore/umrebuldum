import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2, MapPin, BadgeCheck, Star } from "lucide-react";

export default function OrganizerPublicProfile({ params }: { params: { slug: string } }) {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="p-1 bg-white rounded-full">
                                <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center border-4 border-white">
                                    <Building2 className="w-12 h-12 text-slate-400" />
                                </div>
                            </div>
                            <Button asChild variant="outline" className="rounded-xl">
                                <Link href="/dashboard/profile">Kurumsal Bilgileri Düzenle</Link>
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-3xl font-bold text-slate-900">Organizasyon Profili</h1>
                                    <BadgeCheck className="w-6 h-6 text-blue-500" />
                                </div>
                                <p className="text-slate-500">@{params.slug}</p>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span>Merkez Belirtilmemiş</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                                    <Star className="w-4 h-4 text-amber-500" />
                                    <span>Yeni Organizasyon</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <h2 className="text-xl font-bold text-slate-900 mb-3">Hakkımızda</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    Bu organizasyon henüz kurumsal bilgilerini girmemiş. Tur paketleri, acente yetkileri ve referanslar yakında burada listelenecektir.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
