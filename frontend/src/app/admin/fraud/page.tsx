import { prisma } from "@/lib/prisma";
import { FraudTable } from "@/components/admin/fraud-table";
import BanPanel from "@/components/admin/BanPanel";
import { ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Güvenlik İhlalleri | Admin Paneli",
};

export default async function FraudPage() {
  const logs = await prisma.moderationLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      message: {
        include: {
          sender: {
            select: { name: true, email: true },
          },
        },
      },
    },
    take: 100,
  });

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-600" />
            Güvenlik İhlalleri (Fraud Paneli)
          </h1>
          <p className="text-muted-foreground text-lg">
            Sistem tarafından tespit edilen şüpheli hareketler, yasaklı kelime kullanımları ve platform dışı iletişim şüpheleri burada listelenir. Otomatik ban atılmaz, nihai kararı siz verirsiniz.
          </p>
        </div>
        <FraudTable data={logs} />
      </div>

      <div className="pt-6 border-t border-border">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Manuel Ban ve Susturma İşlemleri</h2>
        <BanPanel />
      </div>
    </div>
  );
}
