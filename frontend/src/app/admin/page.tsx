import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { ActionCenter } from "@/components/admin/action-center"
import { FinancialLedger } from "@/components/admin/financial-ledger"
import { GamificationAIPanel } from "@/components/admin/gamification-ai-panel"

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    redirect("/")
  }

  // Dinamik verileri çek
  const [
    pendingListingsCount,
    pendingGuidesCount,
    activeSubscriptionsCount,
    tokenCirculation,
    totalRevenueResult,
    recentListings,
    recentGuides
  ] = await Promise.all([
    prisma.guideListing.count({ where: { approvalStatus: "PENDING" } }),
    prisma.user.count({ where: { role: "GUIDE", isApproved: false } }),
    prisma.user.count({ where: { packageType: { not: "FREEMIUM" } } }),
    prisma.user.aggregate({ _sum: { tokenBalance: true } }),
    prisma.transaction.aggregate({ 
      where: { status: "COMPLETED" },
      _sum: { amountTRY: true } 
    }),
    prisma.guideListing.findMany({
      where: { approvalStatus: "PENDING" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { guide: { include: { user: true } } }
    }),
    prisma.user.findMany({
      where: { role: "GUIDE", isApproved: false },
      take: 5,
      orderBy: { createdAt: "desc" }
    })
  ])

  // Verileri formatla
  const stats = {
    totalRevenue: formatCurrency(Number(totalRevenueResult._sum.amountTRY || 0)),
    revenueChange: +12.5, // Mock trend
    activeSubscriptions: activeSubscriptionsCount.toLocaleString(),
    subscriptionChange: +8.2, // Mock trend
    tokensInCirculation: ((tokenCirculation._sum.tokenBalance || 0) / 1000000).toFixed(1) + "M",
    tokenChange: -3.1, // Mock trend
    pendingApprovals: pendingListingsCount + pendingGuidesCount,
    approvalChange: 0 // Mock trend
  }

  const mappedListings = recentListings.map(l => ({
    id: l.id,
    title: l.title,
    guideName: l.guide.user.name || "Anonim Rehber",
    guideImage: l.guide.user.image,
    submittedAt: "Yeni", // Basitlik için
    category: l.category || "Genel"
  }))

  const mappedGuides = recentGuides.map(g => ({
    id: g.id,
    name: g.name || "Anonim",
    image: g.image,
    email: g.email || "",
    submittedAt: "Yeni"
  }))

  return (
    <div className="space-y-6">
      {/* Sayfa Başlığı */}
      <div>
        <h2 className="text-xl font-bold tracking-tight lg:text-3xl">Yönetim Paneli</h2>
        <p className="text-sm text-muted-foreground lg:text-base">
          Platform genel bakışı ve kritik metrikler
        </p>
      </div>

      {/* Üst İstatistikler */}
      <section>
        <DashboardStats stats={stats} />
      </section>

      {/* Orta Bölüm - Acil Aksiyon ve Finans */}
      <section className="grid gap-6 xl:grid-cols-2">
        <ActionCenter 
          pendingListings={mappedListings} 
          pendingGuides={mappedGuides} 
        />
        <FinancialLedger />
      </section>

      {/* Alt Bölüm - Oyunlaştırma ve AI */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Oyunlaştırma ve Yapay Zeka Sağlığı</h3>
          <p className="text-sm text-muted-foreground">
            Bilgi yarışması performans metrikleri ve sohbet robotu kullanım istatistikleri
          </p>
        </div>
        <GamificationAIPanel />
      </section>
    </div>
  )
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount)
}
