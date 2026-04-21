'use client';

// ── Tüm Import'lar (Standart JS modül sırasına uygun) ──────────────────
import { useEffect } from 'react';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from 'swr';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatCards } from '@/components/dashboard/StatCards';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { CreditBalance } from '@/components/guide-dashboard/credit-balance';
import { MyOffers } from "@/components/guide-dashboard/my-offers";
import { MyRequests } from "@/components/pilgrim-dashboard/my-requests";

// ── SWR Fetcher ─────────────────────────────────────────────────────────
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ── Loading Skeleton ────────────────────────────────────────────────────
function DashboardSkeleton() {
    return (
        <div className="p-4 lg:p-6 space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
        </div>
    );
}

// ── Provider Dashboard (Rehber & Organizasyon ortak bileşeni) ────────────
// GuideDashboard ve OrganizerDashboard neredeyse aynı kodu paylaşıyordu.
// Tek bileşene birleştirildi; sadece başlık ve emoji farklı.
function ProviderDashboard({ userName, roleLabel, emoji }: { userName: string; roleLabel: string; emoji: string }) {
    const { data, isLoading } = useSWR('/api/stats', fetcher);

    if (isLoading) return <DashboardSkeleton />;

    const stats = data?.stats || [];

    return (
        <div className="p-4 lg:p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Merhaba, {userName || roleLabel} {emoji}</h1>
                <p className="text-gray-500 mt-1">{roleLabel} paneliniz ve bugünkü özetiniz.</p>
            </div>
            <CreditBalance />
            <StatCards stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="font-semibold text-lg mb-2">Talep Havuzu</h3>
                        <p className="text-gray-600 mb-4">
                            Mevcut talepleri görmek ve teklif vermek için Talep Pazarı&apos;nı ziyaret edin.
                        </p>
                        <Link
                            href="/dashboard/market"
                            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Talep Pazarı&apos;na Git
                        </Link>
                    </div>
                </div>
                <div>
                    <MyOffers />
                </div>
            </div>
            <QuickActions />
        </div>
    );
}

// ── Pilgrim (Umreci) Dashboard ──────────────────────────────────────────
function PilgrimDashboard({ userName }: { userName: string }) {
    return (
        <div className="p-4 lg:p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Hoşgeldiniz, {userName || "Değerli Misafirimiz"} 🕋</h1>
                <p className="text-gray-500 mt-1">Umre yolculuğunuz için size en uygun turları buradan takip edebilirsiniz.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-6">
                    {/* Active Requests */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <MyRequests />
                        <div className="mt-4 border-t pt-4">
                            <Link
                                href="/dashboard/requests/new"
                                className="w-full sm:w-auto text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                            >
                                <span className="text-lg">+</span> Yeni Talep Oluştur
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-span-1">
                    <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm sticky top-6">
                        <h3 className="font-semibold text-lg mb-2">Favorilerim</h3>
                        <p className="text-sm text-gray-500">Favorilenmiş tur paketiniz yok.</p>
                        <Link
                            href="/tours"
                            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                        >
                            Turları İncele &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Ana Sayfa Bileşeni ──────────────────────────────────────────────────
export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return <div className="flex h-screen items-center justify-center">Yükleniyor...</div>;
    }

    if (status === 'unauthenticated') {
        return <div className="flex h-screen items-center justify-center">Yönlendiriliyor...</div>;
    }

    const role = session?.user?.role;
    const userName = session?.user?.name || "";

    return (
        <DashboardLayout>
            {role === 'ORGANIZATION' && <ProviderDashboard userName={userName} roleLabel="Acente" emoji="👋" />}
            {role === 'GUIDE' && <ProviderDashboard userName={userName} roleLabel="Rehber" emoji="🗺️" />}
            {role === 'USER' && <PilgrimDashboard userName={userName} />}
            {/* Fallback for safety */}
            {!['ORGANIZATION', 'USER', 'GUIDE'].includes(role || '') && <PilgrimDashboard userName={userName} />}
        </DashboardLayout>
    );
}
