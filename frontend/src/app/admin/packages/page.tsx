import { PackageManager } from "@/components/admin/package-manager"

export default function AdminPackagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paket & Jeton Yönetimi</h1>
        <p className="text-sm text-muted-foreground">
          Üyelik paketlerini, jeton maliyetlerini ve özelliklerini düzenleyin
        </p>
      </div>
      <PackageManager />
    </div>
  )
}
