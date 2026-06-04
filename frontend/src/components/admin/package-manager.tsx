"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Save, Plus, Trash2 } from "lucide-react"

export function PackageManager() {
  const [packages, setPackages] = useState<any[]>([])
  const [tokenPackages, setTokenPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [tokenSaving, setTokenSaving] = useState<string | null>(null)

  const loadData = () => {
    Promise.all([
      fetch("/api/admin/packages").then(res => res.json()),
      fetch("/api/admin/token-packages").then(res => res.json())
    ])
    .then(([pkgData, tokenData]) => {
      if (Array.isArray(pkgData)) {
        // Ensure features is an object
        const parsedPkgs = pkgData.map(p => ({
          ...p,
          features: typeof p.features === 'string' ? JSON.parse(p.features) : (p.features || {})
        }))
        setPackages(parsedPkgs)
      }
      if (Array.isArray(tokenData)) setTokenPackages(tokenData)
      setLoading(false)
    })
    .catch(() => {
      toast.error("Veriler yüklenemedi")
      setLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async (pkg: any) => {
    setSaving(pkg.id || "new")
    try {
      const isNew = pkg.id.startsWith("new_")
      const method = isNew ? "POST" : "PUT"
      
      const payload = { ...pkg }
      if (isNew) delete payload.id

      const res = await fetch("/api/admin/packages", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`${pkg.name} başarıyla ${isNew ? "eklendi" : "güncellendi"}!`)
        loadData() // Yeniden yükle
      } else {
        toast.error(data.error || "Hata oluştu.")
      }
    } catch (error) {
      toast.error("Sunucu ile iletişim kurulamadı.")
    } finally {
      setSaving(null)
    }
  }

  const handleDelete = async (pkgId: string, pkgName: string) => {
    if (pkgId.startsWith("new_")) {
      setPackages(prev => prev.filter(p => p.id !== pkgId))
      return
    }
    
    if (!window.confirm(`${pkgName} paketini silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/packages?id=${pkgId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        toast.success(`${pkgName} başarıyla silindi.`)
        loadData()
      } else {
        const data = await res.json()
        toast.error(data.error || "Hata oluştu.")
      }
    } catch (error) {
      toast.error("Sunucu ile iletişim kurulamadı.")
    }
  }

  const handleTokenSave = async (tokenPkg: any) => {
    setTokenSaving(tokenPkg.id)
    try {
      const res = await fetch("/api/admin/token-packages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tokenPkg)
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Token paketi başarıyla güncellendi!`)
      } else {
        toast.error(data.error || "Hata oluştu.")
      }
    } catch (error) {
      toast.error("Sunucu ile iletişim kurulamadı.")
    } finally {
      setTokenSaving(null)
    }
  }

  const updateField = (id: string, field: string, value: any) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const updateFeature = (id: string, featureKey: string, value: any) => {
    setPackages(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          features: {
            ...(p.features || {}),
            [featureKey]: value
          }
        }
      }
      return p
    }))
  }

  const updateTokenField = (id: string, field: string, value: any) => {
    setTokenPackages(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const addNewPackage = () => {
    const newPkg = {
      id: `new_${Date.now()}`,
      name: "Yeni Paket",
      slug: "YENI_PAKET",
      priceTRY: 0,
      monthlyPrice: 0,
      credits: 0,
      billingPeriod: 1,
      roleTarget: "GUIDE",
      sortOrder: packages.length,
      features: {
        offerCost: 5,
        hasBlogFeature: false,
        hasPosterGenerator: true,
        posterHasWatermark: true,
        dailyListingLimit: 5
      }
    }
    setPackages(prev => [...prev, newPkg])
  }

  if (loading) return <div className="text-center py-10">Yükleniyor...</div>

  return (
    <div className="space-y-12">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Abonelik Paketleri</h2>
          <Button onClick={addNewPackage}><Plus className="w-4 h-4 mr-2" /> Yeni Paket Ekle</Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-4 gap-4">
                <Input 
                  value={pkg.name} 
                  onChange={(e) => updateField(pkg.id, "name", e.target.value)} 
                  className="font-bold text-lg h-10"
                  placeholder="Paket Adı"
                />
                <div className="text-sm text-gray-500 shrink-0">
                  {pkg.id.startsWith("new_") ? "Yeni" : `ID: ${pkg.id.slice(-5)}`}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slug (Benzersiz Kimlik)</Label>
                  <Input 
                    value={pkg.slug} 
                    onChange={(e) => updateField(pkg.id, "slug", e.target.value)} 
                    placeholder="ORN: PRO_YILLIK"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hedef Kitle</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={pkg.roleTarget}
                    onChange={(e) => updateField(pkg.id, "roleTarget", e.target.value)}
                  >
                    <option value="GUIDE">Sadece Rehberler</option>
                    <option value="ORGANIZATION">Sadece Acenteler</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Toplam Fiyat (TRY)</Label>
                  <Input 
                    type="number" 
                    value={pkg.priceTRY} 
                    onChange={(e) => updateField(pkg.id, "priceTRY", Number(e.target.value))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Aylık Gösterge Fiyatı</Label>
                  <Input 
                    type="number" 
                    value={pkg.monthlyPrice} 
                    onChange={(e) => updateField(pkg.id, "monthlyPrice", Number(e.target.value))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Aylık Token Getirisi</Label>
                  <Input 
                    type="number" 
                    value={pkg.credits} 
                    onChange={(e) => updateField(pkg.id, "credits", Number(e.target.value))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Periyot (Ay)</Label>
                  <Input 
                    type="number" 
                    value={pkg.billingPeriod} 
                    onChange={(e) => updateField(pkg.id, "billingPeriod", Number(e.target.value))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gösterim Sırası</Label>
                  <Input 
                    type="number" 
                    value={pkg.sortOrder || 0} 
                    onChange={(e) => updateField(pkg.id, "sortOrder", Number(e.target.value))} 
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-2">
                <h4 className="font-semibold mb-3 text-sm text-slate-500 uppercase tracking-wider">Özellikler & Limitler</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Teklif Maliyeti (Token)</Label>
                    <Input 
                      type="number" 
                      value={pkg.features?.offerCost ?? 5} 
                      onChange={(e) => updateFeature(pkg.id, "offerCost", Number(e.target.value))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Günlük İlan Limiti</Label>
                    <Input 
                      type="number" 
                      value={pkg.features?.dailyListingLimit ?? 5} 
                      onChange={(e) => updateFeature(pkg.id, "dailyListingLimit", Number(e.target.value))} 
                    />
                  </div>
                </div>

                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Blog Yazma Yetkisi</Label>
                    <Switch 
                      checked={!!pkg.features?.hasBlogFeature} 
                      onCheckedChange={(c) => updateFeature(pkg.id, "hasBlogFeature", c)} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Afiş Oluşturucu</Label>
                    <Switch 
                      checked={!!pkg.features?.hasPosterGenerator} 
                      onCheckedChange={(c) => updateFeature(pkg.id, "hasPosterGenerator", c)} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Afişte Filigran Olsun Mu?</Label>
                    <Switch 
                      checked={!!pkg.features?.posterHasWatermark} 
                      onCheckedChange={(c) => updateFeature(pkg.id, "posterHasWatermark", c)} 
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  className="flex-1" 
                  onClick={() => handleSave(pkg)}
                  disabled={saving === pkg.id}
                >
                  {saving === pkg.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {saving === pkg.id ? "Kaydediliyor..." : "Kaydet"}
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleDelete(pkg.id, pkg.name)}
                  disabled={saving === pkg.id}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {packages.length === 0 && (
            <div className="col-span-2 text-center text-gray-500 py-10">
              Paket konfigürasyonları henüz oluşturulmamış. Yeni Paket Ekle butonunu kullanın.
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Alakart Token Paketleri</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {tokenPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-lg font-bold">{pkg.packageId.toUpperCase()}</h3>
                <Switch 
                  checked={pkg.isActive} 
                  onCheckedChange={(c) => updateTokenField(pkg.id, "isActive", c)} 
                />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Token Miktarı</Label>
                  <Input 
                    type="number" 
                    value={pkg.tokens} 
                    onChange={(e) => updateTokenField(pkg.id, "tokens", Number(e.target.value))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Satış Fiyatı (TRY)</Label>
                  <Input 
                    type="number" 
                    value={pkg.priceTRY} 
                    onChange={(e) => updateTokenField(pkg.id, "priceTRY", Number(e.target.value))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Birim Fiyatı (TRY)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={pkg.unitPrice} 
                    onChange={(e) => updateTokenField(pkg.id, "unitPrice", Number(e.target.value))} 
                  />
                </div>
              </div>

              <Button 
                className="w-full mt-4" 
                onClick={() => handleTokenSave(pkg)}
                disabled={tokenSaving === pkg.id}
              >
                {tokenSaving === pkg.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {tokenSaving === pkg.id ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          ))}

          {tokenPackages.length === 0 && (
            <div className="col-span-3 text-center text-gray-500 py-10">
              Token paketleri henüz veritabanında yok.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
