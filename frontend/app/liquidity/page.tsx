"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Droplets, Users, Wallet, TrendingUp, Building2, BarChart3 } from "lucide-react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

const liquidityHistory = [
  { time: "Jan", liquidity: 35 },
  { time: "Feb", liquidity: 38 },
  { time: "Mar", liquidity: 42 },
  { time: "Apr", liquidity: 45 },
  { time: "May", liquidity: 48 },
  { time: "Jun", liquidity: 50 },
]

const brokerContributions = [
  { name: "Zerodha Securities", contribution: 12.5, percentage: 25 },
  { name: "ICICI Direct", contribution: 10.0, percentage: 20 },
  { name: "HDFC Securities", contribution: 8.5, percentage: 17 },
  { name: "Kotak Securities", contribution: 7.5, percentage: 15 },
  { name: "Angel One", contribution: 6.0, percentage: 12 },
  { name: "Others", contribution: 5.5, percentage: 11 },
]

export default function LiquidityPage() {
  const totalLiquidity = 50 // Cr
  const brokersContributing = 24
  const availableCapital = 42.5 // Cr
  const utilizationRate = 85

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Liquidity Pool</h1>
        <p className="text-muted-foreground">
          Pooled liquidity for instant trade settlement
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pool Liquidity
            </CardTitle>
            <Droplets className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalLiquidity} Cr</div>
            <p className="text-xs text-primary mt-1">+5.2% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Brokers Contributing
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brokersContributing}</div>
            <p className="text-xs text-muted-foreground mt-1">Active participants</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Capital
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{availableCapital} Cr</div>
            <p className="text-xs text-muted-foreground mt-1">Ready for settlement</p>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Utilization Rate
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{utilizationRate}%</div>
            <Progress value={utilizationRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Liquidity Growth Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Pool Growth
            </CardTitle>
            <CardDescription>Liquidity pool size over time (in Cr)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={liquidityHistory}>
                  <defs>
                    <linearGradient id="liquidityGradient" x1="0" y1="0" x2="0" y2="1">
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
                    tickFormatter={(value) => `₹${value}Cr`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.14 0.01 260)",
                      border: "1px solid oklch(0.25 0.01 260)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0 0)",
                    }}
                    formatter={(value: number) => [`₹${value} Cr`, "Liquidity"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="liquidity"
                    stroke="oklch(0.7 0.18 160)"
                    strokeWidth={2}
                    fill="url(#liquidityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pool Utilization Breakdown */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-primary" />
              Pool Utilization
            </CardTitle>
            <CardDescription>Current liquidity allocation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Active Settlements</span>
                  <span className="text-sm font-medium">₹7.5 Cr (15%)</span>
                </div>
                <Progress value={15} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Reserved for Large Trades</span>
                  <span className="text-sm font-medium">₹15 Cr (30%)</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Buffer Capital</span>
                  <span className="text-sm font-medium">₹5 Cr (10%)</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-primary">Available for Trading</span>
                  <span className="text-sm font-medium text-primary">₹22.5 Cr (45%)</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
              <p className="text-sm text-muted-foreground">
                The liquidity pool ensures instant settlement by maintaining
                sufficient capital reserves. Brokers contribute to the pool and
                earn returns based on utilization.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Broker Contributions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Broker Contributions
          </CardTitle>
          <CardDescription>
            Top liquidity providers in the settlement pool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Broker</TableHead>
                <TableHead className="text-right">Contribution</TableHead>
                <TableHead className="text-right">Pool Share</TableHead>
                <TableHead>Allocation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brokerContributions.map((broker) => (
                <TableRow key={broker.name}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{broker.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ₹{broker.contribution} Cr
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="font-mono">
                      {broker.percentage}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="w-32">
                      <Progress value={broker.percentage} className="h-2" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
                <Droplets className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Deep Liquidity</h3>
                <p className="text-sm text-muted-foreground">
                  ₹50 Cr pooled capital ensures instant settlement for trades of any size
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Shared Risk</h3>
                <p className="text-sm text-muted-foreground">
                  24 brokers share settlement risk, reducing individual exposure
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Capital Efficiency</h3>
                <p className="text-sm text-muted-foreground">
                  85% utilization rate maximizes returns for liquidity providers
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
