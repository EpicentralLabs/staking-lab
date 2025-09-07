"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useStakeToStakePoolMutation, useUnstakeFromStakePoolMutation, useClaimFromStakePoolMutation } from "@/components/staking/staking-data-access"
import { useWalletUi, WalletUiDropdown } from "@wallet-ui/react"
import { useUserLabsAccount, useUserStakeAccount, useVaultAccount, useStakePoolConfigData } from "@/components/shared/data-access"
import { StakeAccount } from "@program-client"
import { useRealtimePendingRewards } from "@/components/use-realtime-pending-rewards"
export default function StakingPage() {
  const { account } = useWalletUi()

  if (!account) {
    return (
      <div>
        <p>You are not connected to a wallet</p>
        <WalletUiDropdown />
      </div>
    )
  }
  return (
    <StakingPageConnected />
  );
}

function StakingPageConnected() {
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [isStakeDialogOpen, setIsStakeDialogOpen] = useState(false)
  const [isUnstakeDialogOpen, setIsUnstakeDialogOpen] = useState(false)
  const userLabsAccountQuery = useUserLabsAccount()
  // Mutation hooks for staking and unstaking
  const stakeMutation = useStakeToStakePoolMutation()
  const unstakeMutation = useUnstakeFromStakePoolMutation()
  const claimMutation = useClaimFromStakePoolMutation()
  const userStakeAccountQuery = useUserStakeAccount()

  // New hooks for TVL and APY
  const vaultAccountQuery = useVaultAccount()
  const stakePoolConfigQuery = useStakePoolConfigData()

  // Extract stake account data safely
  const stakeAccountData = (() => {
    if (!userStakeAccountQuery.data || !userStakeAccountQuery.data.exists) {
      return null;
    }
    return userStakeAccountQuery.data.data;
  })();

  // Use real-time pending rewards calculation
  const realtimeRewardsQuery = useRealtimePendingRewards(stakeAccountData);

  // Get wallet balance from user labs account query - properly reactive now!
  const walletBalance = (() => {
    const tokenData = userLabsAccountQuery.data;
    if (!tokenData) return 0;

    // Handle the Account<Token, string> structure from fetchToken
    if (tokenData.data?.amount) {
      return Number(tokenData.data.amount) / 1e9;
    }

    // Log the actual structure for debugging
    console.log('Token account structure:', tokenData);
    return 0;
  })();

  // Get actual staking data from stake account
  const stakedAmount = stakeAccountData ? Number(stakeAccountData.stakedAmount) / 1e9 : 0;
  const pendingRewards = realtimeRewardsQuery.realtimeRewards ? Number(realtimeRewardsQuery.realtimeRewards) / 1e9 : 0;
  const totalRewardsEarned = stakeAccountData ? Number(stakeAccountData.rewardsEarned) / 1e9 : 0;
  const currentRewards = pendingRewards; // Real-time calculated pending rewards

  // Get TVL from vault account
  const totalValueLocked = (() => {
    if (!vaultAccountQuery.data?.data?.amount) return 0;
    return Number(vaultAccountQuery.data.data.amount) / 1e9;
  })();

  // Get APY from stake pool config (convert from basis points to percentage)
  const stakeApy = (() => {
    if (!stakePoolConfigQuery.data?.data?.aprBps) return 0;
    return Number(stakePoolConfigQuery.data.data.aprBps) / 100; // Convert basis points to percentage
  })();

  // Show loading state if wallet balance is still loading - now properly reactive!
  const isBalanceLoading = userLabsAccountQuery.isLoading || realtimeRewardsQuery.isLoading
  const balanceError = userLabsAccountQuery.error || realtimeRewardsQuery.error

  // Loading states for TVL and APY
  const isTvlLoading = vaultAccountQuery.isLoading
  const isApyLoading = stakePoolConfigQuery.isLoading
  // Helper to format numbers with commas
  const formatWithCommas = (value: string) => {
    if (!value) return '';
    const [intPart, decPart] = value.replace(/,/g, '').split('.');
    const formattedInt = parseInt(intPart || '0', 10).toLocaleString();
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  };

  // Handle stake confirmation
  const handleStakeConfirm = async () => {
    if (!stakeAmount || Number.parseFloat(stakeAmount.replace(/,/g, '')) <= 0) return;

    try {
      const amount = Math.floor(Number.parseFloat(stakeAmount.replace(/,/g, '')) * 1e9); // Convert to lamports (assuming 9 decimals)
      await stakeMutation.mutateAsync(amount);
      setStakeAmount("");
      setIsStakeDialogOpen(false);
    } catch (error) {
      console.error('Staking failed:', error);
    }
  };

  // Handle unstake confirmation
  const handleUnstakeConfirm = async () => {
    if (!unstakeAmount || Number.parseFloat(unstakeAmount.replace(/,/g, '')) <= 0) return;

    try {
      const amount = Math.floor(Number.parseFloat(unstakeAmount.replace(/,/g, '')) * 1e9); // Convert to lamports (assuming 9 decimals)
      await unstakeMutation.mutateAsync(amount);
      setUnstakeAmount("");
      setIsUnstakeDialogOpen(false);
    } catch (error) {
      console.error('Unstaking failed:', error);
    }
  };

  // Handle claim confirmation
  const handleClaimConfirm = async () => {
    if (currentRewards <= 0) return;

    try {
      // For claim, we don't need to pass an amount since it claims all available rewards
      await claimMutation.mutateAsync(0);
    } catch (error) {
      console.error('Claiming failed:', error);
    }
  };

  const availableBalance = Math.max(walletBalance - stakedAmount, 0);

  return (
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
                      onClick={() => !isBalanceLoading && setStakeAmount(
                        availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      )}
                      title={isBalanceLoading ? "Loading balance..." : "Click to use full available balance"}
                    >
                      Available: {isBalanceLoading ? (
                        <span className="inline-flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Loading...
                        </span>
                      ) : balanceError ? (
                        "Error loading balance"
                      ) : (
                        `${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS`
                      )}
                    </span>
                  </div>
                </div>

                <Dialog open={isStakeDialogOpen} onOpenChange={setIsStakeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      disabled={!stakeAmount || Number.parseFloat(stakeAmount.replace(/,/g, '')) <= 0 || stakeMutation.isPending}
                      className="w-full bg-[#4a85ff] hover:bg-[#3a75ef] text-white py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] disabled:opacity-50 disabled:hover:scale-100 font-medium"
                    >
                      {stakeMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Staking...
                        </>
                      ) : (
                        "Stake LABS"
                      )}
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
                      <Button
                        variant="outline"
                        className="border-gray-600/60 text-black hover:bg-gray-800/60"
                        onClick={() => setIsStakeDialogOpen(false)}
                        disabled={stakeMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-[#4a85ff] hover:bg-[#3a75ef] text-white"
                        onClick={handleStakeConfirm}
                        disabled={stakeMutation.isPending}
                      >
                        {stakeMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          "Confirm"
                        )}
                      </Button>
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
                      disabled={!unstakeAmount || Number.parseFloat(unstakeAmount.replace(/,/g, '')) <= 0 || unstakeMutation.isPending}
                      className="w-full bg-white text-black hover:bg-gray-200 py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 font-medium"
                    >
                      {unstakeMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Unstaking...
                        </>
                      ) : (
                        "Unstake LABS"
                      )}
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
                      <Button
                        variant="outline"
                        className="border-gray-600/60 text-black hover:bg-gray-800/60"
                        onClick={() => setIsUnstakeDialogOpen(false)}
                        disabled={unstakeMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-orange-400 hover:bg-orange-500 text-white"
                        onClick={handleUnstakeConfirm}
                        disabled={unstakeMutation.isPending}
                      >
                        {unstakeMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          "Confirm"
                        )}
                      </Button>
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
                <span className="font-mono text-white">
                  {isTvlLoading ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    `${totalValueLocked.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Staking APY:</span>
                <span className="font-mono text-[#4a85ff]" style={{ textShadow: "0 0 8px #4a85ff" }}>
                  {isApyLoading ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    `${stakeApy}%`
                  )}
                </span>
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
                <span className="text-gray-400">Available Balance:</span>
                <span className="font-mono text-white">
                  {isBalanceLoading ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading...
                    </span>
                  ) : balanceError ? (
                    "Error"
                  ) : (
                    `${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Stake Account Status:</span>
                <span className="font-mono text-white">
                  {userStakeAccountQuery.isLoading ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading...
                    </span>
                  ) : stakeAccountData ? (
                    <span className="text-green-400">Active</span>
                  ) : (
                    <span className="text-gray-500">Not Created</span>
                  )}
                </span>
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
              <CardDescription className="text-gray-400 font-light text-xs sm:text-base">
                Your current xLABS tokens to claim • Updates live based on staking time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-6">
              <div className="text-center py-2 sm:py-6">
                <div className="relative">
                  <p className="text-xl sm:text-4xl font-light text-[#4a85ff] mb-2 tabular-nums">
                    {currentRewards.toFixed(4)}
                  </p>
                  {currentRewards > 0 && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">
                  xLABS {currentRewards > 0 && "(Live)"}
                </p>
              </div>
              <Button
                disabled={currentRewards <= 0 || claimMutation.isPending}
                className="w-full bg-white text-black hover:bg-gray-100 py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] font-medium disabled:opacity-50 disabled:hover:scale-100"
                onClick={handleClaimConfirm}
              >
                {claimMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Claiming...
                  </>
                ) : currentRewards > 0 ? (
                  "Claim Rewards"
                ) : (
                  "No Rewards to Claim"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}