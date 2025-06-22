"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FlowingBackground } from "@/components/flowing-background"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ADMIN_PANEL_ACCESS_ADDRESS, STAKE_APY } from "@/lib/constants"

export default function AdminPanelPage() {
  const { publicKey } = useWallet()
  const [isMounted, setIsMounted] = useState(false)
  const [apy, setApy] = useState(STAKE_APY.toString())

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isAdmin = publicKey ? publicKey.toBase58() === ADMIN_PANEL_ACCESS_ADDRESS : false

  const handleSetApy = async () => {
    console.log("Setting APY to:", apy)
    // TODO: Implement actual logic to set APY on-chain
  }

  const handleCreateVault = async () => {
    console.log("Creating rewards vault...")
    // TODO: Implement actual logic to create the vault
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
                            onClick={handleSetApy}
                            className="w-full md:w-auto bg-[#4a85ff] hover:bg-[#3a75ef] text-white py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] disabled:opacity-50 font-medium"
                        >
                            Set APY
                        </Button>
                    </div>
                </div>

                {/* Staking Vault Management */}
                <div className="space-y-4">
                    <h3 className="text-base sm:text-xl font-medium text-white">Rewards Vault</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-gray-800/30 border-gray-700/60 p-4 rounded-lg">
                            <CardHeader className="p-0 mb-4">
                                <CardTitle className="text-lg font-semibold text-white">Vault Management</CardTitle>
                                <CardDescription className="text-gray-400 text-sm">Create and fund the rewards vault.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 space-y-4">
                                <Button 
                                    onClick={handleCreateVault} 
                                    className="w-full bg-zinc-800 text-zinc-50 hover:bg-zinc-700"
                                >
                                    Create Vault
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="bg-gray-800/30 border-gray-700/60 p-4 rounded-lg">
                           <CardHeader className="p-0 mb-4">
                                <CardTitle className="text-lg font-semibold text-white">Vault Status</CardTitle>
                                <CardDescription className="text-gray-400 text-sm">Current state of the vault.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Vault Address:</span>
                                    <span className="font-mono text-xs truncate text-gray-500">Not Created Yet</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Balance:</span>
                                    <span className="text-white">0 xLABS</span>
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
    </div>
  )
}
