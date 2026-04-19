import BanPanel from "@/components/admin/BanPanel"

export default function AdminBanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Güvenlik ve Ban Paneli</h1>
        <p className="text-sm text-muted-foreground">
          Kural ihlali yapan kullanıcıları ve rehberleri askıya alın veya banlayın
        </p>
      </div>
      <BanPanel />
    </div>
  )
}
