"use client"

import { useWalletUi } from '@wallet-ui/react'

export function useActivityTracking() {
  const { account } = useWalletUi()

  const trackStakingActivity = async (amount: number, isStaking: boolean = true) => {
    if (!account?.address) {
      console.error('No wallet connected for tracking')
      return
    }

    try {
      const response = await fetch('/api/activity/stake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: account.address,
          amount,
          isStaking
        }),
      })

      const data = await response.json()
      if (data.success) {
        console.log(`${isStaking ? 'Stake' : 'Unstake'} activity tracked:`, data)
      }
    } catch (error) {
      console.error('Failed to track staking activity:', error)
    }
  }

  const trackClaimActivity = async (amount: number) => {
    if (!account?.address) {
      console.error('No wallet connected for tracking')
      return
    }

    try {
      const response = await fetch('/api/activity/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: account.address,
          amount
        }),
      })

      const data = await response.json()
      if (data.success) {
        console.log('Claim activity tracked:', data)
      }
    } catch (error) {
      console.error('Failed to track claim activity:', error)
    }
  }

  return {
    trackStakingActivity,
    trackClaimActivity
  }
}
