"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CURRENT_CLUSTER } from "@/lib/constants"

interface CopyableAddressProps {
  address: string
  label?: string
  className?: string
}

export function CopyableAddress({ address, label, className = "" }: CopyableAddressProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const formatAddress = (addr: string) => {
    if (!addr || addr === "11111111111111111111111111111111") return "Not Set"
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  const getSolscanUrl = (addr: string) => {
    if (!addr || addr === "11111111111111111111111111111111") return ""
    
    const baseUrl = "https://solscan.io/account/" + addr
    
    if (CURRENT_CLUSTER === "mainnet-beta") {
      return baseUrl
    } else {
      return baseUrl + "?cluster=devnet"
    }
  }

  const copyToClipboard = async () => {
    if (!address || address === "11111111111111111111111111111111") {
      toast({
        title: "Cannot copy",
        description: "Address is not set",
        variant: "destructive",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Address copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({
        title: "Copy failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      })
    }
  }

  const openSolscan = () => {
    const url = getSolscanUrl(address)
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  const isValidAddress = address && address !== "11111111111111111111111111111111"

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-white font-mono text-sm truncate">
        {formatAddress(address)}
      </span>
      
      {isValidAddress && (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700/50"
            aria-label={`Copy ${label || 'address'} to clipboard`}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={openSolscan}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700/50"
            aria-label={`View ${label || 'address'} on Solscan`}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}