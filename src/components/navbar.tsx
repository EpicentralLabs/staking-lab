"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Github, Menu, Twitter, X } from "lucide-react"
import Image from "next/image"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useWallet } from "@solana/wallet-adapter-react"
import { ADMIN_PANEL_ACCESS_ADDRESS } from "@/lib/constants"
import Link from "next/link"

interface NavbarProps {
  onTitleClick?: () => void
}

export function Navbar({ onTitleClick }: NavbarProps) {
  const [mounted, setMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { publicKey } = useWallet()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isAdmin = publicKey
    ? publicKey.toBase58() === ADMIN_PANEL_ACCESS_ADDRESS
    : false

  return (
    <header className="">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
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

          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link href="/"
               className="text-gray-300 hover:text-white transition-colors cursor-pointer" 
               style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}>
              Stake
            </Link>
            <a href="#" className="text-gray-300 hover:text-white transition-colors"
               style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}>
              Docs
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Github className="w-4 h-4" />
              </Button>
            </div>

            <Button
              asChild
              className="bg-zinc-800 text-zinc-50 hover:bg-zinc-700"
              disabled={!isAdmin}
            >
              <Link href="/admin">Admin Panel</Link>
            </Button>
            {mounted && <WalletMultiButton />}
          </div>
          <div className="flex items-center gap-2 md:hidden">
            {mounted && <WalletMultiButton />}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative"
            >
              <Menu
                className={`h-6 w-6 transition-all duration-300 ease-in-out ${
                  isMenuOpen
                    ? "opacity-0 rotate-90 scale-50"
                    : "opacity-100 rotate-0 scale-100"
                }`}
              />
              <X
                className={`absolute h-6 w-6 transition-all duration-300 ease-in-out ${
                  isMenuOpen
                    ? "opacity-100 rotate-0 scale-100"
                    : "opacity-0 -rotate-90 scale-50"
                }`}
              />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
        <div
          className={`md:hidden mt-4 overflow-hidden rounded-lg bg-zinc-900/80 backdrop-blur-sm transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-96 p-4" : "max-h-0"
          }`}
        >
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              className="text-gray-300 hover:text-white text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Stake
            </Link>
            <a
              href="#"
              className="text-gray-300 hover:text-white text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Docs
            </a>

            <div className="border-t border-zinc-700 my-2"></div>

            {isAdmin && (
              <Button
                asChild
                className="bg-zinc-800 text-zinc-50 hover:bg-zinc-700 justify-center text-lg py-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link href="/admin">Admin Panel</Link>
              </Button>
            )}

            <div className="border-t border-zinc-700 my-2"></div>

            <div className="flex items-center gap-2 justify-center">
              <Button variant="ghost" size="sm" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Twitter className="w-5 h-5" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Github className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
} 