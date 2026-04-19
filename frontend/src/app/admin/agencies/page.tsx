import { UserTable } from "@/components/admin/user-table"

export default function AdminAgenciesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Acente Yönetimi</h1>
        <p className="text-sm text-muted-foreground">
          Platformdaki çözüm ortağı acenteleri ve yetkilerini yönetin
        </p>
      </div>
      <UserTable initialRole="organization" />
    </div>
  )
}
