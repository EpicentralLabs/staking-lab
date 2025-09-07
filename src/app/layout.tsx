import type { Metadata } from 'next'
import './globals.css'
import { AppProviders } from '@/components/app-providers'
import { DynamicAppLayout } from '@/components/dynamic-app-layout'
import React from 'react'
import { install as installEd25519 } from '@solana/webcrypto-ed25519-polyfill'

// polyfill ed25519 for browsers (to allow `generateKeyPairSigner` to work)
installEd25519()

export const metadata: Metadata = {
  title: 'xLabs Staking',
  description: 'Stake LABS tokens and earn xLABS rewards',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <AppProviders>
          <DynamicAppLayout>{children}</DynamicAppLayout>
        </AppProviders>
      </body>
    </html>
  )
}

// Patch BigInt so we can log it using JSON.stringify without any errors
declare global {
  interface BigInt {
    toJSON(): string
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString()
}
