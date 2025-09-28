'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import { SolanaProvider } from '@/components/solana/solana-provider'
import { HeroUIProvider } from '@heroui/react'
import React from 'react'

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ReactQueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <HeroUIProvider>
          <SolanaProvider>{children}</SolanaProvider>
        </HeroUIProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  )
}
