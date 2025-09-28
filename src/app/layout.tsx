import type { Metadata } from 'next'
import '@heroui/react/styles.css'
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet" />
      </head>
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
