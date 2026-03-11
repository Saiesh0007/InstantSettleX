"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useBlockchain } from "@/lib/blockchain"
import { Wallet, TrendingUp, TrendingDown, PieChart } from "lucide-react"
import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = [
  "oklch(0.7 0.18 160)",
  "oklch(0.65 0.15 200)",
  "oklch(0.75 0.15 80)",
  "oklch(0.6 0.18 280)",
]

export default function PortfolioPage() {
  const { portfolio, inrBalance, wallet } = useBlockchain()

  const totalValue = portfolio.reduce((acc, p) => acc + p.currentValue, 0)
  const totalInvested = portfolio.reduce((acc, p) => acc + p.avgPrice * p.quantity, 0)
  const totalPnL = totalValue - totalInvested
  const pnlPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

  const pieData = portfolio.map((p) => ({
    name: p.stock,
    value: p.currentValue,
  }))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Portfolio</h1>
        <p className="text-muted-foreground">
          Your tokenized stock holdings and balances
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Portfolio Value
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalValue.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {portfolio.length} holdings
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invested
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalInvested.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cost basis</p>
          </CardContent>
        </Card>

        <Card
          className={`border-border/50 ${
            totalPnL >= 0 ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total P&L
            </CardTitle>
            {totalPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-primary" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalPnL >= 0 ? "text-primary" : "text-destructive"
              }`}
            >
              {totalPnL >= 0 ? "+" : ""}₹{totalPnL.toLocaleString("en-IN")}
            </div>
            <p
              className={`text-xs mt-1 ${
                totalPnL >= 0 ? "text-primary" : "text-destructive"
              }`}
            >
              {totalPnL >= 0 ? "+" : ""}
              {pnlPercentage.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              INR Token Balance
            </CardTitle>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              Liquid
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{inrBalance.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Available for trading</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Holdings Table */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
            <CardDescription>Your tokenized stock positions</CardDescription>
          </CardHeader>
          <CardContent>
            {wallet.isConnected ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Avg Price</TableHead>
                    <TableHead className="text-right">Current Value</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio.map((holding) => {
                    const invested = holding.avgPrice * holding.quantity
                    const pnl = holding.currentValue - invested
                    const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0

                    return (
                      <TableRow key={holding.stock}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-semibold text-primary">
                                {holding.stock.slice(0, 2)}
                              </span>
                            </div>
                            <span className="font-medium">{holding.stock}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {holding.quantity}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ₹{holding.avgPrice.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          ₹{holding.currentValue.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className={`flex items-center justify-end gap-1 ${
                              pnl >= 0 ? "text-primary" : "text-destructive"
                            }`}
                          >
                            {pnl >= 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            <span className="font-mono">
                              {pnl >= 0 ? "+" : ""}
                              {pnlPercent.toFixed(2)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Connect your wallet to view portfolio
              </div>
            )}
          </CardContent>
        </Card>

        {/* Allocation Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Allocation
            </CardTitle>
            <CardDescription>Portfolio distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {wallet.isConnected && portfolio.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.14 0.01 260)",
                          border: "1px solid oklch(0.25 0.01 260)",
                          borderRadius: "8px",
                          color: "oklch(0.95 0 0)",
                        }}
                        formatter={(value: number) => [
                          `₹${value.toLocaleString("en-IN")}`,
                          "Value",
                        ]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {portfolio.map((holding, index) => {
                    const percentage = totalValue > 0 ? (holding.currentValue / totalValue) * 100 : 0
                    return (
                      <div key={holding.stock} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">{holding.stock}</span>
                        </div>
                        <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">
                {wallet.isConnected ? "No holdings yet" : "Connect wallet to view"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
