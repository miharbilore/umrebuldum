"use client"

import { useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import {
  MoreHorizontal,
  Ban,
  UserCog,
  Coins,
  Search,
  Filter,
  ArrowUpDown,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SmartAvatar } from "@/components/ui/smart-avatar"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface User {
  id: string
  fullName: string
  name: string
  email: string
  role: string
  status?: string // Optional for now
  trustScore: number
  tokenBalance: number
  createdAt: string
  isIdentityVerified: boolean
}

interface UserTableProps {
  initialRole?: string
}

export function UserTable({ initialRole = "all" }: UserTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>(initialRole)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const { data, error, isLoading, mutate } = useSWR(
    `/api/admin/users?role=${roleFilter}&search=${search}&page=${page}`,
    fetcher
  )

  // Modal States
  const [tokenModalOpen, setTokenModalOpen] = useState(false)
  const [banModalOpen, setBanModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Action States
  const [tokenInput, setTokenInput] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const openTokenModal = (user: User) => {
    setSelectedUser(user)
    setTokenInput(user.tokenBalance.toString())
    setTokenModalOpen(true)
  }

  const openBanModal = (user: User) => {
    setSelectedUser(user)
    setBanModalOpen(true)
  }

  const handleUpdateToken = async () => {
    if (!selectedUser) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenBalance: Number(tokenInput) })
      })
      if (res.ok) {
        toast.success("Kullanıcı bakiyesi başarıyla güncellendi.")
        setTokenModalOpen(false)
        mutate() // SWR re-fetch
      } else {
        const data = await res.json()
        toast.error(data.error || "Bakiye güncellenemedi.")
      }
    } catch (err) {
      toast.error("Sunucu ile bağlantı kurulamadı.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleBan = async () => {
    if (!selectedUser) return
    setActionLoading(true)
    const isBanned = selectedUser.role === "BANNED"
    
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: !isBanned })
      })
      if (res.ok) {
        toast.success(`Kullanıcı başarıyla ${isBanned ? "aktif edildi" : "engellendi"}.`)
        setBanModalOpen(false)
        mutate() // SWR re-fetch
      } else {
        const data = await res.json()
        toast.error(data.error || "İşlem başarısız.")
      }
    } catch (err) {
      toast.error("Sunucu ile bağlantı kurulamadı.")
    } finally {
      setActionLoading(false)
    }
  }

  const users: User[] = data?.users || []
  const pagination = data?.pagination || { total: 0, totalPages: 1 }

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((u) => u.id))
    }
  }

  const toggleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    )
  }

  const getRoleBadge = (role: string) => {
    switch (role.toUpperCase()) {
      case "GUIDE":
        return <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">Rehber</Badge>
      case "ORGANIZATION":
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Acente</Badge>
      case "USER":
        return <Badge variant="secondary">Hacı Adayı</Badge>
      case "ADMIN":
        return <Badge className="bg-purple-100 text-purple-700">Süper Admin</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 50) return "text-warning"
    return "text-destructive"
  }

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader className="bg-white/50 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold">Kullanıcı Yönetimi</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Sistemdeki tüm kayıtlı kullanıcıları ve yetkilerini yönetin.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="İsim, e-posta veya telefon..." 
                className="w-full md:w-64 pl-9" 
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            {/* Filters */}
            <Select value={roleFilter} onValueChange={(val) => { setRoleFilter(val); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Rol Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Roller</SelectItem>
                <SelectItem value="guide">Rehberler</SelectItem>
                <SelectItem value="organization">Acenteler</SelectItem>
                <SelectItem value="user">Hacı Adayları</SelectItem>
                <SelectItem value="admin">Adminler</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="m-4 flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50/50 p-3 transition-all animate-in fade-in slide-in-from-top-1">
            <span className="text-sm font-medium text-yellow-800">
              {selectedUsers.length} kullanıcı seçildi
            </span>
            <Button variant="outline" size="sm" className="bg-white border-yellow-200 text-yellow-800 hover:bg-yellow-100">
              <Ban className="mr-2 h-4 w-4" />
              Seçilenleri Engelle
            </Button>
            <Button variant="outline" size="sm" className="bg-white border-yellow-200 text-yellow-800 hover:bg-yellow-100">
              <Coins className="mr-2 h-4 w-4" />
              Token Tanımla
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-12 text-center">
                  <Checkbox
                    checked={users.length > 0 && selectedUsers.length === users.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="font-semibold">Kullanıcı Bilgileri</TableHead>
                <TableHead className="font-semibold">Rol</TableHead>
                <TableHead className="font-semibold">
                  <Button variant="ghost" size="sm" className="gap-1 -ml-3 font-semibold hover:bg-transparent">
                    Güven Skoru
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-right">Token Bakiyesi</TableHead>
                <TableHead className="font-semibold">Kayıt Tarihi</TableHead>
                <TableHead className="w-16 text-center">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Yükleniyor...
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Sonuç bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className={selectedUsers.includes(user.id) ? "bg-blue-50/30" : "hover:bg-muted/50 transition-colors"}>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleSelectUser(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <SmartAvatar 
                          name={user.fullName || user.name} 
                          size={40} 
                          className="border-2 border-white shadow-sm"
                        />
                        <div className="flex flex-col">
                          <p className="font-semibold text-sm leading-tight">{user.fullName || user.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                          <div 
                            className={`h-full rounded-full ${user.trustScore >= 80 ? 'bg-success' : user.trustScore >= 50 ? 'bg-warning' : 'bg-destructive'}`}
                            style={{ width: `${user.trustScore}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold leading-none ${getTrustScoreColor(user.trustScore)}`}>
                          %{user.trustScore}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="font-bold tabular-nums">{user.tokenBalance.toLocaleString()}</span>
                        <Coins className="h-3.5 w-3.5 text-warning shrink-0" />
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Hızlı İşlemler</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer">
                            <UserCog className="mr-2 h-4 w-4" />
                            Hesaba Giriş Yap (Taklit)
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => openTokenModal(user)}>
                            <Coins className="mr-2 h-4 w-4" />
                            Token Ayarla
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => openBanModal(user)}>
                            <Ban className="mr-2 h-4 w-4" />
                            {user.role === "BANNED" ? "Engeli Kaldır" : "Erişimi Engelle"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
            <p className="text-xs text-muted-foreground italic">
              Toplam {pagination.total} kullanıcı içerisinden gösteriliyor
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Geri
              </Button>
              <div className="text-sm font-medium">Sayfa {page} / {pagination.totalPages}</div>
              <Button 
                variant="outline" 
                size="sm"
                disabled={page === pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                İleri
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Token Update Modal */}
      <Dialog open={tokenModalOpen} onOpenChange={setTokenModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Token Bakiyesini Ayarla</DialogTitle>
            <DialogDescription>
              {selectedUser?.fullName || selectedUser?.name} adlı kullanıcının cüzdan bakiyesini güncelliyorsunuz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mevcut Bakiye</label>
              <div className="text-lg font-bold text-muted-foreground">{selectedUser?.tokenBalance || 0} Token</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Yeni Bakiye</label>
              <Input 
                type="number" 
                value={tokenInput} 
                onChange={e => setTokenInput(e.target.value)} 
                placeholder="Örn: 500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTokenModalOpen(false)}>İptal</Button>
            <Button onClick={handleUpdateToken} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Coins className="w-4 h-4 mr-2" />}
              {actionLoading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban / Unban Modal */}
      <Dialog open={banModalOpen} onOpenChange={setBanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erişim Durumunu Değiştir</DialogTitle>
            <DialogDescription>
              {selectedUser?.role === "BANNED" 
                ? `${selectedUser?.fullName || selectedUser?.name} adlı kullanıcının engelini kaldırmak istediğinize emin misiniz?`
                : `${selectedUser?.fullName || selectedUser?.name} adlı kullanıcının platforma erişimini tamamen engellemek istediğinize emin misiniz?`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setBanModalOpen(false)}>İptal</Button>
            <Button variant="destructive" onClick={handleToggleBan} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
              {selectedUser?.role === "BANNED" ? "Engeli Kaldır" : "Erişimi Engelle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
