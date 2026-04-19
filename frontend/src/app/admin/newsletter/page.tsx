import NewsletterPanel from "@/components/admin/NewsletterPanel"

export default function AdminNewsletterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bülten Yönetimi</h1>
        <p className="text-sm text-muted-foreground">
          E-posta bültenine abone olan kullanıcıları yönetin ve listeleri dışa aktarın
        </p>
      </div>
      <NewsletterPanel />
    </div>
  )
}
