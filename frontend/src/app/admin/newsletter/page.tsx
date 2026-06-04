"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Mail } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminNewsletterPage() {
  const [audience, setAudience] = useState<string>("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSendCampaign = async () => {
    if (!audience || !subject || !content) {
      toast.error("Lütfen tüm alanları doldurun.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetAudience: audience,
          subject: subject,
          htmlContent: content,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || "Kampanya başarıyla gönderildi!")
        setSubject("")
        setContent("")
        setAudience("")
      } else {
        toast.error(data.error || "Kampanya gönderilirken bir hata oluştu.")
      }
    } catch (error) {
      toast.error("Sunucu ile iletişim kurulamadı.")
    } finally {
      setLoading(false)
      setDialogOpen(false)
    }
  }

  const getAudienceLabel = () => {
    switch (audience) {
      case "SUBSCRIBERS": return "Bülten Aboneleri"
      case "GUIDES": return "Sadece Rehberler"
      case "ALL_USERS": return "Tüm Kayıtlı Kullanıcılar"
      default: return "Seçili Kitle"
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">E-Posta Kampanyaları</h1>
        <p className="text-sm text-muted-foreground">
          Kullanıcılara veya bülten abonelerine toplu e-posta gönderin.
        </p>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <Label>Hedef Kitle</Label>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger>
              <SelectValue placeholder="Gönderilecek kitleyi seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SUBSCRIBERS">Sadece Bülten Aboneleri</SelectItem>
              <SelectItem value="GUIDES">Sadece Rehberler & Acenteler</SelectItem>
              <SelectItem value="ALL_USERS">Tüm Kullanıcılar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Konu Başlığı</Label>
          <Input 
            placeholder="Örn: Yeni Sezon Umre Turları Başladı!" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>İçerik (HTML destekli)</Label>
          <Textarea 
            placeholder="<h1>Merhaba!</h1><p>Kampanya detayları buraya...</p>"
            className="min-h-[200px] font-mono text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button className="w-full sm:w-auto" disabled={!audience || !subject || !content || loading}>
              <Mail className="w-4 h-4 mr-2" />
              Kampanyayı Gönder
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Gönderimi Onaylıyor musunuz?</AlertDialogTitle>
              <AlertDialogDescription>
                Bu e-posta kampanyası <strong>{getAudienceLabel()}</strong> hedefine gönderilecektir. 
                Bu işlem geri alınamaz ve kitle büyüklüğüne göre biraz zaman alabilir.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction onClick={(e) => { e.preventDefault(); handleSendCampaign(); }} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {loading ? "Gönderiliyor..." : "Evet, Gönder"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
