"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, Clock, Zap, TrendingUp, Droplets, Activity } from "lucide-react"

interface Trade {
  exchange: string
  stock: string
  quantity: number
  price: number
  timestamp: number
}

interface Arbitrage {
  buyPrice: number
  sellPrice: number
  profitPerShare: number
  quantity: number
  timestamp: number
}

interface Settlement {
  hash: string
  block: number
  trades: number
  timestamp: number
}

export default function DashboardPage() {
  const [liveTrades, setLiveTrades] = useState<Trade[]>([])
  const [arbitrages, setArbitrages] = useState<Arbitrage[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])

  useEffect(() => {
    const sse = new EventSource("http://localhost:5000/api/events")
    
    sse.addEventListener("nse_trade", (e) => {
      const trade = JSON.parse(e.data)
      setLiveTrades(prev => [trade, ...prev].slice(0, 50))
    })

    sse.addEventListener("bse_trade", (e) => {
      const trade = JSON.parse(e.data)
      setLiveTrades(prev => [trade, ...prev].slice(0, 50))
    })

    sse.addEventListener("arbitrage", (e) => {
      const arb = JSON.parse(e.data)
      setArbitrages(prev => [arb, ...prev].slice(0, 20))
    })

    sse.addEventListener("settlement", (e) => {
      const data = JSON.parse(e.data)
      setSettlements(prev => [data, ...prev].slice(0, 20))
    })

    return () => sse.close()
  }, [])

  const metrics = [
    {
      title: "Active Settlements",
      value: settlements.length.toString(),
      icon: Activity,
    },
    {
      title: "Arbitrage Opportunities",
      value: arbitrages.length.toString(),
      icon: TrendingUp,
    },
    {
      title: "Capital Locked (T+1)",
      value: `₹${(liveTrades.reduce((acc, t) => acc + (t.price * t.quantity), 0)).toLocaleString()}`,
      description: "Would be locked for 24h",
      icon: Clock,
    },
    {
      title: "Total Settled via Blockchain",
      value: `₹${(settlements.length * 150000).toLocaleString()}`, // rough avg
      description: "Instantly settled (T+0)",
      icon: Zap,
      highlight: true,
    },
    {
      title: "Liquidity Pool Active",
      value: "Yes",
      description: "Funding Cross-Exchange Atomic settlement",
      icon: Droplets,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cross-Exchange Settlement Simulator</h1>
        <p className="text-muted-foreground">
          Real-time orchestration between NSE and BSE simulated engines via smart contracts.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
              {metric.description && (
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Simulation Feeds */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Live Trades Feed */}
        <Card className="col-span-1 border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Live Order Feed</CardTitle>
              <Badge variant="outline" className="animate-pulse bg-green-500/10 text-green-500 border-green-500/20">Live</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] overflow-y-auto">
            <div className="space-y-4">
              {liveTrades.length === 0 && <p className="text-sm text-muted-foreground">Waiting for trades...</p>}
              {liveTrades.map((t, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-card text-sm">
                  <div>
                    <span className={`font-bold ${t.exchange === 'NSE' ? 'text-blue-500' : 'text-orange-500'}`}>{t.exchange}</span>
                    <span className="ml-2">{t.stock}</span>
                  </div>
                  <div>
                    {t.quantity} @ ₹{t.price}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Arbitrage & Settlement */}
        <div className="col-span-2 space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Arbitrage Detection
              </CardTitle>
              <CardDescription>Matching cross-exchange spreads</CardDescription>
            </CardHeader>
            <CardContent className="h-[150px] overflow-y-auto">
              {arbitrages.length === 0 && <p className="text-sm text-muted-foreground">Scanning for price discrepancies...</p>}
              <div className="space-y-2">
                {arbitrages.map((arb, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                    <div className="flex flex-col">
                      <span className="text-primary font-medium">Arbitrage Found</span>
                      <span className="text-xs text-muted-foreground">Buy NSE ₹{arb.buyPrice} → Sell BSE ₹{arb.sellPrice}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-500">+ ₹{arb.profitPerShare * arb.quantity}</div>
                      <div className="text-xs text-muted-foreground">{arb.quantity} shares</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Atomic Batch Settlements
              </CardTitle>
              <CardDescription>Blockchain Tx History (Funded via Liquidity Pool)</CardDescription>
            </CardHeader>
            <CardContent className="h-[150px] overflow-y-auto">
              {settlements.length === 0 && <p className="text-sm text-muted-foreground">Waiting for batch settlements...</p>}
              <div className="space-y-2">
                {settlements.map((s, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg border text-sm">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs">{s.hash.slice(0, 10)}...{s.hash.slice(-8)}</span>
                      <span className="text-xs text-muted-foreground">Block: {s.block}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {s.trades} Trades Batched
                      </Badge>
                      <Badge variant="default" className="bg-green-500">
                        Settled
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
