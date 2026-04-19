import { UserTable } from "@/components/admin/user-table"

export default function AdminGuidesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rehber Yönetimi</h1>
        <p className="text-sm text-muted-foreground">
          Platformdaki tüm rehberleri ve doğrulama durumlarını yönetin
        </p>
      </div>
      <UserTable initialRole="guide" />
    </div>
  )
}
