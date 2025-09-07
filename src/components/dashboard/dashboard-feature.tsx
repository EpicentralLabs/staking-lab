'use client'

import { AppHero } from '@/components/app-hero'
import { useWalletUi } from '@wallet-ui/react'
import { WalletButton } from '@/components/solana/solana-provider'

export function DashboardFeature() {
  const { account } = useWalletUi()

  if (!account) {
    return (
      <AppHero 
        title="Welcome to xLabs Staking" 
        subtitle="Connect your wallet to start staking LABS tokens and earn xLABS rewards."
      >
        <div className="pt-6">
          <WalletButton />
        </div>
      </AppHero>
    )
  }

  // If wallet is connected, redirect to staking page or show staking info
  return (
    <AppHero 
      title="Welcome back!" 
      subtitle="Ready to stake your LABS tokens?"
    >
      <div className="pt-6">
        <a 
          href="/staking"
          className="inline-flex items-center px-6 py-3 bg-[#4a85ff] hover:bg-[#3a75ef] text-white rounded-lg font-medium transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(74,133,255,0.3)]"
        >
          Go to Staking
        </a>
      </div>
    </AppHero>
  )
}
