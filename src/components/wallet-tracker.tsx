"use client"

import { useWalletTracking } from '@/hooks/use-wallet-tracking'

export function WalletTracker({ children }: { children: React.ReactNode }) {
  useWalletTracking()
  return <>{children}</>
}
