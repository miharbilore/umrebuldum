import LedgerPanel from "@/components/admin/LedgerPanel"

export default function AdminLedgerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mali Defter</h1>
        <p className="text-sm text-muted-foreground">
          Platform üzerindeki tüm token alımları, harcamaları ve ödeme işlemlerini takip edin
        </p>
      </div>
      <LedgerPanel />
    </div>
  )
}
