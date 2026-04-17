"use client"

import { useState } from "react"
import Image from "next/image"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SmartAvatarProps {
  src?: string | null
  alt?: string
  name?: string | null
  size?: number
  className?: string
  fallbackType?: "initials" | "icon"
}

export function SmartAvatar({
  src,
  alt,
  name,
  size = 40,
  className,
  fallbackType = "initials",
}: SmartAvatarProps) {
  const [hasError, setHasError] = useState(false)

  // Eğer resim hiç yoksa veya yüklerken hata verdiyse (S3 Bucket ayarından vb)
  const showFallback = !src || hasError

  // İsmin baş harflerini alma fonksiyonu
  const getInitials = (nameStr: string) => {
    return nameStr
      .split(" ")
      .filter((n) => n.trim().length > 0)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full items-center justify-center bg-secondary/10 text-secondary border border-secondary/20 shadow-sm",
        className
      )}
      style={{ width: size, height: size }}
    >
      {!showFallback ? (
        <Image
          src={src as string}
          alt={alt || name || "Profil"}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setHasError(true)}
          // Eger harici hostlara (S3) guveniyorsaniz Next.js konfigurasyonunda whitelisting lazim. 
          // Hata verirse zaten "onError" tetiklenip fallback yapacak.
        />
      ) : (
        <div 
          className="flex h-full w-full items-center justify-center font-bold" 
          style={{ fontSize: size * 0.4 }}
        >
          {fallbackType === "initials" && name ? (
            getInitials(name)
          ) : (
            <User style={{ width: size * 0.5, height: size * 0.5 }} />
          )}
        </div>
      )}
    </div>
  )
}
