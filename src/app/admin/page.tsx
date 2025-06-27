"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { FlowingBackground } from "@/components/flowing-background"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ADMIN_PANEL_ACCESS_ADDRESS, DEVNET_RPC_URL, STAKE_APY } from "@/lib/constants"
import { Transition } from '@headlessui/react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import bs58 from 'bs58'
import { StakingProgram, IDL } from "@/programs/staking_program/staking_program"
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js"
import { AnchorProvider, Program } from "@coral-xyz/anchor"
import { AdminNotification } from './AdminNotification'
import { ApySettings } from './ApySettings'
import { StakeProgramActions } from './StakeProgramActions'
import { StakePoolStatus } from './StakePoolStatus'
import { AdminDialog } from './AdminDialog'
import { ConnectWalletScreen } from './ConnectWalletScreen'
import { AccessDeniedScreen } from './AccessDeniedScreen'
import { AdminPanel } from './AdminPanel'
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { sendAndConfirmTransaction } from "@/lib/constants"


// Helper to find PDA
const findPda = (seeds: (Buffer | Uint8Array)[], programId: PublicKey) =>
  PublicKey.findProgramAddressSync(seeds, programId)[0];

export default function AdminPanelPage() {
  const { publicKey, signMessage, signTransaction } = useWallet()
  const [isMounted, setIsMounted] = useState(false)
  const [apy, setApy] = useState(STAKE_APY.toString())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreateStakePoolConfigDialogOpen, setICreateStakePoolConfigDialogOpen] = useState(false)
  const [isDeleteStakePoolConfigDialogOpen, setIsDeleteStakePoolConfigDialogOpen] = useState(false)
  const [isCreateXLabsMintDialogOpen, setIsCreateXLabsMintDialogOpen] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isNotificationVisible, setIsNotificationVisible] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (updateMessage) {
      setIsNotificationVisible(true)
      const timer = setTimeout(() => {
        setIsNotificationVisible(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [updateMessage])

  useEffect(() => {
    if (updateMessage?.type === 'success' && updateMessage.text.includes('APY')) {
      import('@/lib/constants').then(constants => {
        setApy(constants.STAKE_APY.toString())
      })
    }
  }, [updateMessage])

  const isAdmin = publicKey ? ADMIN_PANEL_ACCESS_ADDRESS.includes(publicKey.toBase58()) : false;

  const handleSetApy = async () => {
    if (!isAdmin || !publicKey || !signMessage) {
      setUpdateMessage({
        type: 'error',
        text: 'Authorization failed. Please ensure the admin wallet is connected and supports message signing.',
      });
      setIsDialogOpen(false);
      return;
    }
    setIsDialogOpen(false)
    try {
      const message = `Update APY to ${apy}%`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      const encodedSignature = bs58.encode(signature);
      const response = await fetch('/api/admin/update-apy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apy: parseFloat(apy),
          publicKey: publicKey.toBase58(),
          message,
          signature: encodedSignature
        }),
      })
      const data = await response.json()
      if (response.ok) {
        setUpdateMessage({ type: 'success', text: `APY successfully updated to ${apy}%` })
      } else {
        setUpdateMessage({ type: 'error', text: `Failed to update APY: ${data.error || 'Unknown error'}` })
      }
    } catch (error) {
      setUpdateMessage({ type: 'error', text: 'An error occurred while updating the APY. Please try again.' })
    }
  }

  const handleCreateStakePoolConfig = async () => {
    if (!isAdmin) {
      setUpdateMessage({ type: 'error', text: 'Authorization failed. Please ensure the admin wallet is connected.' });
      setICreateStakePoolConfigDialogOpen(false);
      return;
    }
    setICreateStakePoolConfigDialogOpen(false)
    // TODO: Implement actual logic to initialize the stake program
  }

  const handleDeleteStakePoolConfig = async () => {
    if (!isAdmin) {
      setUpdateMessage({ type: 'error', text: 'Authorization failed. Please ensure the admin wallet is connected.' });
      setIsDeleteStakePoolConfigDialogOpen(false);
      return;
    }
    setIsDeleteStakePoolConfigDialogOpen(false)
    // TODO: Implement actual logic to initialize the stake pool
  }

  const handleCreateXLabsMint = async () => {
    if (!isAdmin || !publicKey || !signTransaction) {
      setUpdateMessage({ type: 'error', text: 'Authorization failed. Please ensure the admin wallet is connected.' });
      setIsCreateXLabsMintDialogOpen(false);
      return;
    }
    setIsCreateXLabsMintDialogOpen(false);
    try {
      // Use the imported IDL and programId
      const programId = new PublicKey(IDL.address);
      // Derive PDAs
      const mintAuthority = findPda([Buffer.from("mint_authority")], programId);
      const mint = findPda([Buffer.from("xlabs_mint")], programId);
      // Set up Anchor provider and program
      const connection = new Connection(DEVNET_RPC_URL);
      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction } as any, // wallet adapter
        { preflightCommitment: "processed" }
      );
      const program = new Program<StakingProgram>(IDL, provider);
      await program.methods.createXLabsMint(9) // 9 decimals for SPL tokens
        .accounts({
          tokenProgram: TOKEN_PROGRAM_ID
        })
        .rpc();
      setUpdateMessage({ type: 'success', text: 'xLABS mint created successfully.' });
    } catch (error: any) {
      setUpdateMessage({ type: 'error', text: `Failed to create xLABS mint: ${error.message || error}` });
    }
  }

  if (!isMounted) return null
  if (!publicKey) return <ConnectWalletScreen />
  if (!isAdmin) return <AccessDeniedScreen />
  return (
    <AdminPanel
      apy={apy}
      setApy={setApy}
      isNotificationVisible={isNotificationVisible}
      updateMessage={updateMessage}
      setUpdateMessage={setUpdateMessage}
      handleSetApy={handleSetApy}
      handleCreateStakePoolConfig={handleCreateStakePoolConfig}
      handleDeleteStakePoolConfig={handleDeleteStakePoolConfig}
      handleCreateXLabsMint={handleCreateXLabsMint}
      isDialogOpen={isDialogOpen}
      setIsDialogOpen={setIsDialogOpen}
      isCreateStakePoolConfigDialogOpen={isCreateStakePoolConfigDialogOpen}
      setICreateStakePoolConfigDialogOpen={setICreateStakePoolConfigDialogOpen}
      isDeleteStakePoolConfigDialogOpen={isDeleteStakePoolConfigDialogOpen}
      setIsDeleteStakePoolConfigDialogOpen={setIsDeleteStakePoolConfigDialogOpen}
      isCreateXLabsMintDialogOpen={isCreateXLabsMintDialogOpen}
      setIsCreateXLabsMintDialogOpen={setIsCreateXLabsMintDialogOpen}
    />
  )
}
