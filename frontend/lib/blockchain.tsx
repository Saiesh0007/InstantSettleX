"use client"

import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from "react"
import { BrowserProvider, Contract, formatEther, parseEther } from "ethers"
import { settlementABI } from "./blockchain/abi"
import { settlementAddress, stockTokenAddress } from "./blockchain/contracts"

interface WalletState {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  network: string
  balance: string
}

interface Trade {
  id: string
  stock: string
  quantity: number
  price: number
  type: "buy" | "sell"
  timestamp: Date
  status: "pending" | "settling" | "settled"
  txHash: string
  buyer: string
  seller: string
  settlementTime?: number
}

interface Portfolio {
  stock: string
  quantity: number
  avgPrice: number
  currentValue: number
}

interface BlockchainContextType {
  wallet: WalletState
  trades: Trade[]
  portfolio: Portfolio[]
  inrBalance: number
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  executeTrade: (stock: string, quantity: number, price: number, type: "buy" | "sell") => Promise<Trade>
}

const BlockchainContext = createContext<BlockchainContextType | null>(null)

/* ---------------------------------- */

export function BlockchainProvider({ children }: { children: ReactNode }) {

  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    network: "Sepolia",
    balance: "0"
  })

  const [trades, setTrades] = useState<Trade[]>([])
  const [portfolio, setPortfolio] = useState<Portfolio[]>([])
  const [inrBalance, setInrBalance] = useState(500000)

  /* ---------------------------------- */
  /* WALLET CONNECTION */
  /* ---------------------------------- */

  const connectWallet = useCallback(async () => {

    if (!(window as any).ethereum) {
      alert("Install MetaMask")
      return
    }

    setWallet(prev => ({ ...prev, isConnecting: true }))

    const provider = new BrowserProvider((window as any).ethereum)

    const accounts = await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()

    const balance = await provider.getBalance(accounts[0])

    setWallet({
      address: accounts[0],
      isConnected: true,
      isConnecting: false,
      network: "Sepolia",
      balance: `${Number(formatEther(balance)).toFixed(4)} ETH`
    })

  }, [])

  const disconnectWallet = useCallback(() => {
    setWallet({
      address: null,
      isConnected: false,
      isConnecting: false,
      network: "Sepolia",
      balance: "0"
    })
  }, [])

  /* ---------------------------------- */
  /* EXECUTE TRADE (REAL BLOCKCHAIN TX) */
  /* ---------------------------------- */

  const executeTrade = useCallback(
    async (stock: string, quantity: number, price: number, type: "buy" | "sell"): Promise<Trade> => {

      if (!wallet.address) throw new Error("Wallet not connected")

      const provider = new BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()

      const settlement = new Contract(
        settlementAddress,
        settlementABI,
        signer
      )

      const start = Date.now()

      const tx = await settlement.createTrade(
        wallet.address,
        wallet.address,
        stockTokenAddress,
        quantity,
        parseEther(price.toString())
      )

      const tradeId = `TXN-${String(trades.length + 1).padStart(3, "0")}`

      const newTrade: Trade = {
        id: tradeId,
        stock,
        quantity,
        price,
        type,
        timestamp: new Date(),
        status: "settling",
        txHash: tx.hash,
        buyer: wallet.address.slice(0, 6) + "..." + wallet.address.slice(-4),
        seller: wallet.address.slice(0, 6) + "..." + wallet.address.slice(-4)
      }

      setTrades(prev => [newTrade, ...prev])

      const receipt = await tx.wait()

      const settlementTime = (Date.now() - start) / 1000

      setTrades(prev =>
        prev.map(t =>
          t.id === tradeId
            ? { ...t, status: "settled", settlementTime }
            : t
        )
      )

      /* ---------------------------------- */
      /* UPDATE PORTFOLIO */
      /* ---------------------------------- */

      if (type === "buy") {

        setPortfolio(prev => {
          const existing = prev.find(p => p.stock === stock)

          if (existing) {
            return prev.map(p =>
              p.stock === stock
                ? {
                  ...p,
                  quantity: p.quantity + quantity,
                  avgPrice:
                    (p.avgPrice * p.quantity + price * quantity) /
                    (p.quantity + quantity),
                  currentValue: (p.quantity + quantity) * price
                }
                : p
            )
          }

          return [...prev, {
            stock,
            quantity,
            avgPrice: price,
            currentValue: quantity * price
          }]
        })

        setInrBalance(prev => prev - quantity * price)

      } else {

        setPortfolio(prev =>
          prev.map(p =>
            p.stock === stock
              ? {
                ...p,
                quantity: p.quantity - quantity,
                currentValue: (p.quantity - quantity) * price
              }
              : p
          )
        )

        setInrBalance(prev => prev + quantity * price)
      }

      return { ...newTrade, status: "settled", settlementTime }

    },
    [wallet.address, trades.length]
  )

  /* ---------------------------------- */

  useEffect(() => {

    if (!(window as any).ethereum) return

    const handleChainChange = () => window.location.reload()

      ; (window as any).ethereum.on("chainChanged", handleChainChange)

    return () => {
      ; (window as any).ethereum.removeListener("chainChanged", handleChainChange)
    }

  }, [])

  /* ---------------------------------- */

  return (
    <BlockchainContext.Provider
      value={{
        wallet,
        trades,
        portfolio,
        inrBalance,
        connectWallet,
        disconnectWallet,
        executeTrade
      }}
    >
      {children}
    </BlockchainContext.Provider>
  )
}

export function useBlockchain() {
  const context = useContext(BlockchainContext)
  if (!context) throw new Error("useBlockchain must be used within a BlockchainProvider")
  return context
}