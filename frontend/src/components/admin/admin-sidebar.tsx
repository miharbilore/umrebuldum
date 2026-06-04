"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  FileText,
  Coins,
  GraduationCap,
  MessageSquare,
  Bot,
  Settings,
  ChevronDown,
  Building2,
  UserCircle,
  Compass,
  ClipboardCheck,
  Star,
  Wallet,
  FileSpreadsheet,
  HelpCircle,
  Mail,
  Cog,
  Shield,
  ImageIcon,
  Menu,
  X,
  LucideIcon,
  FlaskConical,
  Send,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"

interface NavChild {
  name: string
  href: string
  icon: LucideIcon
}

interface NavItem {
  name: string
  href?: string
  icon: LucideIcon
  children?: NavChild[]
}

interface NavSection {
  label: string
  items: NavItem[]
}

const navigation: NavSection[] = [
  {
    label: "YÖNETİM",
    items: [
      { name: "Yönetim Paneli", href: "/admin", icon: LayoutDashboard },
      {
        name: "Kullanıcı Yönetimi",
        icon: Users,
        children: [
          { name: "Rehberler", href: "/admin/guides", icon: Compass },
          { name: "Hacılar", href: "/admin/users", icon: UserCircle },
          { name: "Acenteler", href: "/admin/agencies", icon: Building2 },
        ],
      },
      {
        name: "İlan & İçerik",
        icon: FileText,
        children: [
          { name: "Onay Bekleyenler", href: "/admin/approval/listings", icon: ClipboardCheck },
          { name: "Aktif İlanlar", href: "/admin/listings", icon: FileText },
          { name: "Değerlendirme Onayları", href: "/admin/approval/reviews", icon: Star },
        ],
      },
      { name: "Destek Talepleri", href: "/admin/support", icon: HelpCircle },
      { name: "E-Posta Kampanyaları", href: "/admin/email-campaigns", icon: Mail },
    ],
  },
  {
    label: "EKONOMİ",
    items: [
      { name: "Token & Paketler", href: "/admin/packages", icon: Coins },
      {
        name: "Mali Defter",
        icon: Wallet,
        children: [
          { name: "İşlem Geçmişi", href: "/admin/ledger", icon: FileSpreadsheet },
          { name: "Ödemeler (Yakında)", href: "#", icon: Wallet },
        ],
      },
    ],
  },
  {
    label: "SİSTEM",
    items: [
      { name: "Afiş Motoru", href: "/admin/banner-engine", icon: ImageIcon },
      { name: "Sohbet Robotu", href: "/admin/chatbot", icon: Bot },
      { name: "Site Ayarları", href: "/admin/settings", icon: Cog },
      { name: "Güvenlik & Ban Paneli", href: "/admin/fraud", icon: Shield },
      { name: "Bülten Yönetimi", href: "/admin/newsletter", icon: Send },
      { name: "Test Yönetimi", href: "/admin/tests", icon: FlaskConical },
    ],
  },
  {
    label: "HESABIM",
    items: [
      { name: "Admin Profili", href: "/admin/profile", icon: UserCircle },
      { name: "Güvenlik", href: "/admin/security", icon: Shield },
    ],
  },
]

function SidebarContent({ 
  onItemClick 
}: { onItemClick?: () => void }) {
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Kullanıcı Yönetimi", "İlan & İçerik"])

  const toggleMenu = (name: string) => {
    setExpandedMenus((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const handleNavClick = () => {
    onItemClick?.()
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <Compass className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Umrebuldum</h1>
          <p className="text-xs text-sidebar-muted">Super Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 pb-20">
        <div className="space-y-6">
          {navigation.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
                {section.label}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.name}>
                    {item.children ? (
                      <div>
                        <button
                          onClick={() => toggleMenu(item.name)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        >
                          <span className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            {item.name}
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              expandedMenus.includes(item.name) && "rotate-180"
                            )}
                          />
                        </button>
                        {expandedMenus.includes(item.name) && (
                          <ul className="mt-1 space-y-1 pl-4">
                            {item.children.map((child) => (
                              <li key={child.name}>
                                <Link
                                  href={child.href}
                                  onClick={(e) => {
                                    if (child.href === "#") e.preventDefault()
                                    else handleNavClick()
                                  }}
                                  className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors",
                                    child.href === "#" ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
                                    pathname === child.href
                                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                  )}
                                >
                                  <child.icon className="h-3.5 w-3.5" />
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href!}
                        onClick={(e) => {
                          if (item.href === "#") e.preventDefault()
                          else handleNavClick()
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          item.href === "#" ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
                          pathname === item.href
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

    </div>
  )
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-20 z-40 hidden h-[calc(100vh-5rem)] w-64 shrink-0 border-r border-sidebar-border lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent 
            onItemClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
