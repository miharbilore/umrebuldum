import { BannerEngine } from "@/components/admin/banner-engine"

export default function AdminBannerEnginePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Afiş Motoru</h1>
        <p className="text-sm text-muted-foreground">
          Platform genelindeki reklam ve kampanya afişlerini yönetin
        </p>
      </div>
      <BannerEngine />
    </div>
  )
}
