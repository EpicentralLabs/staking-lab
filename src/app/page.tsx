"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { FlowingBackground } from "../components/flowing-background"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TokenBalance } from "@/components/solana-rpc-methods/get-token-balance"

export default function SolanaStakingDApp() {
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)

  // Real data - to be connected to Solana blockchain
  const walletBalance = TokenBalance()
  const [stakedAmount, setStakedAmount] = useState(0)
  const [earnedRewards, setEarnedRewards] = useState(0)
  const [apy, setApy] = useState(0)
  const [totalValueLocked, setTotalValueLocked] = useState(0)

  // Suppress unused warnings - these will be used when Solana integration is implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = { setStakedAmount, setEarnedRewards, setApy, setTotalValueLocked }

  const handleReset = () => {
    setStakeAmount("")
    setUnstakeAmount("")
    setIsStaking(false)
    setIsUnstaking(false)
    setStakedAmount(0)
    setEarnedRewards(0)
    setApy(0)
    setTotalValueLocked(0)
  }

  const handleStake = async () => {
    if (!stakeAmount || Number.parseFloat(stakeAmount) <= 0) return

    setIsStaking(true)
    // TODO: Implement actual staking logic
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsStaking(false)
    setStakeAmount("")
  }

  const handleUnstake = async () => {
    if (!unstakeAmount || Number.parseFloat(unstakeAmount) <= 0) return

    setIsUnstaking(true)
    // TODO: Implement actual unstaking logic
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsUnstaking(false)
    setUnstakeAmount("")
  }

  const handleClaimRewards = async () => {
    // TODO: Implement actual claim rewards logic
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050810] via-[#0a0f1a] to-[#050810] text-white relative overflow-x-hidden flex flex-col">
      <div className="absolute inset-0 pointer-events-none z-0 bg-black/40 backdrop-blur-2xl" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(74,133,255,0.03) 0%, transparent 70%)'
      }} />
      <FlowingBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="">
          <Navbar onTitleClick={handleReset} />
        </div>

        <div className="container mx-auto sm:px-2 px-1 py-8 sm:py-12 md:py-16 flex-1">
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 overflow-x-auto">
              <Card className="bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30 min-w-[220px]">
                <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                  <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 font-medium">Wallet Balance</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-light mb-1 text-white">{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 })}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">LABS</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30 min-w-[220px]">
                <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                  <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 font-medium">Staked Amount</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-light mb-1 text-white">{stakedAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 })}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">LABS</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30 min-w-[220px]">
                <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                  <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 font-medium">Earned Rewards</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-light mb-1 text-[#4a85ff]">{earnedRewards.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 })}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">xLABS</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30 min-w-[220px]">
                <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                  <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 font-medium">Current APY</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-light mb-1 text-[#4a85ff]">{apy}%</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Annual</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
              {/* Main Staking Interface */}
              <Card className="lg:col-span-2 bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30">
                <CardHeader className="pb-6 sm:pb-8">
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Stake LABS</CardTitle>
                  <CardDescription className="text-gray-400 text-base sm:text-lg font-light">
                    Stake your LABS tokens to earn xLABS rewards
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 sm:space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                    {/* Stake Section */}
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="p-2 bg-[#4a85ff]/20 rounded-lg">
                          <ArrowUpRight className="w-5 h-5 text-[#4a85ff]" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-medium text-white">Stake Tokens</h3>
                      </div>

                      <div className="space-y-2 sm:space-y-4">
                        <Label htmlFor="stake-amount" className="text-gray-300 font-medium">
                          Amount to Stake
                        </Label>
                        <div className="relative">
                          <Input
                            id="stake-amount"
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*\.?[0-9]*"
                            placeholder="0.00"
                            value={stakeAmount}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                setStakeAmount(value)
                              }
                            }}
                            className="bg-gray-800/30 border-gray-600/40 text-white placeholder-gray-500 pr-16 py-4 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl backdrop-blur-xl w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm font-medium">LABS</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-400">Available: {walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS</span>
                          <button
                            className="text-[#4a85ff] hover:text-[#3a75ef] font-medium transition-colors"
                            onClick={() => setStakeAmount(walletBalance.toString())}
                          >
                            Max
                          </button>
                        </div>
                      </div>

                      <Button
                        onClick={handleStake}
                        disabled={!stakeAmount || Number.parseFloat(stakeAmount) <= 0 || isStaking}
                        className="w-full bg-[#4a85ff] hover:bg-[#3a75ef] text-white py-4 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] disabled:opacity-50 disabled:hover:scale-100 font-medium"
                      >
                        {isStaking ? "Staking..." : "Stake LABS"}
                      </Button>
                    </div>

                    {/* Unstake Section */}
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="p-2 bg-orange-400/20 rounded-lg">
                          <ArrowDownRight className="w-5 h-5 text-orange-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-medium text-white">Unstake Tokens</h3>
                      </div>

                      <div className="space-y-2 sm:space-y-4">
                        <Label htmlFor="unstake-amount" className="text-gray-300 font-medium">
                          Amount to Unstake
                        </Label>
                        <div className="relative">
                          <Input
                            id="unstake-amount"
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*\.?[0-9]*"
                            placeholder="0.00"
                            value={unstakeAmount}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                setUnstakeAmount(value)
                              }
                            }}
                            className="bg-gray-800/30 border-gray-600/40 text-white placeholder-gray-500 pr-16 py-4 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl backdrop-blur-xl w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm font-medium">LABS</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-400">Staked: {stakedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS</span>
                          <button
                            className="text-[#4a85ff] hover:text-[#3a75ef] font-medium transition-colors"
                            onClick={() => setUnstakeAmount(stakedAmount.toString())}
                          >
                            Max
                          </button>
                        </div>
                      </div>

                      <Button
                        onClick={handleUnstake}
                        disabled={!unstakeAmount || Number.parseFloat(unstakeAmount) <= 0 || isUnstaking}
                        variant="outline"
                        className="w-full border-gray-600/60 text-gray-300 hover:bg-gray-800/60 py-4 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl backdrop-blur-sm transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 font-medium"
                      >
                        {isUnstaking ? "Unstaking..." : "Unstake LABS"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar */}
              <div className="space-y-6 sm:space-y-8">
                {/* Claim Rewards */}
                <Card className="bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl font-medium text-white">Claim Rewards</CardTitle>
                    <CardDescription className="text-gray-400 font-light text-sm sm:text-base">Your earned xLABS tokens</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="text-center py-4 sm:py-6">
                      <p className="text-2xl sm:text-4xl font-light text-[#4a85ff] mb-2">{earnedRewards.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">xLABS</p>
                    </div>
                    <Button
                      onClick={handleClaimRewards}
                      disabled={earnedRewards <= 0}
                      className="w-full bg-white text-black hover:bg-gray-100 py-4 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] font-medium"
                    >
                      Claim Rewards
                    </Button>
                  </CardContent>
                </Card>

                {/* Pool Stats */}
                <Card className="bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl font-medium text-white">Pool Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="space-y-2 sm:space-y-4">
                      <div className="flex justify-between items-center py-1 sm:py-2">
                        <span className="text-xs sm:text-sm text-gray-400 font-light">Total Value Locked</span>
                        <span className="font-medium text-base sm:text-lg text-white">${totalValueLocked.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 sm:py-2">
                        <span className="text-xs sm:text-sm text-gray-400 font-light">Current APY</span>
                        <span className="font-medium text-base sm:text-lg text-[#4a85ff]">{apy}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  )
}
