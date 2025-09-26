"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowUpRight, ArrowDownRight, Loader2, RefreshCw } from "lucide-react"
import { useEnhancedStakeToStakePoolMutation, useEnhancedUnstakeFromStakePoolMutation, useEnhancedClaimFromStakePoolMutation } from "@/components/staking/staking-mutations"
import { useCoordinatedRefetch } from "@/hooks/use-coordinated-refetch"
import { useWalletUi, WalletUiDropdown } from "@wallet-ui/react"
import { useUserLabsAccount, useUserStakeAccount, useVaultAccount, useStakePoolConfigData } from "@/components/shared/data-access"
import { useRealtimePendingRewards } from "@/components/use-realtime-pending-rewards"
import { AnimatedRewardCounter } from "@/components/ui/animated-reward-counter"
import { TransactionButton } from "@/components/ui/transaction-button"
import { STAKE_REFETCH_DELAY, UNSTAKE_REFETCH_DELAY, ACCOUNT_OVERVIEW_REFETCH_DELAY, STAKE_POOL_AUTO_REFRESH_INTERVAL } from "@/components/constants"

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
  const [stakeError, setStakeError] = useState("")
  const [unstakeError, setUnstakeError] = useState("")

  // Query hooks
  const userLabsAccountQuery = useUserLabsAccount()
  const userStakeAccountQuery = useUserStakeAccount()
  const vaultAccountQuery = useVaultAccount()
  const stakePoolConfigQuery = useStakePoolConfigData()

  // Coordinated refetch hook
  const { isRefetching, refetchStakingQueries, refetchUnstakingQueries, refetchClaimingQueries } = useCoordinatedRefetch()

  // Enhanced mutation hooks with coordinated refetch
  const stakeMutation = useEnhancedStakeToStakePoolMutation(refetchStakingQueries)
  const unstakeMutation = useEnhancedUnstakeFromStakePoolMutation(refetchUnstakingQueries)
  const claimMutation = useEnhancedClaimFromStakePoolMutation(refetchClaimingQueries)

  // Extract stake account data - reactive to query changes
  const stakeAccountData = useMemo(() => {
    if (!userStakeAccountQuery.data || !userStakeAccountQuery.data.exists) {
      return null;
    }
    return userStakeAccountQuery.data.data;
  }, [userStakeAccountQuery.data]);

  // Real-time pending rewards
  const realtimeRewardsQuery = useRealtimePendingRewards(stakeAccountData);

  // Auto-refresh stake pool details every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      // Only refetch stake pool related data for the details section
      await Promise.all([
        vaultAccountQuery.refetch(),
        stakePoolConfigQuery.refetch(),
      ]);
    }, STAKE_POOL_AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [vaultAccountQuery, stakePoolConfigQuery]);

  // Auto-refresh account overview every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      // Refetch user account data for the account overview section
      await Promise.all([
        userLabsAccountQuery.refetch(),
        userStakeAccountQuery.refetch(),
      ]);
    }, ACCOUNT_OVERVIEW_REFETCH_DELAY);

    return () => clearInterval(interval);
  }, [userLabsAccountQuery, userStakeAccountQuery]);

  // Balance calculations - reactive to query data changes
  const walletBalance = useMemo(() => {
    const tokenData = userLabsAccountQuery.data;
    if (!tokenData?.data?.amount) return 0;
    return Number(tokenData.data.amount) / 1e9;
  }, [userLabsAccountQuery.data]);

  const stakedAmount = useMemo(() => {
    return stakeAccountData ? Number(stakeAccountData.stakedAmount) / 1e9 : 0;
  }, [stakeAccountData]);

  const pendingRewards = useMemo(() => {
    return realtimeRewardsQuery.realtimeRewards ? Number(realtimeRewardsQuery.realtimeRewards) / 1e9 : 0;
  }, [realtimeRewardsQuery.realtimeRewards]);

  const totalValueLocked = useMemo(() => {
    return vaultAccountQuery.data?.data?.amount ? Number(vaultAccountQuery.data.data.amount) / 1e9 : 0;
  }, [vaultAccountQuery.data]);

  const stakeApy = useMemo(() => {
    return stakePoolConfigQuery.data?.data?.aprBps ? Number(stakePoolConfigQuery.data.data.aprBps) / 100 : 0;
  }, [stakePoolConfigQuery.data]);

  const availableBalance = walletBalance;

  // Input validation - wrapped in useCallback to be reactive to balance changes
  const validateStakeAmount = useMemo(() => (amount: string) => {
    const numAmount = Number.parseFloat(amount.replace(/,/g, ''))
    if (isNaN(numAmount) || numAmount <= 0) {
      return "Please enter a valid amount"
    }
    if (numAmount > availableBalance) {
      return `Insufficient balance. Available: ${availableBalance.toFixed(2)} LABS`
    }
    return ""
  }, [availableBalance]);

  const validateUnstakeAmount = useMemo(() => (amount: string) => {
    const numAmount = Number.parseFloat(amount.replace(/,/g, ''))
    if (isNaN(numAmount) || numAmount <= 0) {
      return "Please enter a valid amount"
    }
    if (numAmount > stakedAmount) {
      return `Insufficient staked amount. Staked: ${stakedAmount.toFixed(2)} LABS`
    }
    return ""
  }, [stakedAmount]);

  // Real-time validation
  useEffect(() => {
    if (stakeAmount) {
      setStakeError(validateStakeAmount(stakeAmount))
    }
  }, [stakeAmount, availableBalance, validateStakeAmount])

  useEffect(() => {
    if (unstakeAmount) {
      setUnstakeError(validateUnstakeAmount(unstakeAmount))
    }
  }, [unstakeAmount, stakedAmount, validateUnstakeAmount])

  // Helper to format numbers with commas
  const formatWithCommas = (value: string) => {
    if (!value) return '';
    const [intPart, decPart] = value.replace(/,/g, '').split('.');
    const formattedInt = parseInt(intPart || '0', 10).toLocaleString();
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  };

  // Transaction handlers - direct execution with toast feedback and delayed refresh
  const handleStakeConfirm = async () => {
    if (!stakeAmount || Number.parseFloat(stakeAmount.replace(/,/g, '')) <= 0) return;

    try {
      const amount = Math.floor(Number.parseFloat(stakeAmount.replace(/,/g, '')) * 1e9);
      await stakeMutation.mutateAsync(amount);
      setStakeAmount("");
      
      // Wait for blockchain data to propagate, then refetch (5 seconds for deposits)
      setTimeout(async () => {
        await refetchStakingQueries();
      }, STAKE_REFETCH_DELAY);
    } catch {
      // Error handled by mutation
    }
  };

  const handleUnstakeConfirm = async () => {
    if (!unstakeAmount || Number.parseFloat(unstakeAmount.replace(/,/g, '')) <= 0) return;

    try {
      const amount = Math.floor(Number.parseFloat(unstakeAmount.replace(/,/g, '')) * 1e9);
      await unstakeMutation.mutateAsync(amount);
      setUnstakeAmount("");
      
      // Wait for blockchain data to propagate, then refetch (2 seconds for withdrawals)
      setTimeout(async () => {
        await refetchUnstakingQueries();
      }, UNSTAKE_REFETCH_DELAY);
    } catch {
      // Error handled by mutation
    }
  };

  const handleClaimConfirm = async () => {
    if (pendingRewards <= 0) return;

    try {
      await claimMutation.mutateAsync();
      
      // Wait for blockchain data to propagate, then refetch (5 seconds for account overview)
      setTimeout(async () => {
        await refetchClaimingQueries();
      }, ACCOUNT_OVERVIEW_REFETCH_DELAY);
    } catch {
      // Error handled by mutation
    }
  };

  // Get transaction states for buttons
  const getStakeTransactionState = () => {
    if (stakeMutation.isPending) return stakeMutation.isSuccess ? 'success' : 'submitting'
    if (stakeMutation.isError) return 'error'
    return 'idle'
  }

  const getUnstakeTransactionState = () => {
    if (unstakeMutation.isPending) return unstakeMutation.isSuccess ? 'success' : 'submitting'
    if (unstakeMutation.isError) return 'error'
    return 'idle'
  }

  const getClaimTransactionState = () => {
    if (claimMutation.isPending) return claimMutation.isSuccess ? 'success' : 'submitting'
    if (claimMutation.isError) return 'error'
    return 'idle'
  }

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

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Available:</span>
                    <div className="flex items-center gap-1">
                      {isRefetching && (
                        <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                      )}
                      <span
                        className="font-mono text-white cursor-pointer hover:text-blue-400 transition-colors"
                        onClick={() => !userLabsAccountQuery.isLoading && setStakeAmount(
                          availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        )}
                        title="Click to use full available balance"
                      >
                        {userLabsAccountQuery.isLoading ? (
                          "Loading..."
                        ) : isRefetching ? (
                          "Updating..."
                        ) : userLabsAccountQuery.error ? (
                          "Error"
                        ) : (
                          `${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS`
                        )}
                      </span>
                    </div>
                  </div>

                  {stakeError && (
                    <p className="text-red-400 text-xs">{stakeError}</p>
                  )}
                </div>

                <TransactionButton
                  transactionState={getStakeTransactionState()}
                  idleText="Stake LABS"
                  submittingText="Submitting..."
                  confirmingText="Confirming..."
                  successText="Stake Complete!"
                  errorText="Stake Failed - Retry"
                  disabled={!stakeAmount || !!stakeError || Number.parseFloat(stakeAmount.replace(/,/g, '')) <= 0}
                  className="w-full bg-[#4a85ff] hover:bg-[#3a75ef] text-white py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] disabled:opacity-50 disabled:hover:scale-100 font-medium"
                  onClick={handleStakeConfirm}
                  onRetry={() => stakeMutation.reset()}
                />
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

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Staked:</span>
                    <div className="flex items-center gap-1">
                      {isRefetching && (
                        <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                      )}
                      <span
                        className="font-mono text-white cursor-pointer hover:text-blue-400 transition-colors"
                        onClick={() => setUnstakeAmount(
                          stakedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        )}
                        title="Click to use full staked amount"
                      >
                        {isRefetching ? (
                          "Updating..."
                        ) : (
                          `${stakedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS`
                        )}
                      </span>
                    </div>
                  </div>

                  {unstakeError && (
                    <p className="text-red-400 text-xs">{unstakeError}</p>
                  )}
                </div>

                <TransactionButton
                  transactionState={getUnstakeTransactionState()}
                  idleText="Unstake LABS"
                  submittingText="Submitting..."
                  confirmingText="Confirming..."
                  successText="Unstake Complete!"
                  errorText="Unstake Failed - Retry"
                  disabled={!unstakeAmount || !!unstakeError || Number.parseFloat(unstakeAmount.replace(/,/g, '')) <= 0}
                  className="w-full bg-white text-black hover:bg-gray-200 py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 font-medium"
                  onClick={handleUnstakeConfirm}
                  onRetry={() => unstakeMutation.reset()}
                />
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
                <span className="text-gray-400">Total Value Locked:</span>
                <div className="flex items-center gap-1">
                  {isRefetching && (
                    <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                  )}
                  <span className="font-mono text-white">
                    {vaultAccountQuery.isLoading ? (
                      "Loading..."
                    ) : isRefetching ? (
                      "Updating..."
                    ) : vaultAccountQuery.error ? (
                      "Error"
                    ) : (
                      `${totalValueLocked.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS`
                    )}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Staking APY:</span>
                <span className="font-mono text-[#4a85ff]" style={{ textShadow: "0 0 8px #4a85ff" }}>
                  {stakePoolConfigQuery.isLoading ? "Loading..." : `${stakeApy}%`}
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
                <div className="flex items-center gap-1">
                  {isRefetching && (
                    <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                  )}
                  <span className="font-mono text-white">
                    {userLabsAccountQuery.isLoading ? (
                      "Loading..."
                    ) : isRefetching ? (
                      "Updating..."
                    ) : userLabsAccountQuery.error ? (
                      "Error"
                    ) : (
                      `${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS`
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Stake Account Status:</span>
                <div className="flex items-center gap-1">
                  {isRefetching && (
                    <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                  )}
                  <span className="font-mono text-white">
                    {userStakeAccountQuery.isLoading ? (
                      "Loading..."
                    ) : isRefetching ? (
                      "Fetching..."
                    ) : stakeAccountData ? (
                      <span className="text-green-400">Active</span>
                    ) : (
                      <span className="text-gray-500">Not Created</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Staked Amount:</span>
                <div className="flex items-center gap-1">
                  {isRefetching && (
                    <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                  )}
                  <span className="font-mono text-white">
                    {isRefetching ? (
                      "Updating..."
                    ) : (
                      `${stakedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS`
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Rewards:</span>
                <div className="font-mono text-[#4a85ff] flex items-center gap-1">
                  {realtimeRewardsQuery.isLoading ? (
                    <span>Loading...</span>
                  ) : (
                    <>
                      <span>{pendingRewards.toFixed(4)}</span>
                      <span className="text-[#4a85ff]">xLABS</span>
                    </>
                  )}
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
              <div className="py-2 sm:py-6">
                <AnimatedRewardCounter
                  stakeAccountData={stakeAccountData}
                  className=""
                />
              </div>
              <TransactionButton
                transactionState={getClaimTransactionState()}
                idleText={pendingRewards > 0 ? "Claim Rewards" : "No Rewards to Claim"}
                submittingText="Claiming..."
                confirmingText="Confirming..."
                successText="Claimed!"
                errorText="Claim Failed - Retry"
                disabled={pendingRewards <= 0}
                className="w-full bg-white text-black hover:bg-gray-100 py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] font-medium disabled:opacity-50 disabled:hover:scale-100"
                onClick={handleClaimConfirm}
                onRetry={() => claimMutation.reset()}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}