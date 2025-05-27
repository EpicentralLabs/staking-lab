"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Wallet, Coins, ArrowUpRight, ArrowDownRight, Github, Twitter, ExternalLink } from "lucide-react"
import { FlowingBackground } from "../components/flowing-background"

export default function SolanaStakingDApp() {
  const [isConnected, setIsConnected] = useState(false)
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)

  // Mock data - in a real app, this would come from Solana blockchain
  const mockData = {
    walletBalance: 1250.75,
    stakedAmount: 500.0,
    earnedRewards: 12.45,
    apy: 8.5,
    stakingToken: "SOL",
    rewardToken: "YIELD",
    totalValueLocked: 2500000,
    totalStakers: 1247,
  }

  const handleConnectWallet = () => {
    setIsConnected(true)
  }

  const handleStake = async () => {
    if (!stakeAmount || Number.parseFloat(stakeAmount) <= 0) return

    setIsStaking(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsStaking(false)
    setStakeAmount("")
  }

  const handleUnstake = async () => {
    if (!unstakeAmount || Number.parseFloat(unstakeAmount) <= 0) return

    setIsUnstaking(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsUnstaking(false)
    setUnstakeAmount("")
  }

  const handleClaimRewards = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <FlowingBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#4a85ff] rounded-md flex items-center justify-center">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold">SolanaStake</span>
              </div>

              <nav className="hidden md:flex items-center gap-8">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Stake
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Pools
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Analytics
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Docs
                </a>
              </nav>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Github className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                {!isConnected ? (
                  <Button onClick={handleConnectWallet} className="bg-white text-black hover:bg-gray-100">
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                ) : (
                  <Badge variant="outline" className="border-[#4a85ff] text-[#4a85ff]">
                    <div className="w-2 h-2 bg-[#4a85ff] rounded-full mr-2"></div>
                    Connected
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          {!isConnected ? (
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-light mb-6 leading-tight">
                Stake SOL,
                <br />
                <span className="text-[#4a85ff]">Earn YIELD</span>
              </h1>
              <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                Maximize your Solana holdings through our high-yield staking protocol. Earn rewards while contributing
                to network security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleConnectWallet}
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg"
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-6 text-lg"
                >
                  Learn More
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-gray-400 mb-2">Wallet Balance</p>
                    <p className="text-2xl font-semibold">{mockData.walletBalance.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{mockData.stakingToken}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-gray-400 mb-2">Staked Amount</p>
                    <p className="text-2xl font-semibold">{mockData.stakedAmount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{mockData.stakingToken}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-gray-400 mb-2">Earned Rewards</p>
                    <p className="text-2xl font-semibold text-[#4a85ff]">{mockData.earnedRewards.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{mockData.rewardToken}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-gray-400 mb-2">Current APY</p>
                    <p className="text-2xl font-semibold text-[#4a85ff]">{mockData.apy}%</p>
                    <p className="text-xs text-gray-500">Annual</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Staking Interface */}
                <Card className="lg:col-span-2 bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">Staking Interface</CardTitle>
                    <CardDescription className="text-gray-400">
                      Stake your SOL tokens to earn YIELD rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Stake Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <ArrowUpRight className="w-5 h-5 text-[#4a85ff]" />
                          <h3 className="text-lg font-semibold">Stake Tokens</h3>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="stake-amount" className="text-gray-300">
                            Amount to Stake
                          </Label>
                          <div className="relative">
                            <Input
                              id="stake-amount"
                              type="number"
                              placeholder="0.00"
                              value={stakeAmount}
                              onChange={(e) => setStakeAmount(e.target.value)}
                              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 pr-16"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">SOL</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Available: {mockData.walletBalance.toFixed(2)} SOL</span>
                            <button
                              className="text-[#4a85ff] hover:underline"
                              onClick={() => setStakeAmount(mockData.walletBalance.toString())}
                            >
                              Max
                            </button>
                          </div>
                        </div>

                        <Button
                          onClick={handleStake}
                          disabled={!stakeAmount || Number.parseFloat(stakeAmount) <= 0 || isStaking}
                          className="w-full bg-[#4a85ff] hover:bg-[#3a75ef] text-white"
                        >
                          {isStaking ? "Staking..." : "Stake SOL"}
                        </Button>
                      </div>

                      {/* Unstake Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <ArrowDownRight className="w-5 h-5 text-orange-400" />
                          <h3 className="text-lg font-semibold">Unstake Tokens</h3>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="unstake-amount" className="text-gray-300">
                            Amount to Unstake
                          </Label>
                          <div className="relative">
                            <Input
                              id="unstake-amount"
                              type="number"
                              placeholder="0.00"
                              value={unstakeAmount}
                              onChange={(e) => setUnstakeAmount(e.target.value)}
                              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 pr-16"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">SOL</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Staked: {mockData.stakedAmount.toFixed(2)} SOL</span>
                            <button
                              className="text-[#4a85ff] hover:underline"
                              onClick={() => setUnstakeAmount(mockData.stakedAmount.toString())}
                            >
                              Max
                            </button>
                          </div>
                        </div>

                        <Button
                          onClick={handleUnstake}
                          disabled={!unstakeAmount || Number.parseFloat(unstakeAmount) <= 0 || isUnstaking}
                          variant="outline"
                          className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          {isUnstaking ? "Unstaking..." : "Unstake SOL"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Claim Rewards */}
                  <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Claim Rewards</CardTitle>
                      <CardDescription className="text-gray-400">Your earned YIELD tokens</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center py-4">
                        <p className="text-3xl font-bold text-[#4a85ff] mb-1">{mockData.earnedRewards.toFixed(2)}</p>
                        <p className="text-sm text-gray-400">YIELD Tokens</p>
                      </div>
                      <Button
                        onClick={handleClaimRewards}
                        disabled={mockData.earnedRewards <= 0}
                        className="w-full bg-white text-black hover:bg-gray-100"
                      >
                        Claim Rewards
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Pool Stats */}
                  <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Pool Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Value Locked</span>
                          <span className="font-medium">${mockData.totalValueLocked.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Stakers</span>
                          <span className="font-medium">{mockData.totalStakers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Current APY</span>
                          <span className="font-medium text-[#4a85ff]">{mockData.apy}%</span>
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
