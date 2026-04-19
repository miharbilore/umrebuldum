import { UserTable } from "@/components/admin/user-table"

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hacı Yönetimi</h1>
        <p className="text-sm text-muted-foreground">
          Platformdaki tüm kullanıcıları ve talep geçmişlerini yönetin
        </p>
      </div>
      <UserTable initialRole="user" />
    </div>
  )
}
