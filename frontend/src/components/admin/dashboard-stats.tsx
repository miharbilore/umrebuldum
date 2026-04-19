"use client"

import { TrendingUp, TrendingDown, Users, Coins, AlertCircle, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts"

interface StatCardProps {
  title: string
  value: string
  change: number
  changeLabel: string
  icon: React.ReactNode
  sparklineData: number[]
  variant?: "default" | "warning" | "success"
}

function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  sparklineData,
  variant = "default",
}: StatCardProps) {
  const isPositive = change >= 0
  const chartData = sparklineData.map((v, i) => ({ value: v, index: i }))

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            variant === "warning"
              ? "bg-warning/10 text-warning"
              : variant === "success"
                ? "bg-success/10 text-success"
                : "bg-primary/10 text-primary"
          }`}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`gap-1 ${
                  isPositive
                    ? "bg-success/10 text-success hover:bg-success/10"
                    : "bg-destructive/10 text-destructive hover:bg-destructive/10"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {isPositive ? "+" : ""}
                {change}%
              </Badge>
              <span className="text-xs text-muted-foreground">{changeLabel}</span>
            </div>
          </div>
          <div className="h-12 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={
                        variant === "warning"
                          ? "hsl(45, 100%, 50%)"
                          : variant === "success"
                            ? "hsl(155, 100%, 30%)"
                            : "hsl(220, 60%, 30%)"
                      }
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor={
                        variant === "warning"
                          ? "hsl(45, 100%, 50%)"
                          : variant === "success"
                            ? "hsl(155, 100%, 30%)"
                            : "hsl(220, 60%, 30%)"
                      }
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={
                    variant === "warning"
                      ? "hsl(45, 100%, 50%)"
                      : variant === "success"
                        ? "hsl(155, 100%, 30%)"
                        : "hsl(220, 60%, 30%)"
                  }
                  fill={`url(#gradient-${title})`}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DashboardStatsProps {
  stats: {
    totalRevenue: string
    revenueChange: number
    activeSubscriptions: string
    subscriptionChange: number
    tokensInCirculation: string
    tokenChange: number
    pendingApprovals: number
    approvalChange: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Toplam Platform Geliri"
        value={stats.totalRevenue}
        change={stats.revenueChange}
        changeLabel="geçen aya göre"
        icon={<DollarSign className="h-5 w-5" />}
        sparklineData={[20, 25, 30, 28, 35, 40, 38, 45, 50, 48, 55, 60]}
        variant="success"
      />
      <StatCard
        title="Aktif Abonelikler"
        value={stats.activeSubscriptions}
        change={stats.subscriptionChange}
        changeLabel="geçen aya göre"
        icon={<Users className="h-5 w-5" />}
        sparklineData={[100, 110, 105, 120, 130, 125, 140, 150, 145, 160, 170, 180]}
      />
      <StatCard
        title="Dolaşımdaki Token"
        value={stats.tokensInCirculation}
        change={stats.tokenChange}
        changeLabel="ekonomi sağlığı"
        icon={<Coins className="h-5 w-5" />}
        sparklineData={[250, 245, 260, 255, 248, 240, 235, 230, 245, 240, 235, 230]}
        variant="warning"
      />
      <StatCard
        title="Bekleyen Onaylar"
        value={stats.pendingApprovals.toString()}
        change={stats.approvalChange}
        changeLabel="acil aksiyon"
        icon={<AlertCircle className="h-5 w-5" />}
        sparklineData={[5, 8, 12, 10, 15, 18, 20, 22, 19, 21, 23, 25]}
        variant="warning"
      />
    </div>
  )
}
