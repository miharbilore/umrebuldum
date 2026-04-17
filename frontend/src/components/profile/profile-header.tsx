"use client"

import { Star, Globe, Calendar, Shield } from "lucide-react"

interface ProfileHeaderProps {
  name?: string | null
  title?: string
  trustScore?: number
  avgRating?: number
  reviewCount?: number
  languages?: string[]
  experienceYears?: number
}

export function ProfileHeader({
    name = "Kullanıcı",
    title = "",
    trustScore = 0,
    avgRating = 0,
    reviewCount = 0,
    languages = [],
    experienceYears = 0
}: ProfileHeaderProps) {
  return (
    <div className="mt-20 sm:mt-24 lg:mt-28">
      {/* Name and Title */}
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {name}
        </h1>
        {title && (
            <p className="mt-2 text-lg text-muted-foreground">
              {title}
            </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
        {/* Trust Score */}
        <div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-2.5 shadow-sm ring-1 ring-border">
          <div className="relative h-10 w-10">
            <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                className="stroke-muted"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                className="stroke-secondary"
                strokeWidth="3"
                strokeDasharray="94.2"
                strokeDashoffset="1.884"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="h-4 w-4 text-secondary" />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Güven Skoru
            </p>
            <p className="text-lg font-bold text-foreground">{trustScore}/100</p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-2.5 shadow-sm ring-1 ring-border">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(avgRating) ? "fill-primary text-primary" : "fill-muted text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-lg font-bold text-foreground">{avgRating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({reviewCount} Değerlendirme)</span>
        </div>

        {/* Languages */}
        {languages.length > 0 && (
          <div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-2.5 shadow-sm ring-1 ring-border">
            <Globe className="h-5 w-5 text-secondary" />
            <div className="flex gap-1.5">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="rounded-lg bg-muted px-2 py-0.5 text-sm font-medium text-muted-foreground"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experienceYears > 0 && (
          <div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-2.5 shadow-sm ring-1 ring-border">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">{experienceYears} Yıl</span>
            <span className="text-sm text-muted-foreground">Tecrübe</span>
          </div>
        )}
      </div>
    </div>
  )
}
