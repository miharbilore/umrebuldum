"use client"

import { useState, useEffect } from "react"
import {
  Coins,
  Settings,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Percent,
  DollarSign,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TokenPurchase {
  id: string
  user: string
  amount: number
  price: number
  timestamp: string
}

const initialPurchases: TokenPurchase[] = [
  { id: "TX-001", user: "Ali Hassan", amount: 500, price: 25.0, timestamp: "Just now" },
  { id: "TX-002", user: "Fatma Kaya", amount: 1000, price: 50.0, timestamp: "2 min ago" },
  { id: "TX-003", user: "Omar Abdullah", amount: 200, price: 10.0, timestamp: "5 min ago" },
  { id: "TX-004", user: "Ayşe Özkan", amount: 750, price: 37.5, timestamp: "8 min ago" },
  { id: "TX-005", user: "Mehmet Yılmaz", amount: 300, price: 15.0, timestamp: "12 min ago" },
]

export function TokenEconomy() {
  const [tokenPrice, setTokenPrice] = useState("0.05")
  const [commissionRate, setCommissionRate] = useState("15")
  const [purchases, setPurchases] = useState<TokenPurchase[]>(initialPurchases)
  const [isEditing, setIsEditing] = useState(false)

  // Simulate live feed
  useEffect(() => {
    const interval = setInterval(() => {
      const newPurchase: TokenPurchase = {
        id: `TX-${Date.now()}`,
        user: ["Sarah Ahmed", "Mustafa Can", "Zeynep Kara", "Hassan Ali"][Math.floor(Math.random() * 4)],
        amount: Math.floor(Math.random() * 900) + 100,
        price: 0,
        timestamp: "Just now",
      }
      newPurchase.price = newPurchase.amount * parseFloat(tokenPrice)

      setPurchases((prev) => {
        const updated = [newPurchase, ...prev.slice(0, 9)]
        // Update timestamps
        return updated.map((p, i) => ({
          ...p,
          timestamp:
            i === 0
              ? "Just now"
              : i < 3
                ? `${i * 2 + 1} min ago`
                : `${i * 3} min ago`,
        }))
      })
    }, 8000)

    return () => clearInterval(interval)
  }, [tokenPrice])

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Token Settings */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <Settings className="h-5 w-5" />
              </div>
              <CardTitle>Token Settings</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Token Price */}
          <div className="space-y-3">
            <Label htmlFor="tokenPrice" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Price per Token (USD)
            </Label>
            <div className="flex gap-2">
              <Input
                id="tokenPrice"
                type="number"
                step="0.01"
                value={tokenPrice}
                onChange={(e) => setTokenPrice(e.target.value)}
                disabled={!isEditing}
                className="font-mono"
              />
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Save" : "Edit"}
              </Button>
            </div>
          </div>

          {/* Commission Rate */}
          <div className="space-y-3">
            <Label htmlFor="commission" className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              Platform Commission Rate
            </Label>
            <div className="flex gap-2">
              <Input
                id="commission"
                type="number"
                step="1"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                disabled={!isEditing}
                className="font-mono"
              />
              <span className="flex items-center text-muted-foreground">%</span>
            </div>
          </div>

          <Separator />

          {/* Quick Stats */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Economy Overview</h4>
            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Total Tokens Minted</span>
                <span className="font-semibold">5.2M</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Tokens in Circulation</span>
                <span className="font-semibold">2.4M</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Platform Treasury</span>
                <span className="font-semibold">2.8M</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-success/10 p-3">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <span className="font-semibold text-success">$284,392</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Purchase Feed */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Live Token Purchases</CardTitle>
                <p className="text-sm text-muted-foreground">Real-time transaction stream</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {purchases.map((purchase, index) => (
                <div
                  key={`${purchase.id}-${index}`}
                  className={`flex items-center justify-between rounded-lg border p-4 transition-all ${
                    index === 0 ? "border-success/50 bg-success/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {purchase.user.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{purchase.user}</p>
                      <p className="text-xs text-muted-foreground">{purchase.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-1 font-medium">
                        <Coins className="h-4 w-4 text-warning" />
                        {purchase.amount.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ${purchase.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {index === 0 && (
                        <RefreshCw className="h-3 w-3 animate-spin text-success" />
                      )}
                      <span>{purchase.timestamp}</span>
                      <ArrowUpRight className="h-4 w-4 text-success" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
