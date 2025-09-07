'use client'

import { ThemeProvider } from './theme-provider'
import { Toaster } from './ui/sonner'
import { AppHeader } from '@/components/app-header'
import React from 'react'
import { AppFooter } from '@/components/app-footer'
import { ClusterChecker } from '@/components/cluster/cluster-ui'
import { AccountChecker } from '@/components/account/account-ui'
import { FlowingBackground } from '@/components/flowing-background'
import { usePathname } from 'next/navigation'

export function AppLayout({
  children,
  links,
}: {
  children: React.ReactNode
  links: { label: string; path: string }[]
}) {
  const pathname = usePathname()
  const isStakingOrAdmin = pathname === '/staking' || pathname === '/admin'

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {isStakingOrAdmin ? (
        // Custom layout for staking and admin pages
        <div className="min-h-screen bg-gradient-to-br from-[#050810] via-[#0a0f1a] to-[#050810] text-white relative overflow-x-hidden flex flex-col">
          <div className="absolute inset-0 pointer-events-none -z-20 bg-black/40 backdrop-blur-2xl" style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(74,133,255,0.03) 0%, transparent 70%)'
          }} />
          <FlowingBackground />
          <div className="relative z-10 flex flex-col min-h-screen">
            <AppHeader links={links} />
            <main className="flex-1">
              {children}
            </main>
            <AppFooter />
          </div>
        </div>
      ) : (
        // Standard layout for other pages
        <div className="flex flex-col min-h-screen">
          <AppHeader links={links} />
          <main className="flex-grow container mx-auto p-4">
            <ClusterChecker>
              <AccountChecker />
            </ClusterChecker>
            {children}
          </main>
          <AppFooter />
        </div>
      )}
      <Toaster />
    </ThemeProvider>
  )
}
