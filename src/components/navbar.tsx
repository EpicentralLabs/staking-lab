"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Github, Twitter } from "lucide-react"

interface NavbarProps {
  isConnected: boolean
  onConnectWallet: () => void
  onTitleClick?: () => void
}

export function Navbar({ isConnected, onConnectWallet, onTitleClick }: NavbarProps) {
  return (
    <header className="border-b border-gray-800/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <div className="flex-1">
            <span 
              className="text-xl font-light text-white transition-transform duration-200 hover:scale-105 inline-block cursor-pointer" 
              style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
              onClick={onTitleClick}
            >
              Epicentral Stake
            </span>
          </div>

          <nav className="flex items-center gap-8 flex-1 justify-center">
            <a href="#" 
               className="text-gray-300 hover:text-white transition-colors cursor-pointer" 
               style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
               onClick={onConnectWallet}>
              Stake
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors"
               style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}>
              Docs
            </a>
          </nav>

          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Github className="w-4 h-4" />
              </Button>
            </div>

            {!isConnected ? (
              <Button onClick={onConnectWallet} className="bg-white text-black hover:bg-gray-100">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <Badge variant="outline" className="border-[#4a85ff] text-[#4a85ff]">
                <div className="w-2 h-2 bg-[#4a85ff] rounded-full mr-2"></div>
                Connected
              </Badge>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 