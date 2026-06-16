import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2, MapPin, BadgeCheck, Star, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ListingCard } from "@/components/listing-card";

export default async function OrganizerPublicProfile({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    
    const user = await prisma.user.findUnique({
        where: { slug },
        include: {
            guideProfile: {
                include: {
                    listings: {
                        where: { active: true, deletedAt: null },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            }
        }
    });

    if (!user || user.role !== "ORGANIZATION") {
        notFound();
    }

    const profile = user.guideProfile;
    const listings = profile?.listings || [];
    const joinedYear = user.createdAt.getFullYear();

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Profile Header Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                        {user.coverImage && (
                            <Image 
                                src={user.coverImage} 
                                alt="Cover" 
                                fill 
                                className="object-cover opacity-60"
                            />
                        )}
                    </div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-16 mb-6">
                            <div className="p-1 bg-white rounded-full z-10">
                                <div className="w-28 h-28 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white overflow-hidden relative">
                                    {user.image || user.photo ? (
                                        <Image 
                                            src={user.image || user.photo || ""} 
                                            alt={user.fullName || "Acente"} 
                                            fill 
                                            className="object-cover"
                                        />
                                    ) : (
                                        <Building2 className="w-12 h-12 text-slate-400" />
                                    )}
                                </div>
                            </div>
                            <Button asChild variant="default" className="rounded-xl shadow-md">
                                <Link href={`mailto:${user.email}`}>İletişime Geç</Link>
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-3xl font-bold text-slate-900">{user.fullName || user.name}</h1>
                                    {user.isIdentityVerified && <BadgeCheck className="w-6 h-6 text-blue-500" title="Doğrulanmış Acente" />}
                                </div>
                                <p className="text-slate-500">@{user.slug}</p>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span>{user.city || "Merkez Belirtilmemiş"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                                    <Star className="w-4 h-4 text-amber-500" />
                                    <span>{profile?.averageRating ? Number(profile.averageRating).toFixed(1) : "Yeni"} Puan</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span>{joinedYear}'den beri üye</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <h2 className="text-xl font-bold text-slate-900 mb-3">Hakkımızda</h2>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {user.bio || "Bu organizasyon henüz detaylı kurumsal bilgilerini girmemiş."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Listings */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        Aktif İlanlar <span className="bg-blue-100 text-blue-700 text-sm px-2.5 py-0.5 rounded-full">{listings.length}</span>
                    </h2>
                    
                    {listings.length === 0 ? (
                        <div className="bg-white border rounded-2xl p-12 text-center text-slate-500">
                            Şu anda aktif bir tur ilanı bulunmamaktadır.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {listings.map(listing => (
                                <ListingCard 
                                    key={listing.id} 
                                    listing={listing as any} 
                                    agencyName={user.fullName || "Acente"}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
