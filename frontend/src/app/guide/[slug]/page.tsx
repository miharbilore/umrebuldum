import { User as UserIcon, MapPin, Star, ShieldCheck, CheckCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function GuidePublicProfile({ params }: { params: { slug: string } }) {
    const user = await prisma.user.findUnique({
        where: { slug: params.slug },
        include: { guideProfile: true }
    });

    if (!user || user.role !== 'GUIDE') {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-600 relative">
                        {user.coverImage && (
                            <Image src={user.coverImage} alt="Cover" fill className="object-cover" />
                        )}
                    </div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="p-1 bg-white rounded-full relative z-10">
                                <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center border-4 border-white overflow-hidden">
                                    {user.image ? (
                                        <Image src={user.image} alt={user.fullName || "Profil Resmi"} width={96} height={96} className="object-cover w-full h-full" />
                                    ) : (
                                        <UserIcon className="w-12 h-12 text-slate-400" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-3xl font-bold text-slate-900">{user.fullName || "İsimsiz Rehber"}</h1>
                                    {user.isIdentityVerified && (
                                        <ShieldCheck className="w-6 h-6 text-blue-500" />
                                    )}
                                </div>
                                <p className="text-slate-500">@{user.slug}</p>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span>{user.city || "Konum Belirtilmemiş"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                                    <Star className="w-4 h-4 text-amber-500" />
                                    <span>Yeni Rehber</span>
                                </div>
                                {user.guideProfile?.experienceYears ? (
                                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        <span>{user.guideProfile.experienceYears} Yıl Deneyim</span>
                                    </div>
                                ) : null}
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <h2 className="text-xl font-bold text-slate-900 mb-3">Hakkında</h2>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {user.bio || "Bu rehber henüz bir biyografi eklememiş. Profesyonel rehberlik hizmetleri ve deneyim detayları yakında burada görüntülenecek."}
                                </p>
                            </div>

                            {user.guideProfile?.languagesSpoken && Array.isArray(user.guideProfile.languagesSpoken) && user.guideProfile.languagesSpoken.length > 0 && (
                                <div className="border-t border-slate-100 pt-6">
                                    <h2 className="text-xl font-bold text-slate-900 mb-3">Bildiği Diller</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {(user.guideProfile.languagesSpoken as string[]).map((lang: string, i: number) => (
                                            <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                                {lang}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {user.guideProfile?.specialties && Array.isArray(user.guideProfile.specialties) && user.guideProfile.specialties.length > 0 && (
                                <div className="border-t border-slate-100 pt-6">
                                    <h2 className="text-xl font-bold text-slate-900 mb-3">Uzmanlık Alanları</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {(user.guideProfile.specialties as string[]).map((spec: string, i: number) => (
                                            <span key={i} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
