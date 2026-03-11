"use client"

import { useEffect, useState } from "react"
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
import { Progress } from "@/components/ui/progress"
import { useBlockchain } from "@/lib/blockchain"
import { Activity, CheckCircle2, Clock, Loader2, Zap } from "lucide-react"

export default function SettlementPage() {
  const { trades, settleTrade } = useBlockchain()
  const [animatedProgress, setAnimatedProgress] = useState<Record<string, number>>({})

  // Animate progress for settling trades
  useEffect(() => {
    const settlingTrades = trades.filter((t) => t.status === "settling")
    
    settlingTrades.forEach((trade) => {
      if (animatedProgress[trade.id] === undefined) {
        setAnimatedProgress((prev) => ({ ...prev, [trade.id]: 0 }))
      }
    })

    const interval = setInterval(() => {
      setAnimatedProgress((prev) => {
        const updated = { ...prev }
        settlingTrades.forEach((trade) => {
          if (updated[trade.id] < 100) {
            updated[trade.id] = Math.min(100, (updated[trade.id] || 0) + 15)
          }
        })
        return updated
      })
    }, 300)

    return () => clearInterval(interval)
  }, [trades, animatedProgress])

  // Auto-settle pending trades for demo
  useEffect(() => {
    const pendingTrades = trades.filter((t) => t.status === "pending")
    
    pendingTrades.forEach((trade) => {
      const timeout = setTimeout(() => {
        settleTrade(trade.id)
      }, 2000)
      
      return () => clearTimeout(timeout)
    })
  }, [trades, settleTrade])

  const getStatusBadge = (status: "pending" | "settling" | "settled") => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="gap-1 border-warning/30 bg-warning/10 text-warning">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case "settling":
        return (
          <Badge variant="outline" className="gap-1 border-info/30 bg-info/10 text-info">
            <Loader2 className="h-3 w-3 animate-spin" />
            Settling
          </Badge>
        )
      case "settled":
        return (
          <Badge className="gap-1 bg-primary text-primary-foreground">
            <CheckCircle2 className="h-3 w-3" />
            Settled
          </Badge>
        )
    }
  }

  const pendingCount = trades.filter((t) => t.status === "pending").length
  const settlingCount = trades.filter((t) => t.status === "settling").length
  const settledCount = trades.filter((t) => t.status === "settled").length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settlement Monitor</h1>
        <p className="text-muted-foreground">
          Real-time tracking of blockchain trade settlements
        </p>
      </div>

      {/* Status Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/20">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-info/30 bg-info/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-info/20">
                <Loader2 className="h-6 w-6 text-info animate-spin" />
              </div>
              <div>
                <p className="text-2xl font-bold">{settlingCount}</p>
                <p className="text-sm text-muted-foreground">Settling</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{settledCount}</p>
                <p className="text-sm text-muted-foreground">Settled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settlement Feed */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Live Settlement Feed
          </CardTitle>
          <CardDescription>
            Real-time view of trades being settled on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trade ID</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade) => (
                <TableRow
                  key={trade.id}
                  className={
                    trade.status === "settling"
                      ? "bg-info/5"
                      : trade.status === "settled"
                      ? "bg-primary/5"
                      : ""
                  }
                >
                  <TableCell className="font-mono text-sm">{trade.id}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {trade.buyer}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {trade.seller}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{trade.stock}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ₹{(trade.quantity * trade.price).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(trade.status)}
                      {trade.status === "settling" && (
                        <Progress
                          value={animatedProgress[trade.id] || 0}
                          className="h-1 w-20"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {trade.status === "settled" && trade.settlementTime ? (
                      <div className="flex items-center justify-end gap-1 text-primary">
                        <Zap className="h-3 w-3" />
                        <span className="font-mono text-sm">
                          {trade.settlementTime.toFixed(1)}s
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground" suppressHydrationWarning>
                        {new Date(trade.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {trades.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No trades to display. Execute a trade to see settlement activity.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settlement Performance */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Settlement Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Average Settlement Time</span>
                <span className="font-bold text-primary">
                  {settledCount > 0
                    ? (
                        trades
                          .filter((t) => t.status === "settled")
                          .reduce((acc, t) => acc + (t.settlementTime || 3.5), 0) /
                        settledCount
                      ).toFixed(1)
                    : "3.5"}
                  s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fastest Settlement</span>
                <span className="font-bold text-primary">
                  {settledCount > 0
                    ? Math.min(
                        ...trades
                          .filter((t) => t.status === "settled")
                          .map((t) => t.settlementTime || 3.5)
                      ).toFixed(1)
                    : "2.5"}
                  s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-bold text-primary">100%</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="h-5 w-5 text-primary" />
                <span className="font-medium">Atomic DvP Settlement</span>
              </div>
              <p className="text-sm text-muted-foreground">
                All trades are settled atomically on the blockchain. Either both
                legs complete, or neither does - eliminating counterparty risk
                entirely.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
