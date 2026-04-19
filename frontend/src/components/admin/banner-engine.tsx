"use client"

import { useState } from "react"
import {
  ImageIcon,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Monitor,
  Smartphone,
  ArrowUpDown,
  Search,
  MoreHorizontal,
  ExternalLink,
  Copy,
  GripVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Banner {
  id: string
  title: string
  location: "homepage_hero" | "homepage_middle" | "sidebar" | "tour_detail" | "checkout"
  image: string
  link: string
  startDate: string
  endDate: string
  isActive: boolean
  impressions: number
  clicks: number
  ctr: number
  priority: number
  deviceTarget: "all" | "desktop" | "mobile"
}

const mockBanners: Banner[] = [
  {
    id: "1",
    title: "Ramazan Umresi Kampanyası",
    location: "homepage_hero",
    image: "/banners/ramazan-umre.jpg",
    link: "/kampanyalar/ramazan-umresi",
    startDate: "2024-02-01",
    endDate: "2024-03-15",
    isActive: true,
    impressions: 45230,
    clicks: 1245,
    ctr: 2.75,
    priority: 1,
    deviceTarget: "all",
  },
  {
    id: "2",
    title: "Yeni Rehber Kayıt Bonusu",
    location: "sidebar",
    image: "/banners/rehber-bonus.jpg",
    link: "/rehber-ol",
    startDate: "2024-01-15",
    endDate: "2024-04-30",
    isActive: true,
    impressions: 23450,
    clicks: 892,
    ctr: 3.8,
    priority: 2,
    deviceTarget: "desktop",
  },
  {
    id: "3",
    title: "Mobil Uygulamayı İndirin",
    location: "homepage_middle",
    image: "/banners/mobile-app.jpg",
    link: "/mobil-uygulama",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    isActive: true,
    impressions: 67890,
    clicks: 3456,
    ctr: 5.09,
    priority: 1,
    deviceTarget: "mobile",
  },
  {
    id: "4",
    title: "VIP Tur Paketi",
    location: "tour_detail",
    image: "/banners/vip-tur.jpg",
    link: "/vip-paketler",
    startDate: "2024-02-15",
    endDate: "2024-05-01",
    isActive: false,
    impressions: 12340,
    clicks: 234,
    ctr: 1.9,
    priority: 3,
    deviceTarget: "all",
  },
  {
    id: "5",
    title: "Jeton Al - %20 Bonus",
    location: "checkout",
    image: "/banners/token-bonus.jpg",
    link: "/token-satin-al",
    startDate: "2024-03-01",
    endDate: "2024-03-31",
    isActive: true,
    impressions: 8920,
    clicks: 567,
    ctr: 6.35,
    priority: 1,
    deviceTarget: "all",
  },
]

const locationLabels: Record<string, string> = {
  homepage_hero: "Ana Sayfa Hero",
  homepage_middle: "Ana Sayfa Orta",
  sidebar: "Yan Panel",
  tour_detail: "Tur Detay Sayfası",
  checkout: "Ödeme Sayfası",
}

const locationColors: Record<string, string> = {
  homepage_hero: "bg-primary text-primary-foreground",
  homepage_middle: "bg-blue-500/10 text-blue-600",
  sidebar: "bg-purple-500/10 text-purple-600",
  tour_detail: "bg-emerald-500/10 text-emerald-600",
  checkout: "bg-amber-500/10 text-amber-600",
}

export function BannerEngine() {
  const [banners, setBanners] = useState<Banner[]>(mockBanners)
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const filteredBanners = banners.filter((banner) => {
    const matchesSearch = banner.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLocation = locationFilter === "all" || banner.location === locationFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && banner.isActive) ||
      (statusFilter === "inactive" && !banner.isActive)
    return matchesSearch && matchesLocation && matchesStatus
  })

  const toggleBannerStatus = (id: string) => {
    setBanners((prev) =>
      prev.map((banner) =>
        banner.id === id ? { ...banner, isActive: !banner.isActive } : banner
      )
    )
  }

  const totalImpressions = banners.reduce((sum, b) => sum + b.impressions, 0)
  const totalClicks = banners.reduce((sum, b) => sum + b.clicks, 0)
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0"
  const activeBanners = banners.filter((b) => b.isActive).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Afiş Motoru</h2>
          <p className="text-sm text-muted-foreground">
            Platform genelindeki banner ve afişleri yönetin
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Yeni Afis Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Yeni Afiş Oluştur</DialogTitle>
              <DialogDescription>
                Yeni bir banner veya afiş oluşturun. Tüm alanlar zorunludur.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Afiş Başlığı</Label>
                <Input id="title" placeholder="Örnek: Ramazan Kampanyası" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Gosterim Alani</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Konum secin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homepage_hero">Ana Sayfa Hero</SelectItem>
                      <SelectItem value="homepage_middle">Ana Sayfa Orta</SelectItem>
                      <SelectItem value="sidebar">Yan Panel</SelectItem>
                      <SelectItem value="tour_detail">Tur Detay Sayfasi</SelectItem>
                      <SelectItem value="checkout">Odeme Sayfasi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="device">Cihaz Hedefi</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Cihaz seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Cihazlar</SelectItem>
                      <SelectItem value="desktop">Sadece Masaüstü</SelectItem>
                      <SelectItem value="mobile">Sadece Mobil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="link">Hedef URL</Label>
                <Input id="link" placeholder="https://umrebuldum.com/kampanya" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                  <Input id="startDate" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">Bitiş Tarihi</Label>
                  <Input id="endDate" type="date" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Afiş Görseli</Label>
                <div className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary hover:bg-muted/50">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Görsel yüklemek için tıklayın veya sürükleyin
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG max 2MB</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Öncelik Sırası</Label>
                <Input id="priority" type="number" min="1" max="10" defaultValue="1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>Afişi Oluştur</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeBanners}</p>
                <p className="text-xs text-muted-foreground">Aktif Afis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(totalImpressions / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Toplam Gosterim</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <ExternalLink className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(totalClicks / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Toplam Tiklama</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <ArrowUpDown className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgCTR}%</p>
                <p className="text-xs text-muted-foreground">Ortalama CTR</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Afis ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Konum Filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Konumlar</SelectItem>
                <SelectItem value="homepage_hero">Ana Sayfa Hero</SelectItem>
                <SelectItem value="homepage_middle">Ana Sayfa Orta</SelectItem>
                <SelectItem value="sidebar">Yan Panel</SelectItem>
                <SelectItem value="tour_detail">Tur Detay Sayfası</SelectItem>
                <SelectItem value="checkout">Ödeme Sayfası</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Banner List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Afis Listesi ({filteredBanners.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredBanners.map((banner) => (
              <div
                key={banner.id}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/30"
              >
                {/* Drag Handle */}
                <button className="cursor-grab text-muted-foreground hover:text-foreground">
                  <GripVertical className="h-5 w-5" />
                </button>

                {/* Preview */}
                <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate font-medium">{banner.title}</h4>
                    <Badge className={locationColors[banner.location]} variant="secondary">
                      {locationLabels[banner.location]}
                    </Badge>
                    {banner.deviceTarget !== "all" && (
                      <Badge variant="outline" className="gap-1">
                        {banner.deviceTarget === "desktop" ? (
                          <Monitor className="h-3 w-3" />
                        ) : (
                          <Smartphone className="h-3 w-3" />
                        )}
                        {banner.deviceTarget === "desktop" ? "Masaüstü" : "Mobil"}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {banner.startDate} - {banner.endDate}
                    </span>
                    <span>Öncelik: {banner.priority}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">{banner.impressions.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Gösterim</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{banner.clicks.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Tıklama</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-emerald-600">{banner.ctr}%</p>
                    <p className="text-xs text-muted-foreground">CTR</p>
                  </div>
                </div>

                {/* Toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={banner.isActive}
                    onCheckedChange={() => toggleBannerStatus(banner.id)}
                  />
                  <span className="w-12 text-xs text-muted-foreground">
                    {banner.isActive ? "Aktif" : "Pasif"}
                  </span>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2">
                      <Eye className="h-4 w-4" />
                      Önizleme
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Edit3 className="h-4 w-4" />
                      Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Copy className="h-4 w-4" />
                      Kopyala
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Placement Guide */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Afis Yerlesim Rehberi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(locationLabels).map(([key, label]) => (
              <div
                key={key}
                className="rounded-lg border border-border bg-muted/30 p-4 text-center"
              >
                <div
                  className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${locationColors[key]}`}
                >
                  <ImageIcon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {banners.filter((b) => b.location === key && b.isActive).length} aktif
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
