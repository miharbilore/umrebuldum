import PendingListingsPanel from "@/components/admin/PendingListingsPanel"

export default function AdminApprovalListingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">İlan Onay Merkezi</h1>
        <p className="text-sm text-muted-foreground">
          Yayınlanmayı bekleyen yeni umre ilanlarını inceleyin ve onaylayın
        </p>
      </div>
      <PendingListingsPanel />
    </div>
  )
}
