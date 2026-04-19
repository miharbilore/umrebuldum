import TestManagementPanel from "@/components/admin/TestManagementPanel"

export default function AdminTestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Test ve QA Yönetimi</h1>
        <p className="text-sm text-muted-foreground">
          Sistem stres testlerini, API sağlık durumlarını ve otomasyon loglarını takip edin
        </p>
      </div>
      <TestManagementPanel />
    </div>
  )
}
