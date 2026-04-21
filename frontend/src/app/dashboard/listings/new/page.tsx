"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CreateListingForm } from "@/components/guide-dashboard/create-listing-form";

/**
 * Yeni İlan Oluşturma Sayfası — Thin Wrapper
 * 
 * Tüm form mantığı ve UI, kanonik bileşen olan
 * `components/guide-dashboard/create-listing-form.tsx` tarafından yönetilir.
 * Bu sayfa yalnızca DashboardLayout ile sarmalayarak render eder.
 */
export default function NewListingPage() {
    return (
        <DashboardLayout>
            <div className="container mx-auto py-10 px-4 max-w-3xl">
                <h1 className="text-3xl font-bold mb-8">Yeni Tur Oluştur</h1>
                <CreateListingForm />
            </div>
        </DashboardLayout>
    );
}
