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
import { ADMIN_PANEL_ACCESS_ADDRESS, STAKE_APY } from "@/lib/constants"
import { Transition } from '@headlessui/react'
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import bs58 from 'bs58'
import { useCreateXLabsTokenMint } from "@/components/solana-rpc-methods/create-token-mint"

export default function AdminPanelPage() {
  const { publicKey, signMessage } = useWallet()
  const { createTokenMint } = useCreateXLabsTokenMint()
  const [isMounted, setIsMounted] = useState(false)
  const [apy, setApy] = useState(STAKE_APY.toString())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreateStakePoolConfigDialogOpen, setICreateStakePoolConfigDialogOpen] = useState(false)
  const [isDeleteStakePoolConfigDialogOpen, setIsDeleteStakePoolConfigDialogOpen] = useState(false)
  const [isCreateXLabsMintDialogOpen, setIsCreateXLabsMintDialogOpen] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<{type: 'success' | 'error', text: string, explorerUrl?: string} | null>(null)
  const [isNotificationVisible, setIsNotificationVisible] = useState(false)
  const [xLabsMintAddress, setXLabsMintAddress] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  useEffect(() => {
    if (updateMessage) {
      setIsNotificationVisible(true)
    }
  }, [updateMessage])

  // Effect to refresh APY from constants when needed
  useEffect(() => {
    // This will re-import the STAKE_APY constant when updateMessage changes
    // and it's a success message about APY update
    if (updateMessage?.type === 'success' && updateMessage.text.includes('APY')) {
      // Dynamic import to get the fresh value
      import('@/lib/constants').then(constants => {
        setApy(constants.STAKE_APY.toString())
      })
    }
  }, [updateMessage])

  const isAdmin = publicKey ? publicKey.toBase58() === ADMIN_PANEL_ACCESS_ADDRESS : false

  const handleCloseNotification = () => {
    setIsNotificationVisible(false)
  }

  const abbreviateAddress = (address: string) => {
    if (!address) return 'NULL'
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

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
    console.log("Setting APY to:", apy)
    
    try {
      const message = `Update APY to ${apy}%`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      const encodedSignature = bs58.encode(signature);

      // Update APY via API
      const response = await fetch('/api/admin/update-apy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apy: parseFloat(apy),
          publicKey: publicKey.toBase58(),
          message,
          signature: encodedSignature
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        console.log("APY updated successfully:", apy)
        // Show success message
        setUpdateMessage({
          type: 'success',
          text: `APY successfully updated to ${apy}%`
        })
      } else {
        console.error("Failed to update APY:", data.error)
        setUpdateMessage({
          type: 'error',
          text: `Failed to update APY: ${data.error || 'Unknown error'}`
        })
      }
    } catch (error) {
      console.error("Error updating APY:", error)
      setUpdateMessage({
        type: 'error',
        text: "An error occurred while updating the APY. Please try again."
      })
    }
    
    // TODO: Implement actual logic to set APY on-chain as well
  }

  const handleCreateStakePoolConfig = async () => {
    if (!isAdmin) {
      setUpdateMessage({
        type: 'error',
        text: 'Authorization failed. Please ensure the admin wallet is connected.',
      });
      setICreateStakePoolConfigDialogOpen(false);
      return;
    }
    setICreateStakePoolConfigDialogOpen(false)
    console.log("Creating stake pool config...")
    // TODO: Implement actual logic to initialize the stake program
  }

  const handleDeleteStakePoolConfig = async () => {
    if (!isAdmin) {
      setUpdateMessage({
        type: 'error',
        text: 'Authorization failed. Please ensure the admin wallet is connected.',
      });
      setIsDeleteStakePoolConfigDialogOpen(false);
      return;
    }
    setIsDeleteStakePoolConfigDialogOpen(false)
    console.log("Deleting stake pool config...")
    // TODO: Implement actual logic to initialize the stake pool
  }

  const handleCreateXLabsMint = async () => {
    if (!isAdmin) {
      setUpdateMessage({
        type: 'error',
        text: 'Authorization failed. Please ensure the admin wallet is connected.',
      });
      setIsCreateXLabsMintDialogOpen(false);
      return;
    }
    
    setIsCreateXLabsMintDialogOpen(false)
    console.log("Creating xLABS mint...")
    
    try {
      const result = await createTokenMint()
      console.log("xLABS mint created successfully:", result)
      
      // Store the mint address for display in the status section
      setXLabsMintAddress(result.mintAddress)
      
      // Show success message with mint address and clickable link
      setUpdateMessage({
        type: 'success',
        text: `xLABS mint created successfully! Mint address: ${result.mintAddress}`,
        explorerUrl: result.explorerUrl
      })
    } catch (error) {
      console.error("Error creating xLABS mint:", error)
      setUpdateMessage({
        type: 'error',
        text: `Failed to create xLABS mint: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  if (!isMounted) {
    return null // or a loading spinner
  }

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050810] via-[#0a0f1a] to-[#050810] text-white flex flex-col">
        <FlowingBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
              <p>Please connect your wallet to access the admin panel.</p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#050810] via-[#0a0f1a] to-[#050810] text-white flex flex-col">
            <FlowingBackground />
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                        <p>You are not authorized to view this page.</p>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050810] via-[#0a0f1a] to-[#050810] text-white relative overflow-x-hidden flex flex-col">
      <div className="absolute inset-0 pointer-events-none z-0 bg-black/40 backdrop-blur-2xl" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(74,133,255,0.03) 0%, transparent 70%)'
      }} />
      <FlowingBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="container mx-auto sm:px-2 px-1 py-6 sm:py-8 md:py-12 flex-1">
          <div className="max-w-4xl mx-auto">
            <Transition
              show={isNotificationVisible}
              as="div"
              className="mb-4"
              enter="transition-all duration-300 ease-out"
              enterFrom="max-h-0 opacity-0"
              enterTo="max-h-40 opacity-100"
              leave="transition-all duration-300 ease-in"
              leaveFrom="max-h-40 opacity-100"
              leaveTo="max-h-0 opacity-0"
              afterLeave={() => setUpdateMessage(null)}
            >
              {updateMessage && (
                <div 
                  className={`p-4 rounded-lg flex items-start space-x-3 text-white border ${
                    updateMessage.type === 'success' 
                      ? 'bg-green-900/50 border-green-500/50' 
                      : 'bg-red-900/50 border-red-500/50'
                  }`}
                >
                  {updateMessage.type === 'success' ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircleIcon className="h-6 w-6 text-red-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <span>{updateMessage.text}</span>
                    {updateMessage.explorerUrl && (
                      <div className="mt-2">
                        <a 
                          href={updateMessage.explorerUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline transition-colors text-sm"
                        >
                          View on Solscan →
                        </a>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleCloseNotification}
                    className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close notification"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </Transition>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30">
              <CardHeader>
                <CardTitle className="text-lg sm:text-2xl md:text-3xl font-bold text-white">Admin Panel</CardTitle>
                <CardDescription className="text-gray-400 text-sm sm:text-lg font-light">
                  Manage staking contract settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* APY Settings */}
                <div className="space-y-4">
                    <h3 className="text-base sm:text-xl font-medium text-white">Staking APY</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="apy-input" className="text-gray-300 font-medium text-xs sm:text-base">
                                Set Annual Percentage Yield (APY)
                            </Label>
                            <div className="relative">
                                <Input
                                    id="apy-input"
                                    type="number"
                                    placeholder="e.g., 10"
                                    value={apy}
                                    onChange={(e) => setApy(e.target.value)}
                                    className="bg-gray-800/30 border-gray-600/40 text-white placeholder-gray-500 pr-12 py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl backdrop-blur-xl w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm font-medium">%</span>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                            className="w-full md:w-auto bg-[#4a85ff] hover:bg-[#3a75ef] text-white py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] disabled:opacity-50 font-medium"
                        >
                            update_stake_pool_config (Change APY %)
                        </Button>
                    </div>
                </div>

                {/* Staking Vault Management */}
                <div className="space-y-4">
                    <h3 className="text-base sm:text-xl font-medium text-white">Stake Program</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-gray-800/30 border-gray-700/60 p-4 rounded-lg">
                            <CardHeader className="p-0 mb-4">
                                <CardTitle className="text-lg font-semibold text-white">Initialize Stake Program</CardTitle>
                                <CardDescription className="text-gray-400 text-sm">Initialize the on-chain staking program.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 space-y-4">
                                <Button 
                                    onClick={() => setICreateStakePoolConfigDialogOpen(true)} 
                                    className="w-full bg-zinc-800 text-zinc-50 hover:bg-zinc-700"
                                >
                                    create_stake_pool_config
                                </Button>
                                <Button 
                                    onClick={() => setIsDeleteStakePoolConfigDialogOpen(true)} 
                                    className="w-full bg-red-900/70 text-red-100 hover:bg-red-800/70"
                                >
                                    delete_stake_pool_config
                                </Button>
                                <Button 
                                    onClick={() => setIsCreateXLabsMintDialogOpen(true)} 
                                    className="w-full bg-zinc-800 text-zinc-50 hover:bg-zinc-700"
                                >
                                    create_x_labs_mint
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="bg-gray-800/30 border-gray-700/60 p-4 rounded-lg">
                           <CardHeader className="p-0 mb-4">
                                <CardTitle className="text-lg font-semibold text-white">Stake Pool Status</CardTitle>
                                <CardDescription className="text-gray-400 text-sm">Current state of the stake pool.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Program Address:</span>
                                    <span className="font-mono text-xs truncate text-gray-500">Not Initialized Yet</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Stake Pool Address:</span>
                                    <span className="font-mono text-xs truncate text-gray-500">Not Initialized Yet</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">LABS Token Address:</span>
                                    <a 
                                        href="https://solscan.io/token/LABSh5DTebUcUbEoLzXKCiXFJLecDFiDWiBGUU1GpxR" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                                    >
                                        LABS...GpxR
                                    </a>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">xLABS Token Address:</span>
                                    {xLabsMintAddress ? (
                                        <a 
                                            href={`https://solscan.io/token/${xLabsMintAddress}?cluster=devnet`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                                        >
                                            {abbreviateAddress(xLabsMintAddress)}
                                        </a>
                                    ) : (
                                        <span className="font-mono text-xs text-gray-500">NULL</span>
                                    )}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Unclaimed Rewards (xLABS Pending):</span>
                                    <span className="font-mono text-xs text-gray-500">0</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Claimed Rewards (xLABS Minted):</span>
                                    <span className="font-mono text-xs text-gray-500">0</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total LABS Staked:</span>
                                    <span className="font-mono text-xs text-gray-500">0</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">TVL Staked (USDC Value):</span>
                                    <span className="font-mono text-xs text-gray-500">$0.00</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Footer />
      </div>

      {/* APY Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm APY Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the staking APY to {apy}%?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSetApy}
              className="bg-[#4a85ff] hover:bg-[#3a75ef] text-white shadow-md transition-all hover:shadow-[0_0_20px_rgba(74,133,255,0.3)]"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initialize Staking Program Confirmation Dialog */}
      <Dialog open={isCreateStakePoolConfigDialogOpen} onOpenChange={setICreateStakePoolConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Create Stake Pool Config</DialogTitle>
            <DialogDescription>
              Are you sure you want to create the stake pool config?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setICreateStakePoolConfigDialogOpen(false)}
              className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateStakePoolConfig}
              className="bg-[#4a85ff] hover:bg-[#3a75ef] text-white shadow-md transition-all hover:shadow-[0_0_20px_rgba(74,133,255,0.3)]"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initialize Stake Pool Confirmation Dialog */}
      <Dialog open={isDeleteStakePoolConfigDialogOpen} onOpenChange={setIsDeleteStakePoolConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete Stake Pool Config</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the stake pool config? This action is destructive and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteStakePoolConfigDialogOpen(false)}
              className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteStakePoolConfig}
              className="bg-red-600 hover:bg-red-500 text-white shadow-md transition-all"
            >
              Confirm Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initialize xLABS Mint Confirmation Dialog */}
      <Dialog open={isCreateXLabsMintDialogOpen} onOpenChange={setIsCreateXLabsMintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Create xLABS Mint</DialogTitle>
            <DialogDescription>
              Are you sure you want to create the xLABS mint?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsCreateXLabsMintDialogOpen(false)}
              className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateXLabsMint}
              className="bg-[#4a85ff] hover:bg-[#3a75ef] text-white shadow-md transition-all hover:shadow-[0_0_20px_rgba(74,133,255,0.3)]"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
