"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Building2, Compass, Heart, Clock } from "lucide-react"

const defaultSpecialties = [
  { label: "Mecca History", icon: BookOpen },
  { label: "Family Tours", icon: Users },
  { label: "Islamic Architecture", icon: Building2 },
  { label: "Spiritual Guidance", icon: Compass },
  { label: "First-Time Pilgrims", icon: Heart },
  { label: "Extended Stays", icon: Clock },
]

interface AboutSectionProps {
  bio?: string | null
  specialties?: string[]
  completedTrips?: number
  reviewCount?: number
}

export function AboutSection({
  bio,
  specialties = [],
  completedTrips = 0,
  reviewCount = 0
}: AboutSectionProps) {
  return (
    <div className="space-y-6">
      {/* About Me Card */}
      <Card className="overflow-hidden border-0 shadow-md">
        <CardHeader className="border-b border-border bg-card pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <span className="inline-block h-1 w-6 rounded-full bg-primary" />
            Hakkımda
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {bio ? (
            <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
              {bio}
            </p>
          ) : (
            <p className="text-base italic text-muted-foreground">
              Henüz bir biyografi eklenmemiş.
            </p>
          )}
          
          {/* Quick Highlights */}
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                <BookOpen className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{completedTrips}+</p>
                <p className="text-xs text-muted-foreground">Tamamlanan Tur</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{reviewCount}+</p>
                <p className="text-xs text-muted-foreground">Alınan Değerlendirme</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specialties Card */}
      <Card className="overflow-hidden border-0 shadow-md">
        <CardHeader className="border-b border-border bg-card pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <span className="inline-block h-1 w-6 rounded-full bg-secondary" />
            Uzmanlık Alanları
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            {specialties.length > 0 ? (
                specialties.map((spec) => (
                  <span
                    key={spec}
                    className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-accent hover:shadow-sm"
                  >
                    <BookOpen className="h-4 w-4 text-secondary" />
                    {spec}
                  </span>
                ))
            ) : (
                <p className="text-sm text-muted-foreground">Uzmanlık alanı belirtilmemiş.</p>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Component Ends */}
    </div>
  )
}
