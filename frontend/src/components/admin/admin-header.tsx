"use client"

import { useState } from "react"
import { Search, Bell, Command, ChevronDown, LogOut, UserCog, FileText, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { SmartAvatar } from "@/components/ui/smart-avatar"

interface Notification {
  id: string
  type: "listing" | "ticket" | "review"
  message: string
  time: string
}

interface AdminHeaderProps {
  pendingListings: number
  pendingTickets: number
  notifications: Notification[]
}

export function AdminHeader({ pendingListings, pendingTickets, notifications }: AdminHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const totalPending = pendingListings + pendingTickets

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
        {/* Mobile spacer for hamburger menu */}
        <div className="w-10 lg:hidden" />

        {/* Search - Hidden on mobile, visible on tablet+ */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden h-10 w-full max-w-md items-center gap-3 rounded-lg border border-input bg-background px-4 text-sm text-muted-foreground transition-colors hover:border-ring hover:bg-muted/50 md:flex lg:w-96"
        >
          <Search className="h-4 w-4" />
          <span className="truncate">Kullanıcı, ilan veya işlem ara...</span>
          <div className="ml-auto hidden items-center gap-1 lg:flex">
            <Kbd>
              <Command className="h-3 w-3" />
            </Kbd>
            <Kbd>K</Kbd>
          </div>
        </button>

        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Quick Stats Badges - Hidden on mobile */}
          <div className="mr-2 hidden items-center gap-2 lg:mr-4 lg:flex lg:gap-3">
            <div className="flex items-center gap-1.5 rounded-lg bg-warning/10 px-2 py-1.5 lg:gap-2 lg:px-3">
              <FileText className="h-4 w-4 text-warning" />
              <span className="text-xs font-medium text-warning lg:text-sm">
                <span className="hidden lg:inline">{pendingListings} Bekleyen İlan</span>
                <span className="lg:hidden">{pendingListings}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-2 py-1.5 lg:gap-2 lg:px-3">
              <MessageSquare className="h-4 w-4 text-destructive" />
              <span className="text-xs font-medium text-destructive lg:text-sm">
                <span className="hidden lg:inline">{pendingTickets} Destek Talebi</span>
                <span className="lg:hidden">{pendingTickets}</span>
              </span>
            </div>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {totalPending > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive p-0 text-xs font-semibold text-destructive-foreground">
                    {totalPending > 99 ? "99+" : totalPending}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Bildirimler</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 py-3">
                    <span className="text-sm font-medium">{notif.message}</span>
                    <span className="text-xs text-muted-foreground">{notif.time}</span>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Yeni bildirim yok
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Admin Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 px-2">
                <SmartAvatar 
                  name="Süper Admin" 
                  size={32} 
                  className="bg-primary text-primary-foreground border-none"
                />
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium">Süper Admin</p>
                  <p className="text-xs text-muted-foreground">Kök Erişim</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserCog className="mr-2 h-4 w-4" />
                Hesap Ayarları
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Oturumu Kapat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Command-K Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Hızlı Arama</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Kullanıcı, ilan veya işlem ara..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Hızlı İşlemler</p>
              <div className="grid gap-2">
                <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted">
                  <Search className="h-4 w-4" />
                  <span>Kullanıcı Ara</span>
                  <span className="ml-auto text-xs text-muted-foreground">users:</span>
                </button>
                <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted">
                  <Search className="h-4 w-4" />
                  <span>İlan Ara</span>
                  <span className="ml-auto text-xs text-muted-foreground">listing:</span>
                </button>
                <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted">
                  <Search className="h-4 w-4" />
                  <span>İşlem Ara</span>
                  <span className="ml-auto text-xs text-muted-foreground">tx:</span>
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
