import { Shield } from "lucide-react"

export default function AdminSecurityPlaceholder() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
        <Shield className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Güvenlik ve Erişim Kontrolü</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        İki faktörlü doğrulama, IP kısıtlamaları ve admin erişim logları modülü yakında burada olacak.
      </p>
    </div>
  )
}
