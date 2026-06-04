"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ShieldAlert, AlertTriangle, Info, Eye, Mail, Ban } from "lucide-react"

export function FraudTable({ data }: { data: any[] }) {
  const handleAction = (actionName: string, id: string) => {
    toast.success(`${actionName} işlemi başarılı. (Test)`)
  }

  const getRiskBadge = (reason: string) => {
    const lowercase = reason.toLowerCase();
    if (lowercase.includes("iban") || lowercase.includes("telefon") || lowercase.includes("scam")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ShieldAlert className="w-3 h-3" /> Yüksek
        </span>
      );
    }
    if (lowercase.includes("küfür") || lowercase.includes("hakaret")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3" /> Orta
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <Info className="w-3 h-3" /> Düşük
      </span>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold">Tarih</th>
              <th className="px-6 py-4 font-semibold">Kullanıcı Adı</th>
              <th className="px-6 py-4 font-semibold">Şüpheli Aksiyon</th>
              <th className="px-6 py-4 font-semibold">Risk Skoru</th>
              <th className="px-6 py-4 font-semibold text-right">Eylemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  Kayıtlı şüpheli işlem bulunmamaktadır.
                </td>
              </tr>
            ) : (
              data.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                    {new Date(log.createdAt).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {log.message?.sender?.name || log.message?.sender?.email || "Bilinmiyor"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="max-w-md truncate" title={log.reason}>
                      {log.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRiskBadge(log.reason)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAction("İncele", log.id)}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      <Eye className="w-4 h-4 mr-1.5" /> İncele
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAction("Uyarı Gönder", log.id)}
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                    >
                      <Mail className="w-4 h-4 mr-1.5" /> Uyarı Gönder
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleAction("Hesabı Askıya Al", log.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Ban className="w-4 h-4 mr-1.5" /> Hesabı Askıya Al
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
