"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Github, Twitter } from "lucide-react"
import Image from "next/image"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

interface NavbarProps {
  onTitleClick?: () => void
}

export function Navbar({ onTitleClick }: NavbarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <div className="flex-1">
            <div 
              className="flex items-center gap-3 cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={onTitleClick}
            >
              <Image 
                src="/EpicentralLabsLogo.png" 
                alt="Epicentral Labs Logo" 
                width={32} 
                height={32}
                className="rounded"
              />
              <span 
                className="text-xl font-light text-white" 
                style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
              >
                Epicentral Labs
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-8 flex-1 justify-center">
            <a href="#" 
               className="text-gray-300 hover:text-white transition-colors cursor-pointer" 
               style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}>
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

            <Button className="bg-zinc-800 text-zinc-50 hover:bg-zinc-700">Admin Panel</Button>
            {mounted && <WalletMultiButton />}
          </div>
        </div>
      </div>
    </header>
  )
} 