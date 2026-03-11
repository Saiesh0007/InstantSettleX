"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useBlockchain } from "@/lib/blockchain"
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  TrendingUp,
  Droplets,
  Activity,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

const volumeData = [
  { time: "9:00", volume: 2400 },
  { time: "10:00", volume: 4200 },
  { time: "11:00", volume: 5800 },
  { time: "12:00", volume: 3200 },
  { time: "13:00", volume: 6100 },
  { time: "14:00", volume: 7200 },
  { time: "15:00", volume: 8400 },
]

const settlementComparison = [
  { method: "T+1", time: 86400, label: "Traditional" },
  { method: "Blockchain", time: 4, label: "InstantSettleX" },
]

export default function DashboardPage() {
  const { trades } = useBlockchain()

  const settledTrades = trades.filter((t) => t.status === "settled")
  const avgSettlementTime =
    settledTrades.length > 0
      ? settledTrades.reduce((acc, t) => acc + (t.settlementTime || 3.5), 0) / settledTrades.length
      : 3.5

  const metrics = [
    {
      title: "Total Trades Today",
      value: trades.length.toString(),
      change: "+12%",
      trend: "up",
      icon: Activity,
    },
    {
      title: "Avg Settlement Time",
      value: `${avgSettlementTime.toFixed(1)}s`,
      change: "-0.3s",
      trend: "up",
      icon: Zap,
    },
    {
      title: "Capital Locked (Traditional)",
      value: "₹2.4Cr",
      description: "T+1 Settlement",
      icon: Clock,
      highlight: false,
    },
    {
      title: "Capital Locked (Blockchain)",
      value: "₹0",
      description: "Instant Settlement",
      icon: Zap,
      highlight: true,
    },
    {
      title: "Liquidity Pool Size",
      value: "₹50Cr",
      change: "+5.2%",
      trend: "up",
      icon: Droplets,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time overview of blockchain settlement performance
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metrics.map((metric) => (
          <Card
            key={metric.title}
            className={
              metric.highlight
                ? "border-primary/30 bg-primary/5"
                : "border-border/50 bg-card"
            }
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon
                className={`h-4 w-4 ${metric.highlight ? "text-primary" : "text-muted-foreground"}`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.change && (
                <div className="flex items-center gap-1 text-xs">
                  {metric.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 text-primary" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-destructive" />
                  )}
                  <span className={metric.trend === "up" ? "text-primary" : "text-destructive"}>
                    {metric.change}
                  </span>
                  <span className="text-muted-foreground">vs yesterday</span>
                </div>
              )}
              {metric.description && (
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trade Volume Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trade Volume
            </CardTitle>
            <CardDescription>Hourly trading activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.7 0.18 160)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="oklch(0.7 0.18 160)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" />
                  <XAxis
                    dataKey="time"
                    stroke="oklch(0.65 0 0)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="oklch(0.65 0 0)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.14 0.01 260)",
                      border: "1px solid oklch(0.25 0.01 260)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0 0)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="oklch(0.7 0.18 160)"
                    strokeWidth={2}
                    fill="url(#volumeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Settlement Comparison */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Settlement Time Comparison
            </CardTitle>
            <CardDescription>Traditional T+1 vs Blockchain instant settlement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={settlementComparison} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" />
                  <XAxis
                    type="number"
                    stroke="oklch(0.65 0 0)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => (value >= 3600 ? `${value / 3600}h` : `${value}s`)}
                  />
                  <YAxis
                    dataKey="label"
                    type="category"
                    stroke="oklch(0.65 0 0)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.14 0.01 260)",
                      border: "1px solid oklch(0.25 0.01 260)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0 0)",
                    }}
                    formatter={(value: number) =>
                      value >= 3600 ? `${(value / 3600).toFixed(0)} hours` : `${value} seconds`
                    }
                  />
                  <Bar
                    dataKey="time"
                    radius={[0, 4, 4, 0]}
                    fill="oklch(0.7 0.18 160)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settlement Flow Comparison */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Settlement Flow Comparison</CardTitle>
          <CardDescription>
            How blockchain revolutionizes stock settlement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Traditional Flow */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-destructive border-destructive/30">
                  Traditional
                </Badge>
                <span className="text-sm text-muted-foreground">T+1 Settlement</span>
              </div>
              <div className="flex items-center gap-2">
                {["Trade", "Clearing", "Netting", "Settlement"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className="flex h-10 items-center justify-center rounded-lg border border-border bg-secondary px-3 text-sm">
                      {step}
                    </div>
                    {i < 3 && (
                      <div className="h-px w-4 bg-border" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Capital locked for 24+ hours during settlement process
              </p>
            </div>

            {/* Blockchain Flow */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground">
                  Blockchain
                </Badge>
                <span className="text-sm text-muted-foreground">Instant Settlement</span>
              </div>
              <div className="flex items-center gap-2">
                {["Trade", "Smart Contract", "Instant Settlement"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className="flex h-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 px-3 text-sm text-primary">
                      {step}
                    </div>
                    {i < 2 && (
                      <Zap className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-primary">
                Atomic settlement in 3-5 seconds with zero counterparty risk
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
