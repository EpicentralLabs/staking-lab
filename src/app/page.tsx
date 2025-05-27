"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { FlowingBackground } from "../components/flowing-background"
import { Navbar } from "@/components/navbar"

export default function SolanaStakingDApp() {
  const [isConnected, setIsConnected] = useState(false)
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)

  // Real data - to be connected to Solana blockchain
  const [walletBalance, setWalletBalance] = useState(0)
  const [stakedAmount, setStakedAmount] = useState(0)
  const [earnedRewards, setEarnedRewards] = useState(0)
  const [apy, setApy] = useState(0)
  const [totalValueLocked, setTotalValueLocked] = useState(0)
  const [totalStakers, setTotalStakers] = useState(0)

  // Suppress unused warnings - these will be used when Solana integration is implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = { setWalletBalance, setStakedAmount, setEarnedRewards, setApy, setTotalValueLocked, setTotalStakers }

  const handleConnectWallet = () => {
    setIsConnected(true)
    // TODO: Implement actual wallet connection logic
  }

  const handleReset = () => {
    setIsConnected(false)
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#10182a] to-[#0a0f1c] text-white relative overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(74,133,255,0.08) 0%, transparent 70%)'
      }} />
      <FlowingBackground />

      <div className="relative z-10">
        {/* Header */}
        <div className="">
          <Navbar isConnected={isConnected} onConnectWallet={handleConnectWallet} onTitleClick={handleReset} />
        </div>

        <div className="container mx-auto px-4 py-16">
          {!isConnected ? (
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-6xl md:text-7xl font-light mb-8 leading-tight tracking-tight">
                Stake LABS,
                <br />
                <span className="text-[#4a85ff] font-semibold">Earn xLABS</span>
              </h1>
              <p className="text-xl text-gray-300 mb-16 max-w-2xl mx-auto font-light leading-relaxed">
                Maximize your LABS holdings through our DAO-governed staking protocol. xLABS is a redeemable token that earns 100% of protocol revenue.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  onClick={handleConnectWallet}
                  size="lg"
                  className="bg-[#4a85ff] text-white hover:bg-[#3a75ef] px-10 py-6 text-lg rounded-xl shadow-lg transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(74,133,255,0.4)] active:bg-[#2a5bbf] font-medium"
                >
                  Get Started
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <Card className="bg-gray-900/80 border border-gray-700/60 shadow-lg shadow-black/40 rounded-2xl backdrop-blur-md transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/90">
                  <CardContent className="p-8 text-center">
                    <p className="text-sm text-gray-400 mb-3 font-medium">Wallet Balance</p>
                    <p className="text-3xl font-light mb-1 text-white">{walletBalance.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">SOL</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/80 border border-gray-700/60 shadow-lg shadow-black/40 rounded-2xl backdrop-blur-md transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/90">
                  <CardContent className="p-8 text-center">
                    <p className="text-sm text-gray-400 mb-3 font-medium">Staked Amount</p>
                    <p className="text-3xl font-light mb-1 text-white">{stakedAmount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">SOL</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/80 border border-gray-700/60 shadow-lg shadow-black/40 rounded-2xl backdrop-blur-md transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/90">
                  <CardContent className="p-8 text-center">
                    <p className="text-sm text-gray-400 mb-3 font-medium">Earned Rewards</p>
                    <p className="text-3xl font-light mb-1 text-[#4a85ff]">{earnedRewards.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">YIELD</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/80 border border-gray-700/60 shadow-lg shadow-black/40 rounded-2xl backdrop-blur-md transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/90">
                  <CardContent className="p-8 text-center">
                    <p className="text-sm text-gray-400 mb-3 font-medium">Current APY</p>
                    <p className="text-3xl font-light mb-1 text-[#4a85ff]">{apy}%</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Annual</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-3 gap-10">
                {/* Main Staking Interface */}
                <Card className="lg:col-span-2 bg-gray-900/80 border border-gray-700/60 shadow-lg shadow-black/40 rounded-2xl backdrop-blur-md transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/90">
                  <CardHeader className="pb-8">
                    <CardTitle className="text-3xl font-light text-white">Staking Interface</CardTitle>
                    <CardDescription className="text-gray-400 text-lg font-light">
                      Stake your SOL tokens to earn YIELD rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-10">
                    <div className="grid md:grid-cols-2 gap-10">
                      {/* Stake Section */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-[#4a85ff]/20 rounded-lg">
                            <ArrowUpRight className="w-5 h-5 text-[#4a85ff]" />
                          </div>
                          <h3 className="text-xl font-medium text-white">Stake Tokens</h3>
                        </div>

                        <div className="space-y-4">
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
                              className="bg-gray-800/80 border-gray-600/60 text-white placeholder-gray-500 pr-16 py-6 text-lg rounded-xl backdrop-blur-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">SOL</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Available: {walletBalance.toFixed(2)} SOL</span>
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
                          className="w-full bg-[#4a85ff] hover:bg-[#3a75ef] text-white py-6 text-lg rounded-xl shadow-md transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] disabled:opacity-50 disabled:hover:scale-100 font-medium"
                        >
                          {isStaking ? "Staking..." : "Stake SOL"}
                        </Button>
                      </div>

                      {/* Unstake Section */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-orange-400/20 rounded-lg">
                            <ArrowDownRight className="w-5 h-5 text-orange-400" />
                          </div>
                          <h3 className="text-xl font-medium text-white">Unstake Tokens</h3>
                        </div>

                        <div className="space-y-4">
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
                              className="bg-gray-800/80 border-gray-600/60 text-white placeholder-gray-500 pr-16 py-6 text-lg rounded-xl backdrop-blur-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">SOL</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Staked: {stakedAmount.toFixed(2)} SOL</span>
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
                          className="w-full border-gray-600/60 text-gray-300 hover:bg-gray-800/60 py-6 text-lg rounded-xl backdrop-blur-sm transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 font-medium"
                        >
                          {isUnstaking ? "Unstaking..." : "Unstake SOL"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sidebar */}
                <div className="space-y-8">
                  {/* Claim Rewards */}
                  <Card className="bg-gray-900/80 border border-gray-700/60 shadow-lg shadow-black/40 rounded-2xl backdrop-blur-md transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/90">
                    <CardHeader>
                      <CardTitle className="text-xl font-medium text-white">Claim Rewards</CardTitle>
                      <CardDescription className="text-gray-400 font-light">Your earned YIELD tokens</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center py-6">
                        <p className="text-4xl font-light text-[#4a85ff] mb-2">{earnedRewards.toFixed(2)}</p>
                        <p className="text-sm text-gray-400 uppercase tracking-wider">YIELD Tokens</p>
                      </div>
                      <Button
                        onClick={handleClaimRewards}
                        disabled={earnedRewards <= 0}
                        className="w-full bg-white text-black hover:bg-gray-100 py-6 text-lg rounded-xl shadow-md transition-all hover:scale-[1.02] font-medium"
                      >
                        Claim Rewards
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Pool Stats */}
                  <Card className="bg-gray-900/80 border border-gray-700/60 shadow-lg shadow-black/40 rounded-2xl backdrop-blur-md transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/90">
                    <CardHeader>
                      <CardTitle className="text-xl font-medium text-white">Pool Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-400 font-light">Total Value Locked</span>
                          <span className="font-medium text-lg text-white">${totalValueLocked.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-400 font-light">Total Stakers</span>
                          <span className="font-medium text-lg text-white">{totalStakers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-400 font-light">Current APY</span>
                          <span className="font-medium text-lg text-[#4a85ff]">{apy}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
