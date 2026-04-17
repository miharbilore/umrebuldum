"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  MessageCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2,
  Phone
} from "lucide-react"

interface ContactCardProps {
  name?: string | null
  city?: string | null
  agencyCity?: string | null
  isVerified?: boolean
}

export function ContactCard({ name, city, agencyCity, isVerified }: ContactCardProps) {
  const [isRequested, setIsRequested] = useState(false)

  return (
    <div className="lg:sticky lg:top-6">
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent pb-4">
          <CardTitle className="text-center text-lg">
            {name ? `${name.split(" ")[0]} ile İletişime Geç` : "İletişime Geç"}
          </CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Platform üzerinden mesaj gönderin
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Availability Indicator */}
          <div className="flex items-center justify-center gap-2 rounded-xl bg-secondary/10 py-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-secondary"></span>
            </span>
            <span className="text-sm font-medium text-secondary">
              Müsait
            </span>
          </div>

          {/* Quick Info */}
          <div className="space-y-3 rounded-xl bg-muted/50 p-4">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{agencyCity ? `${city}, ${agencyCity}` : city || "Konum Belirtilmemiş"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Esnek Planlama</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">İletişime geçerek bilgi alın</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <Button
            onClick={() => setIsRequested(!isRequested)}
            className="w-full gap-2 rounded-xl bg-primary py-6 text-base font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
          >
            {isRequested ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Talep Gönderildi!
              </>
            ) : (
              <>
                <Calendar className="h-5 w-5" />
                Talep Oluştur
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="gap-2 rounded-xl py-5"
            >
              <MessageCircle className="h-4 w-4" />
              Mesaj
            </Button>
            <Button
              variant="outline"
              className="gap-2 rounded-xl py-5"
            >
              <Phone className="h-4 w-4" />
              Ara
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 border-t border-border pt-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className={`h-4 w-4 ${isVerified ? "text-secondary" : "text-muted-foreground"}`} />
              <span>{isVerified ? "Kimlik Doğrulandı" : "Onaysız"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
