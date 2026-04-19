import AllListingsPanel from "@/components/admin/AllListingsPanel"

export default function AdminListingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tüm İlanlar</h1>
        <p className="text-sm text-muted-foreground">
          Platformdaki aktif, pasif ve süresi geçmiş tüm ilanları filtreleyin ve yönetin
        </p>
      </div>
      <AllListingsPanel />
    </div>
  )
}
