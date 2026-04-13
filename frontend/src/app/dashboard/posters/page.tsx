import React from 'react';
import { PackageSystem } from '@/lib/package-system';
import { PosterBuilder } from '@/components/dashboard/poster-generator/PosterBuilder';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AlertCircle, Lock } from 'lucide-react';

export default async function PostersPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const packageType = session.user.packageType || "FREEMIUM";
    const limits = await PackageSystem.getLimits(packageType);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Afiş Oluşturma Motoru</h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Mevcut paketiniz: <span className="font-bold text-primary">{packageType}</span>
                        <span className="ml-2 text-sm bg-slate-100 px-2 py-1 rounded">Kalite: {limits.posterQuality}</span>
                        {!limits.watermark && <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded">Filigransız</span>}
                    </p>
                </div>
            </div>

            {!limits.canCreatePoster ? (
                <div className="mt-8 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Bu Özellik Paketinizde Bulunmuyor</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Ücretsiz (Freemium) paket kullanıcıları afiş oluşturma özelliğine erişemezler. İlanlarınıza dikkat çekici afişler oluşturmak için lütfen paket izinlerinizi yükseltin.
                    </p>
                    <a href="/dashboard/billing" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                        Paketi Yükselt
                    </a>
                </div>
            ) : (
                <PosterBuilder
                    packageType={packageType}
                    limits={limits}
                />
            )}
        </div>
    );
}
