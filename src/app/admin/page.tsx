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

export default function AdminPanelPage() {
  const { publicKey } = useWallet()
  const [isMounted, setIsMounted] = useState(false)
  const [apy, setApy] = useState(STAKE_APY.toString())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isInitProgramDialogOpen, setIsInitProgramDialogOpen] = useState(false)
  const [isInitPoolDialogOpen, setIsInitPoolDialogOpen] = useState(false)
  const [isInitMintDialogOpen, setIsInitMintDialogOpen] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])
  
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

  const handleSetApy = async () => {
    if (!isAdmin) {
      setUpdateMessage({
        type: 'error',
        text: 'Authorization failed. Please ensure the admin wallet is connected.',
      });
      setIsDialogOpen(false);
      return;
    }

    setIsDialogOpen(false)
    console.log("Setting APY to:", apy)
    
    try {
      // Update APY via API
      const response = await fetch('/api/admin/update-apy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apy: parseFloat(apy) }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log("APY updated successfully:", data.newApy)
        // Show success message
        setUpdateMessage({
          type: 'success',
          text: `APY successfully updated to ${data.newApy}%`
        })
        // Clear message after 5 seconds
        setTimeout(() => {
          setUpdateMessage(null)
        }, 5000)
      } else {
        console.error("Failed to update APY:", data.message)
        setUpdateMessage({
          type: 'error',
          text: `Failed to update APY: ${data.message}`
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

  const handleInitializeStakeProgram = async () => {
    if (!isAdmin) {
      setUpdateMessage({
        type: 'error',
        text: 'Authorization failed. Please ensure the admin wallet is connected.',
      });
      setIsInitProgramDialogOpen(false);
      return;
    }
    setIsInitProgramDialogOpen(false)
    console.log("Initializing stake program...")
    // TODO: Implement actual logic to initialize the stake program
  }

  const handleInitializeStakePool = async () => {
    if (!isAdmin) {
      setUpdateMessage({
        type: 'error',
        text: 'Authorization failed. Please ensure the admin wallet is connected.',
      });
      setIsInitPoolDialogOpen(false);
      return;
    }
    setIsInitPoolDialogOpen(false)
    console.log("Initializing stake pool...")
    // TODO: Implement actual logic to initialize the stake pool
  }

  const handleInitializeXLabsMint = async () => {
    if (!isAdmin) {
      setUpdateMessage({
        type: 'error',
        text: 'Authorization failed. Please ensure the admin wallet is connected.',
      });
      setIsInitMintDialogOpen(false);
      return;
    }
    setIsInitMintDialogOpen(false)
    console.log("Initializing xLABS mint...")
    // TODO: Implement actual logic to initialize the xLABS mint
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
          {updateMessage && (
            <div className={`mb-4 p-4 rounded-lg text-white ${updateMessage.type === 'success' ? 'bg-green-600/70' : 'bg-red-600/70'} max-w-4xl mx-auto`}>
              {updateMessage.text}
            </div>
          )}
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
                                    onClick={() => setIsInitProgramDialogOpen(true)} 
                                    className="w-full bg-zinc-800 text-zinc-50 hover:bg-zinc-700"
                                >
                                    Initialize Staking Program
                                </Button>
                                <Button 
                                    onClick={() => setIsInitPoolDialogOpen(true)} 
                                    className="w-full bg-zinc-800 text-zinc-50 hover:bg-zinc-700"
                                >
                                    Initialize Stake Pool
                                </Button>
                                <Button 
                                    onClick={() => setIsInitMintDialogOpen(true)} 
                                    className="w-full bg-zinc-800 text-zinc-50 hover:bg-zinc-700"
                                >
                                    Initialize xLABS Mint
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
                                        LABS...pxR
                                    </a>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">xLABS Token Address:</span>
                                    <a 
                                        href="https://solscan.io/token/11111111111111111111111111111111" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                                    >
                                        NULL
                                    </a>
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
      <Dialog open={isInitProgramDialogOpen} onOpenChange={setIsInitProgramDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initialize Staking Program</DialogTitle>
            <DialogDescription>
              Are you sure you want to initialize the staking program? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsInitProgramDialogOpen(false)}
              className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleInitializeStakeProgram}
              className="bg-[#4a85ff] hover:bg-[#3a75ef] text-white shadow-md transition-all hover:shadow-[0_0_20px_rgba(74,133,255,0.3)]"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initialize Stake Pool Confirmation Dialog */}
      <Dialog open={isInitPoolDialogOpen} onOpenChange={setIsInitPoolDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initialize Stake Pool</DialogTitle>
            <DialogDescription>
              Are you sure you want to initialize the stake pool? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsInitPoolDialogOpen(false)}
              className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleInitializeStakePool}
              className="bg-[#4a85ff] hover:bg-[#3a75ef] text-white shadow-md transition-all hover:shadow-[0_0_20px_rgba(74,133,255,0.3)]"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initialize xLABS Mint Confirmation Dialog */}
      <Dialog open={isInitMintDialogOpen} onOpenChange={setIsInitMintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initialize xLABS Mint</DialogTitle>
            <DialogDescription>
              Are you sure you want to initialize the xLABS mint? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsInitMintDialogOpen(false)}
              className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleInitializeXLabsMint}
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
