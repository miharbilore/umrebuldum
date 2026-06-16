"use client"

import { GraduationCap, Bot, TrendingUp, Users, MessageCircle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StatItem {
  label: string
  value: string
  change?: string
  trend?: "up" | "down"
}

const quizStats: StatItem[] = [
  { label: "Toplam Çözülen Yarışma", value: "2.847", change: "+12%", trend: "up" },
  { label: "Ortalama Başarı Oranı", value: "78%", change: "+3%", trend: "up" },
  { label: "Dağıtılan Tokenlar", value: "14.235", change: "+8%", trend: "up" },
]

const aiStats: StatItem[] = [
  { label: "Toplam Sohbet", value: "5.612", change: "+24%", trend: "up" },
  { label: "Ort. Yanıt Süresi", value: "1.2s", change: "-15%", trend: "up" },
  { label: "Çözümleme Oranı", value: "89%", change: "+5%", trend: "up" },
]

export function GamificationAIPanel() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Quiz Engine Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
              <GraduationCap className="h-4 w-4 text-warning" />
            </div>
            Bilgi Yarışması Motoru
            <Badge variant="secondary" className="ml-auto">
              Bu Hafta
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* Quiz Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quizStats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  {stat.change && (
                    <div className="flex items-center gap-1 text-xs">
                      <TrendingUp className="h-3 w-3 text-success" />
                      <span className="text-success">{stat.change}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pass Rate Visual */}
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Başarı Oranı Dağılımı</span>
                <span className="font-medium">78% Ortalama</span>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                <div className="bg-success" style={{ width: "78%" }} />
                <div className="bg-destructive" style={{ width: "22%" }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-success" />
                  Başarılı: 2.221
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-destructive" />
                  Başarısız: 626
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Chatbot Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            Yapay Zeka Sohbet Robotu
            <Badge variant="secondary" className="ml-auto bg-success/10 text-success">
              Aktif
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* AI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiStats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  {stat.change && (
                    <div className="flex items-center gap-1 text-xs">
                      <TrendingUp className="h-3 w-3 text-success" />
                      <span className="text-success">{stat.change}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Conversation Breakdown */}
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sohbet Kategorileri</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="rounded-lg bg-muted p-2 text-center">
                  <p className="text-lg font-semibold">42%</p>
                  <p className="text-xs text-muted-foreground">Rezerv.</p>
                </div>
                <div className="rounded-lg bg-muted p-2 text-center">
                  <p className="text-lg font-semibold">28%</p>
                  <p className="text-xs text-muted-foreground">Destek</p>
                </div>
                <div className="rounded-lg bg-muted p-2 text-center">
                  <p className="text-lg font-semibold">18%</p>
                  <p className="text-xs text-muted-foreground">Bilgi</p>
                </div>
                <div className="rounded-lg bg-muted p-2 text-center">
                  <p className="text-lg font-semibold">12%</p>
                  <p className="text-xs text-muted-foreground">Diğer</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
