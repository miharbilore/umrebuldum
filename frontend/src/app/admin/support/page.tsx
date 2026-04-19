import { HelpCircle } from "lucide-react"

export default function AdminSupportPlaceholder() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
        <HelpCircle className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Destek Talepleri Modülü</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        Bu modül şu anda geliştirme aşamasındadır. Yakında tüm kullanıcı destek biletlerini buradan yönetebileceksiniz.
      </p>
    </div>
  )
}
