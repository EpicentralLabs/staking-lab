"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Github, Menu, Twitter, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { WalletButton } from '@/components/solana/solana-provider'

interface AppHeaderProps {
  links?: { label: string; path: string }[]
  onTitleClick?: () => void
}

export function AppHeader({ links = [], onTitleClick }: AppHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  function isActive(path: string) {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  return (
    <header className="relative z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className="flex items-center gap-3 cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={onTitleClick}
            >
              <span 
                className="text-xl font-light text-white" 
                style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
              >
                xLabs Staking
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {links.map(({ label, path }) => (
              <Link 
                key={path}
                href={path}
                className={`transition-colors cursor-pointer ${
                  isActive(path) 
                    ? "text-white" 
                    : "text-gray-300 hover:text-white"
                }`}
                style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
              >
                {label}
              </Link>
            ))}
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

            <WalletButton />
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <WalletButton />
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
            {links.map(({ label, path }) => (
              <Link
                key={path}
                href={path}
                className={`text-lg transition-colors ${
                  isActive(path) 
                    ? "text-white" 
                    : "text-gray-300 hover:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <a
              href="#"
              className="text-gray-300 hover:text-white text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Docs
            </a>

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
