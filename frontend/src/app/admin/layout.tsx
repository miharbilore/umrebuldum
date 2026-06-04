import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Server-side ADMIN role guard
    if (!session?.user?.email || session.user.role !== "ADMIN") {
        redirect("/");
    }

    // Global bekleyen işlem sayılarını çek (Header için)
    const [pendingListings, pendingGuideApprovals] = await Promise.all([
        prisma.guideListing.count({ where: { approvalStatus: "PENDING" } }),
        prisma.user.count({ where: { role: "GUIDE", isApproved: false } }),
    ]);

    return (
        <div className="flex min-h-screen bg-background text-foreground relative">
            <AdminSidebar />
            <div className="flex flex-1 flex-col w-full min-w-0">
                <AdminHeader 
                    pendingListings={pendingListings}
                    pendingTickets={pendingGuideApprovals} // Tickets yerine şimdilik Rehber Onayları sayısını gösteriyoruz
                    notifications={[]} 
                />
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
