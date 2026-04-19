import PendingReviewsPanel from "@/components/admin/PendingReviewsPanel"

export default function AdminApprovalReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Yorum Moderasyonu</h1>
        <p className="text-sm text-muted-foreground">
          Kullanıcılar tarafından yapılan yeni yorumları inceleyin ve yayınlayın
        </p>
      </div>
      <PendingReviewsPanel />
    </div>
  )
}
