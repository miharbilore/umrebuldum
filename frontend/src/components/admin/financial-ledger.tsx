"use client"

import useSWR from "swr"
import { ArrowUpRight, ArrowDownRight, Coins, CreditCard, Wallet, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SmartAvatar } from "@/components/ui/smart-avatar"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Transaction {
  id: string
  type: string
  reason: string
  amount: number
  createdAt: string
  user: {
    name: string
    email: string
  }
}

export function FinancialLedger() {
  const { data: response, error, isLoading } = useSWR("/api/admin/ledger?limit=10", fetcher, {
    refreshInterval: 30000 // Refresh every 30s
  })

  const transactions: Transaction[] = response?.data || []

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "PURCHASE":
      case "GRANT":
        return <CreditCard className="h-4 w-4" />
      case "USE":
      case "SPEND":
        return <Coins className="h-4 w-4" />
      case "REFUND":
        return <ArrowDownRight className="h-4 w-4" />
      default:
        return <Wallet className="h-4 w-4" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "PURCHASE":
      case "GRANT":
      case "REFUND":
        return "bg-success/10 text-success"
      case "USE":
      case "SPEND":
        return "bg-warning/10 text-warning"
      default:
        return "bg-primary/10 text-primary"
    }
  }

  const formatDescription = (reason: string) => {
    // Basic mapping for better Turkish display
    const mapping: Record<string, string> = {
      "PURCHASE": "Token Satın Alımı",
      "USE": "Hizmet Kullanımı",
      "GRANT": "Sistem Tanımlaması",
      "REFUND": "İade İşlemi",
      "SPEND": "Harcama"
    }
    return mapping[reason] || reason
  }

  return (
    <Card className="h-full border-none shadow-sm bg-white/50 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b bg-white/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            Token ve Mali Defter
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
          </CardTitle>
          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-white">
            Canlı Akış
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[500px] overflow-y-auto overflow-x-hidden custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground italic font-medium">Defter dökülüyor...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-2 text-destructive">
              <AlertCircle className="h-8 w-8" />
              <p className="text-sm font-semibold">Veri Çekilemedi</p>
              <p className="text-xs opacity-80">API bağlantısı kurulamadı. Lütfen oturumunuzu kontrol edin.</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-2">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Wallet className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-semibold text-gray-500">Kayıt Bulunmuyor</p>
              <p className="text-xs text-muted-foreground">Henüz bir token işlemi gerçekleşmemiş.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100/50">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-4 transition-all hover:bg-white/80 group"
                >
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105", getTransactionColor(tx.type))}>
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm truncate text-gray-900 leading-tight">
                        {formatDescription(tx.type)}
                      </p>
                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className={cn(
                            "font-black tabular-nums text-sm",
                            (tx.type === "PURCHASE" || tx.type === "GRANT" || tx.type === "REFUND") ? "text-success" : "text-gray-900"
                          )}
                        >
                          {(tx.type === "PURCHASE" || tx.type === "GRANT" || tx.type === "REFUND") ? "+" : "-"}{Math.abs(tx.amount)}
                        </span>
                        <Coins className={cn("h-3 w-3", (tx.type === "PURCHASE" || tx.type === "GRANT" || tx.type === "REFUND") ? "text-success" : "text-warning")} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <SmartAvatar name={tx.user?.name || "Bilinmiyor"} size={16} />
                        <span className="text-[10px] font-medium text-muted-foreground truncate">
                          {tx.user?.name || "Sistem"}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium tabular-nums underline decoration-gray-200 underline-offset-2">
                        {new Date(tx.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
