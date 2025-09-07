'use client'

import { useMemo } from 'react'
import { useWalletUi } from '@wallet-ui/react'
import { AppLayout } from '@/components/app-layout'
import { isAdminWallet } from '@/lib/admin-config'
import React from 'react'

export function DynamicAppLayout({ children }: { children: React.ReactNode }) {
  const { account } = useWalletUi()

  const links = useMemo(() => {
    const baseLinks = [
      { label: 'Staking', path: '/staking' },
    ]

    // Only add admin link if wallet is connected and whitelisted
    if (account?.address && isAdminWallet(account.address)) {
      baseLinks.push({ label: 'Admin', path: '/admin' })
    }

    return baseLinks
  }, [account?.address])

  return <AppLayout links={links}>{children}</AppLayout>
}