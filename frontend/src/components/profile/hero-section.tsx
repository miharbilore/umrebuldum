"use client"

import { BadgeCheck } from "lucide-react"
import { SmartAvatar } from "@/components/ui/smart-avatar"

interface HeroSectionProps {
  coverImage?: string | null
  avatar?: string | null
  name?: string | null
  isVerified?: boolean
}

export function HeroSection({ coverImage, avatar, name, isVerified }: HeroSectionProps) {
  return (
    <div className="relative">
      {/* Cover Photo */}
      <div 
         className="h-48 w-full overflow-hidden bg-gradient-to-br from-amber-50 via-amber-100/50 to-emerald-50 sm:h-64 lg:h-72 bg-cover bg-center"
         style={{ backgroundImage: coverImage ? `url(${coverImage})` : undefined }}
      >
        <div className="absolute inset-0 opacity-30">
          <svg
            className="h-full w-full"
            viewBox="0 0 800 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Islamic Geometric Pattern */}
            <defs>
              <pattern
                id="islamicPattern"
                x="0"
                y="0"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M40 0 L80 40 L40 80 L0 40 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-amber-400/40"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-emerald-500/30"
                />
                <path
                  d="M20 20 L60 20 L60 60 L20 60 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-amber-500/20"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamicPattern)" />
          </svg>
        </div>
        {/* Subtle arch silhouette */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-10">
          <svg
            width="300"
            height="200"
            viewBox="0 0 300 200"
            className="text-emerald-700"
          >
            <path
              d="M50 200 Q50 100 150 50 Q250 100 250 200"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <circle cx="150" cy="70" r="20" fill="currentColor" fillOpacity="0.3" />
          </svg>
        </div>
      </div>

      {/* Profile Avatar */}
      <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 sm:left-8 sm:translate-x-0 lg:left-[calc(50%-560px)]">
        <div className="relative">
          <div className="flex items-center justify-center text-muted-foreground w-auto h-auto">
            <SmartAvatar
              src={avatar}
              name={name}
              size={160}
              className="border-8 border-card bg-card shadow-xl h-32 w-32 sm:h-40 sm:w-40"
            />
          </div>
          {/* Verified Badge */}
          {isVerified && (
            <div className="absolute -right-1 bottom-2 flex h-10 w-10 items-center justify-center rounded-full bg-secondary shadow-lg">
              <BadgeCheck className="h-6 w-6 text-secondary-foreground text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
