"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useBlockchain } from "@/lib/blockchain"
import { toast } from "sonner"
import { ArrowUpRight, ArrowDownRight, Zap, CheckCircle2, Copy, ExternalLink } from "lucide-react"

const stocks = [
  { symbol: "TCS", name: "Tata Consultancy Services", price: 3450.5, change: 1.2 },
  { symbol: "Reliance", name: "Reliance Industries", price: 2890.75, change: -0.8 },
  { symbol: "Infosys", name: "Infosys Limited", price: 1520.25, change: 2.1 },
]

export default function TradePage() {
  const { wallet, executeTrade, inrBalance } = useBlockchain()
  const [selectedStock, setSelectedStock] = useState<string>("")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [tradeResult, setTradeResult] = useState<{
    type: "buy" | "sell"
    stock: string
    quantity: number
    price: number
    settlementTime: number
    txHash: string
  } | null>(null)

  const selectedStockData = stocks.find((s) => s.symbol === selectedStock)

  const handleStockChange = (value: string) => {
    setSelectedStock(value)
    const stock = stocks.find((s) => s.symbol === value)
    if (stock) {
      setPrice(stock.price.toString())
    }
  }

  const handleTrade = async (type: "buy" | "sell") => {
    if (!wallet.isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!selectedStock || !quantity || !price) {
      toast.error("Please fill in all fields")
      return
    }

    const qty = parseInt(quantity)
    const prc = parseFloat(price)
    const total = qty * prc

    if (type === "buy" && total > inrBalance) {
      toast.error("Insufficient INR balance")
      return
    }

    setIsExecuting(true)

    try {
      const result = await executeTrade(selectedStock, qty, prc, type)
      setTradeResult({
        type,
        stock: selectedStock,
        quantity: qty,
        price: prc,
        settlementTime: result.settlementTime || 3.5,
        txHash: result.txHash,
      })
      setShowSuccessModal(true)
      setQuantity("")
    } catch {
      toast.error("Trade execution failed")
    } finally {
      setIsExecuting(false)
    }
  }

  const copyTxHash = () => {
    if (tradeResult?.txHash) {
      navigator.clipboard.writeText(tradeResult.txHash)
      toast.success("Transaction hash copied")
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trade Execution</h1>
        <p className="text-muted-foreground">
          Execute trades with instant blockchain settlement
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stock Selection & Market Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Overview */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Market Overview</CardTitle>
              <CardDescription>Real-time stock prices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {stocks.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => handleStockChange(stock.symbol)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedStock === stock.symbol
                        ? "border-primary bg-primary/10"
                        : "border-border/50 bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{stock.symbol}</span>
                      <div
                        className={`flex items-center gap-0.5 text-xs ${
                          stock.change >= 0 ? "text-primary" : "text-destructive"
                        }`}
                      >
                        {stock.change >= 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {Math.abs(stock.change)}%
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-1">
                      {stock.name}
                    </p>
                    <p className="text-lg font-bold">
                      ₹{stock.price.toLocaleString("en-IN")}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Book Simulation */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Order Book</CardTitle>
              <CardDescription>
                {selectedStockData ? selectedStockData.name : "Select a stock to view order book"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedStockData ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Bids */}
                  <div>
                    <p className="text-sm font-medium text-primary mb-2">Bids</p>
                    <div className="space-y-1">
                      {[0, 0.5, 1, 1.5, 2].map((offset) => (
                        <div
                          key={offset}
                          className="flex items-center justify-between text-sm px-2 py-1 rounded bg-primary/5"
                        >
                          <span>
                            ₹{(selectedStockData.price - offset).toFixed(2)}
                          </span>
                          <span className="text-muted-foreground">
                            {Math.floor(Math.random() * 500 + 100)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Asks */}
                  <div>
                    <p className="text-sm font-medium text-destructive mb-2">Asks</p>
                    <div className="space-y-1">
                      {[0.5, 1, 1.5, 2, 2.5].map((offset) => (
                        <div
                          key={offset}
                          className="flex items-center justify-between text-sm px-2 py-1 rounded bg-destructive/5"
                        >
                          <span>
                            ₹{(selectedStockData.price + offset).toFixed(2)}
                          </span>
                          <span className="text-muted-foreground">
                            {Math.floor(Math.random() * 500 + 100)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a stock from the market overview
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trading Panel */}
        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Trade Panel
              </CardTitle>
              <CardDescription>Execute with instant settlement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stock Selector */}
              <div className="space-y-2">
                <Label>Select Stock</Label>
                <Select value={selectedStock} onValueChange={handleStockChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a stock" />
                  </SelectTrigger>
                  <SelectContent>
                    {stocks.map((stock) => (
                      <SelectItem key={stock.symbol} value={stock.symbol}>
                        {stock.symbol} - {stock.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label>Price (INR)</Label>
                <Input
                  type="number"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  step="0.01"
                />
              </div>

              {/* Total */}
              {quantity && price && (
                <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Value</span>
                    <span className="font-semibold">
                      ₹{(parseInt(quantity) * parseFloat(price)).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )}

              {/* Buy/Sell Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={() => handleTrade("buy")}
                  disabled={isExecuting || !wallet.isConnected}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isExecuting ? <Spinner className="h-4 w-4" /> : "Buy"}
                </Button>
                <Button
                  onClick={() => handleTrade("sell")}
                  disabled={isExecuting || !wallet.isConnected}
                  variant="destructive"
                >
                  {isExecuting ? <Spinner className="h-4 w-4" /> : "Sell"}
                </Button>
              </div>

              {!wallet.isConnected && (
                <p className="text-xs text-center text-muted-foreground">
                  Connect your wallet to trade
                </p>
              )}
            </CardContent>
          </Card>

          {/* Balance Card */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{inrBalance.toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">INR Token Balance</p>
            </CardContent>
          </Card>

          {/* Settlement Info */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Instant Settlement</p>
                  <p className="text-sm text-muted-foreground">
                    Trades settle in 3-5 seconds
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Trade Executed
            </DialogTitle>
            <DialogDescription>
              Atomic settlement completed successfully
            </DialogDescription>
          </DialogHeader>
          {tradeResult && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <Badge
                    className={
                      tradeResult.type === "buy"
                        ? "bg-primary text-primary-foreground"
                        : "bg-destructive text-destructive-foreground"
                    }
                  >
                    {tradeResult.type.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Stock</span>
                  <span className="font-medium">{tradeResult.stock}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{tradeResult.quantity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">
                    ₹{tradeResult.price.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold">
                    ₹{(tradeResult.quantity * tradeResult.price).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  Settlement Time:{" "}
                  <span className="font-bold text-primary">
                    {tradeResult.settlementTime.toFixed(1)} seconds
                  </span>
                </span>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Transaction Hash</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 rounded bg-secondary text-xs font-mono truncate">
                    {tradeResult.txHash}
                  </code>
                  <Button size="icon" variant="ghost" onClick={copyTxHash}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" asChild>
                    <a
                      href={`https://etherscan.io/tx/${tradeResult.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <Button onClick={() => setShowSuccessModal(false)} className="w-full">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
