"use client"

import { useEffect } from 'react'
import { useWalletUi } from '@wallet-ui/react'
import { useUserLabsAccount, useUserStakeAccount } from '@/components/shared/data-access'

export function useWalletTracking() {
  const { account } = useWalletUi()
  const userLabsAccountQuery = useUserLabsAccount()
  const userStakeAccountQuery = useUserStakeAccount()

  useEffect(() => {
    if (account?.address) {
      // Track wallet connection
      fetch('/api/users/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: account.address,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log('Wallet connection tracked:', data.user)
            if (data.user.firstVisit) {
              console.log('New user registered!')
            }
          }
        })
        .catch(error => {
          console.error('Failed to track wallet connection:', error)
        })
    }
  }, [account?.address])

  // Update user balance information when data changes
  useEffect(() => {
    if (!account?.address) return

    const updateUserBalances = async () => {
      try {
        const labsBalance = userLabsAccountQuery.data?.data?.amount 
          ? Number(userLabsAccountQuery.data.data.amount) 
          : 0
        
        const stakedBalance = userStakeAccountQuery.data?.exists && userStakeAccountQuery.data?.data?.stakedAmount
          ? Number(userStakeAccountQuery.data.data.stakedAmount)
          : 0

        await fetch('/api/users/update-balances', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: account.address,
            labsBalance,
            stakedBalance,
          }),
        })
      } catch (error) {
        console.error('Failed to update user balances:', error)
      }
    }

    // Only update if we have data
    if (userLabsAccountQuery.data || userStakeAccountQuery.data) {
      updateUserBalances()
    }
  }, [account?.address, userLabsAccountQuery.data, userStakeAccountQuery.data])

  return account
}
