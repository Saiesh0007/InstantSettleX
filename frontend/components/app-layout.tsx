"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useBlockchain } from "@/lib/blockchain"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Activity,
  Droplets,
  Menu,
  X,
  Zap,
  ChevronDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Trade", href: "/trade", icon: ArrowLeftRight },
  { name: "Portfolio", href: "/portfolio", icon: Wallet },
  { name: "Settlement Monitor", href: "/settlement", icon: Activity },
  { name: "Liquidity Pool", href: "/liquidity", icon: Droplets },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { wallet, connectWallet, disconnectWallet } = useBlockchain()

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold tracking-tight">InstantSettleX</span>
            </Link>
          </div>

          {/* Right Side - Network & Wallet */}
          <div className="flex items-center gap-3">
            {wallet.isConnected && (
              <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 border-primary/30 bg-primary/10 text-primary">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                {wallet.network}
              </Badge>
            )}

            {wallet.isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 border-border/50 bg-card">
                    <Wallet className="h-4 w-4 text-primary" />
                    <span className="hidden sm:inline font-mono text-sm">
                      {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">Balance</p>
                    <p className="text-sm text-muted-foreground">{wallet.balance}</p>
                  </div>
                  <DropdownMenuItem onClick={disconnectWallet} className="text-destructive">
                    Disconnect Wallet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={connectWallet} disabled={wallet.isConnecting} className="gap-2">
                {wallet.isConnecting ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 mt-16 w-64 transform border-r border-border bg-sidebar transition-transform duration-200 lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="flex flex-col gap-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Settlement Speed Indicator */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-medium mb-3">
                <Zap className="h-4 w-4 text-primary" />
                Settlement Speed
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Traditional</span>
                  <span className="text-destructive">T+1 (24h)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Our System</span>
                  <span className="text-primary font-semibold">3-5 sec</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
