"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { FlowingBackground } from "../components/flowing-background"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TokenBalance } from "@/components/solana-rpc-methods/get-user-token-balance"
import { useWallet } from "@solana/wallet-adapter-react"
import { STAKE_APY } from "@/lib/constants"
import { calculateXLABSAccumulation } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function SolanaStakingDApp() {
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)
  const [isStakeDialogOpen, setIsStakeDialogOpen] = useState(false)
  const [isUnstakeDialogOpen, setIsUnstakeDialogOpen] = useState(false)
  const { publicKey, signTransaction } = useWallet()

  const walletBalance = TokenBalance()
  const [stakedAmount, setStakedAmount] = useState(0)
  const [totalRewardsEarned, setTotalRewardsEarned] = useState(0)
  const [currentRewards, setCurrentRewards] = useState(0)
  const [stakingStartTime, setStakingStartTime] = useState<Date | null>(null)
  const [totalValueLocked, setTotalValueLocked] = useState(0)
  // const [walletRewards, setWalletRewards] = useState<Map<string, number>>(new Map())

  // Update current rewards based on staking time
  useEffect(() => {
    if (stakingStartTime && stakedAmount > 0 && publicKey) {
      const updateRewards = () => {
        const now = new Date()
        const timeStaked = (now.getTime() - stakingStartTime.getTime()) / 1000 // Convert to seconds
        const daysStaked = timeStaked / (24 * 60 * 60) // Convert seconds to days
        const newRewards = calculateXLABSAccumulation(stakedAmount, daysStaked)
        setCurrentRewards(newRewards)
        
        // Update total rewards earned for current wallet
        // setWalletRewards(prev => {
        //   const newMap = new Map(prev)
        //   const currentWalletRewards = newMap.get(publicKey.toString()) || 0
        //   newMap.set(publicKey.toString(), currentWalletRewards + newRewards)
        //   return newMap
        // })
      }

      updateRewards()
      // Update every 100ms for smoother animation
      const interval = setInterval(updateRewards, 100)
      return () => clearInterval(interval)
    }
  }, [stakingStartTime, stakedAmount, publicKey])

  // Add smooth number animation component
  const SmoothNumber = ({ value, decimals = 4, align = 'right' }: { value: number, decimals?: number, align?: 'right' | 'center' }) => {
    const [displayValue, setDisplayValue] = useState(value)

    useEffect(() => {
      const startValue = displayValue
      const endValue = value
      const duration = 100 // Animation duration in ms
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function for smooth animation
        const easeOutQuad = (t: number) => t * (2 - t)
        const currentValue = startValue + (endValue - startValue) * easeOutQuad(progress)

        setDisplayValue(currentValue)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    // Format number with fixed width and consistent decimal places
    const formatNumber = (num: number) => {
      const useGrouping = align !== 'center'
      const formatted = num.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping,
      })

      if (align === 'center') {
        return <span className="tabular-nums">{formatted}</span>
      }

      // Split into integer and decimal parts
      const [intPart, decPart] = formatted.split('.')

      // Format with fixed width
      return (
        <span className="tabular-nums">
          <span className="inline-block min-w-[1.2em] text-right">{intPart}</span>
          <span className="inline-block">.</span>
          <span className="inline-block min-w-[4em] text-left">{decPart}</span>
        </span>
      )
    }

    return formatNumber(displayValue)
  }

  const handleReset = () => {
    setStakeAmount("")
    setUnstakeAmount("")
    setIsStaking(false)
    setIsUnstaking(false)
    setStakedAmount(0)
    setCurrentRewards(0)
    setStakingStartTime(null)
    setTotalValueLocked(0)
  }

  // Helper to format numbers with commas
  const formatWithCommas = (value: string) => {
    if (!value) return '';
    // Remove all non-digit and non-decimal characters
    const [intPart, decPart] = value.replace(/,/g, '').split('.');
    const formattedInt = parseInt(intPart || '0', 10).toLocaleString();
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  };

  const handleStake = async () => {
    if (!stakeAmount || Number.parseFloat(stakeAmount.replace(/,/g, '')) <= 0) return;
    if (!publicKey || !signTransaction) {
      console.error("Wallet not connected");
      return;
    }

    setIsStaking(true);
    try {
      // TODO: Implement actual staking logic
      const amountToStake = Number.parseFloat(stakeAmount.replace(/,/g, ''));
      setStakedAmount(prev => prev + amountToStake);
      setStakingStartTime(new Date());
      setTotalValueLocked(prev => prev + amountToStake);
      setStakeAmount("");
    } catch (error: unknown) {
      console.error("Error in staking process:", error);
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || Number.parseFloat(unstakeAmount.replace(/,/g, '')) <= 0) return;
    if (!publicKey || !signTransaction) {
      console.error("Wallet not connected");
      return;
    }

    setIsUnstaking(true);
    try {
      const amountToUnstake = Number.parseFloat(unstakeAmount.replace(/,/g, ''));
      if (amountToUnstake > stakedAmount) {
        console.error("Cannot unstake more than staked amount");
        return;
      }

      // TODO: Implement actual unstaking logic
      setStakedAmount(prev => prev - amountToUnstake);
      setTotalValueLocked(prev => prev - amountToUnstake);
      
      // Add current rewards to total rewards earned before resetting
      if (currentRewards > 0) {
        setTotalRewardsEarned(prev => prev + currentRewards);
      }
      
      // If all tokens are unstaked, reset staking time and current rewards
      if (stakedAmount - amountToUnstake === 0) {
        setStakingStartTime(null);
        setCurrentRewards(0);
      }
      
      setUnstakeAmount("");
    } catch (error: unknown) {
      console.error("Error in unstaking process:", error);
    } finally {
      setIsUnstaking(false);
    }
  }

  const handleClaimRewards = async () => {
    if (!publicKey || !signTransaction) {
      console.error("Wallet not connected");
      return;
    }

    try {
      // TODO: Implement actual claim rewards logic
      const totalToClaim = currentRewards + totalRewardsEarned;
      
      // Add current rewards to total rewards earned
      setTotalRewardsEarned(prev => prev + currentRewards);
      
      // Reset current rewards and staking time to start fresh accumulation
      setCurrentRewards(0);
      setStakingStartTime(new Date());

      // TODO: Add transaction logic here to actually claim the rewards
      console.log(`Claiming ${totalToClaim} xLABS tokens`);
      
    } catch (error: unknown) {
      console.error("Error in claiming rewards:", error);
    }
  }

  // Utility to get available balance after staking
  const availableBalance = Math.max(walletBalance - stakedAmount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050810] via-[#0a0f1a] to-[#050810] text-white relative overflow-x-hidden flex flex-col">
      <div className="absolute inset-0 pointer-events-none z-0 bg-black/40 backdrop-blur-2xl" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(74,133,255,0.03) 0%, transparent 70%)'
      }} />
      <FlowingBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="">
          <Navbar onTitleClick={handleReset} />
        </div>

        <div className="container mx-auto sm:px-2 px-1 py-6 sm:py-8 md:py-12 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-8 md:gap-10">
            {/* Main Staking Interface */}
            <Card className="lg:col-span-3 bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30">
              <CardHeader>
                <CardTitle className="text-base sm:text-xl font-medium text-white">The Staking Lab</CardTitle>
                <CardDescription className="text-gray-400 font-light text-xs sm:text-base">
                  Stake your LABS tokens to earn xLABS revenue sharing tokens!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-10">
                  {/* Stake Section */}
                  <div className="space-y-3 sm:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                      <div className="p-2 bg-[#4a85ff]/20 rounded-lg">
                        <ArrowUpRight className="w-5 h-5 text-[#4a85ff]" />
                      </div>
                      <h3 className="text-base sm:text-xl font-medium text-white">Stake Tokens</h3>
                    </div>

                    <div className="space-y-1 sm:space-y-4">
                      <Label htmlFor="stake-amount" className="text-gray-300 font-medium text-xs sm:text-base">
                        Amount to Stake
                      </Label>
                      <div className="relative">
                        <Input
                          id="stake-amount"
                          type="text"
                          autoComplete="off"
                          inputMode="decimal"
                          pattern="[0-9]*\.?[0-9]*"
                          placeholder="0.00"
                          value={formatWithCommas(stakeAmount)}
                          onChange={e => {
                            // Remove commas for storage
                            const rawValue = e.target.value.replace(/,/g, '');
                            if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
                              setStakeAmount(rawValue);
                            }
                          }}
                          className="bg-gray-800/30 border-gray-600/40 text-white placeholder-gray-500 pr-16 py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl backdrop-blur-xl w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm font-medium">LABS</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span
                          className="text-gray-400 underline-balance hover:text-[#4a85ff] transition-colors"
                          onClick={() => setStakeAmount(
                            availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          )}
                          title="Click to use full available balance"
                        >
                          Available: {availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS
                        </span>
                      </div>
                    </div>

                    <Dialog open={isStakeDialogOpen} onOpenChange={setIsStakeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          disabled={!stakeAmount || Number.parseFloat(stakeAmount.replace(/,/g, '')) <= 0 || isStaking}
                          className="w-full bg-[#4a85ff] hover:bg-[#3a75ef] text-white py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] disabled:opacity-50 disabled:hover:scale-100 font-medium"
                        >
                          {isStaking ? "Staking..." : "Stake LABS"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
                        <DialogHeader>
                          <DialogTitle>Confirm Stake</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Are you sure you want to stake {stakeAmount} LABS?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end space-x-4 pt-4">
                          <Button variant="outline" className="border-gray-600/60 text-black hover:bg-gray-800/60" onClick={() => setIsStakeDialogOpen(false)}>Cancel</Button>
                          <Button className="bg-[#4a85ff] hover:bg-[#3a75ef] text-white" onClick={() => {
                            handleStake();
                            setIsStakeDialogOpen(false);
                          }}>Confirm</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Unstake Section */}
                  <div className="space-y-3 sm:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                      <div className="p-2 bg-orange-400/20 rounded-lg">
                        <ArrowDownRight className="w-5 h-5 text-orange-400" />
                      </div>
                      <h3 className="text-base sm:text-xl font-medium text-white">Unstake Tokens</h3>
                    </div>

                    <div className="space-y-1 sm:space-y-4">
                      <Label htmlFor="unstake-amount" className="text-gray-300 font-medium text-xs sm:text-base">
                        Amount to Unstake
                      </Label>
                      <div className="relative">
                        <Input
                          id="unstake-amount"
                          type="text"
                          autoComplete="off"
                          inputMode="decimal"
                          pattern="[0-9]*\.?[0-9]*"
                          placeholder="0.00"
                          value={formatWithCommas(unstakeAmount)}
                          onChange={e => {
                            const rawValue = e.target.value.replace(/,/g, '');
                            if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
                              setUnstakeAmount(rawValue);
                            }
                          }}
                          className="bg-gray-800/30 border-gray-600/40 text-white placeholder-gray-500 pr-16 py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl backdrop-blur-xl w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm font-medium">LABS</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span
                          className="text-gray-400 underline-balance hover:text-[#4a85ff] transition-colors"
                          onClick={() => setUnstakeAmount(
                            stakedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          )}
                          title="Click to use full staked amount"
                        >
                          Staked: {stakedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS
                        </span>
                      </div>
                    </div>

                    <Dialog open={isUnstakeDialogOpen} onOpenChange={setIsUnstakeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          disabled={!unstakeAmount || Number.parseFloat(unstakeAmount.replace(/,/g, '')) <= 0 || isUnstaking}
                          className="w-full bg-white text-black hover:bg-gray-200 py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 font-medium"
                        >
                          {isUnstaking ? "Unstaking..." : "Unstake LABS"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
                        <DialogHeader>
                          <DialogTitle>Confirm Unstake</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Are you sure you want to unstake {unstakeAmount} LABS?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end space-x-4 pt-4">
                          <Button variant="outline" className="border-gray-600/60 text-black hover:bg-gray-800/60" onClick={() => setIsUnstakeDialogOpen(false)}>Cancel</Button>
                          <Button className="bg-orange-400 hover:bg-orange-500 text-white" onClick={() => {
                            handleUnstake();
                            setIsUnstakeDialogOpen(false);
                          }}>Confirm</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-8">
              {/* Stake Pool Details */}
              <Card className="bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30">
                <CardHeader>
                  <CardTitle className="text-base sm:text-xl font-medium text-white">Stake Pool Details</CardTitle>
                  <CardDescription className="text-gray-400 font-light text-xs sm:text-base">
                    The current state of the stake pool.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Value Locked (LABS):</span>
                    <span className="font-mono text-white">{totalValueLocked.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Staking APY:</span>
                    <span className="font-mono text-[#4a85ff]" style={{ textShadow: "0 0 8px #4a85ff" }}>{STAKE_APY}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Account Overview */}
              <Card className="bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30">
                <CardHeader>
                  <CardTitle className="text-base sm:text-xl font-medium text-white">Account Overview</CardTitle>
                  <CardDescription className="text-gray-400 font-light text-xs sm:text-base">
                    Your personal staking details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Available Balance:</span  >
                    <span className="font-mono text-white">{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Staked Amount:</span>
                    <span className="font-mono text-white">{stakedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Rewards:</span>
                    <div className="font-mono text-[#4a85ff] flex items-center gap-1">
                      <span>{(totalRewardsEarned + currentRewards).toFixed(4)}</span>
                      <span className="text-[#4a85ff]">xLABS</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Claim Rewards */}
              <Card className="bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30">
                <CardHeader>
                  <CardTitle className="text-base sm:text-xl font-medium text-white">Claim Rewards</CardTitle>
                  <CardDescription className="text-gray-400 font-light text-xs sm:text-base">Your current xLABS tokens to claim</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-6">
                  <div className="text-center py-2 sm:py-6">
                    <p className="text-xl sm:text-4xl font-light text-[#4a85ff] mb-2">
                      <SmoothNumber value={currentRewards} align="center" />
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">xLABS</p>
                  </div>
                  <Button
                    onClick={handleClaimRewards}
                    disabled={currentRewards <= 0}
                    className="w-full bg-white text-black hover:bg-gray-100 py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] font-medium disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {currentRewards > 0 ? "Claim Rewards" : "No Rewards to Claim"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  )
}
