"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardBody, Chip, Button } from "@heroui/react"
import { motion } from "framer-motion"
import { Loader2, RefreshCw, TrendingUp, Wallet, Plus, Minus } from "lucide-react"
import { useMouseGlow } from "@/hooks/useMouseGlow"
import { useEnhancedStakeToStakePoolMutation, useEnhancedUnstakeFromStakePoolMutation, useEnhancedClaimFromStakePoolMutation } from "@/components/staking/staking-mutations"
import { useCoordinatedRefetch } from "@/hooks/use-coordinated-refetch"
import { useWalletUi, WalletUiDropdown } from "@wallet-ui/react"
import { useUserLabsAccount, useUserStakeAccount, useVaultAccount, useStakePoolConfigData } from "@/components/shared/data-access"
import { useRealtimePendingRewards } from "@/components/use-realtime-pending-rewards"
import { AnimatedRewardCounter } from "@/components/ui/animated-reward-counter"
import { StakeModal } from "@/components/modals/stake-modal"
import { UnstakeModal } from "@/components/modals/unstake-modal"
import { STAKE_REFETCH_DELAY, UNSTAKE_REFETCH_DELAY, ACCOUNT_OVERVIEW_REFETCH_DELAY, STAKE_POOL_AUTO_REFRESH_INTERVAL, LABS_TOKEN_PRICE_USD } from "@/components/constants"

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
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false)
  const [isUnstakeModalOpen, setIsUnstakeModalOpen] = useState(false)

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

  const totalValueLockedUsd = useMemo(() => {
    return totalValueLocked * LABS_TOKEN_PRICE_USD;
  }, [totalValueLocked]);

  const availableBalance = walletBalance;




  // Transaction handlers for modals
  const handleStake = async (amount: string) => {
    try {
      const numericAmount = Math.floor(Number.parseFloat(amount.replace(/,/g, '')) * 1e9);
      await stakeMutation.mutateAsync(numericAmount);
      setIsStakeModalOpen(false);
      
      // Wait for blockchain data to propagate, then refetch
      setTimeout(async () => {
        await refetchStakingQueries();
      }, STAKE_REFETCH_DELAY);
    } catch {
      // Error handled by mutation
    }
  };

  const handleUnstake = async (amount: string) => {
    try {
      const numericAmount = Math.floor(Number.parseFloat(amount.replace(/,/g, '')) * 1e9);
      await unstakeMutation.mutateAsync(numericAmount);
      setIsUnstakeModalOpen(false);
      
      // Wait for blockchain data to propagate, then refetch
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
      await claimMutation.mutateAsync(pendingRewards);
      
      // Wait for blockchain data to propagate, then refetch (5 seconds for account overview)
      setTimeout(async () => {
        await refetchClaimingQueries();
      }, ACCOUNT_OVERVIEW_REFETCH_DELAY);
    } catch {
      // Error handled by mutation
    }
  };


  // Mouse glow effects for cards
  const mainCardRef = useMouseGlow()
  const poolDetailsRef = useMouseGlow()
  const accountOverviewRef = useMouseGlow()
  const claimRewardsRef = useMouseGlow()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto sm:px-4 px-2 py-4 sm:py-6 md:py-8 flex-1 max-w-7xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
        {/* Main Staking Interface */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card
            ref={mainCardRef}
            className="bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-700/20 border border-slate-600/20 backdrop-blur-sm relative overflow-hidden transition-all duration-300 ease-out rounded-2xl"
            style={{
              background: `
                radial-gradient(var(--glow-size, 600px) circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
                  rgba(74, 133, 255, calc(0.15 * var(--glow-opacity, 0) * var(--glow-intensity, 1))), 
                  rgba(88, 80, 236, calc(0.08 * var(--glow-opacity, 0) * var(--glow-intensity, 1))) 25%,
                  rgba(74, 133, 255, calc(0.03 * var(--glow-opacity, 0) * var(--glow-intensity, 1))) 50%,
                  transparent 75%
                ),
                linear-gradient(to bottom right, 
                  rgb(15 23 42 / 0.4), 
                  rgb(30 41 59 / 0.3), 
                  rgb(51 65 85 / 0.2)
                )
              `,
              transition: 'var(--glow-transition, all 200ms cubic-bezier(0.4, 0, 0.2, 1))'
            }}
          >
            <CardBody className="p-6">
              <div className="text-center space-y-6">
                {/* Header Section */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4a85ff]/5 via-transparent to-orange-500/5 rounded-2xl"></div>
                  <div className="relative space-y-2 py-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4a85ff]/20 to-[#1851c4]/20 flex items-center justify-center border border-[#4a85ff]/30">
                        <TrendingUp className="w-5 h-5 text-[#4a85ff]" />
                      </div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent">
                        Staking Interface
                      </h2>
                    </div>
                    <p className="text-base text-white/70 max-w-xl mx-auto">
                      Stake your LABS tokens to earn rewards. Quick deposit and withdrawal options.
                    </p>
                  </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group relative bg-gradient-to-br from-white/8 via-white/5 to-white/3 rounded-xl p-4 border border-white/10 hover:border-[#4a85ff]/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#4a85ff]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-[#4a85ff]" />
                          <span className="text-white/70 text-sm font-medium">Available Balance</span>
                        </div>
                        {isRefetching && (
                          <Loader2 className="w-3 h-3 text-[#4a85ff] animate-spin" />
                        )}
                      </div>
                      <div className="text-xl font-bold text-white/95">
                        {userLabsAccountQuery.isLoading ? (
                          "Loading..."
                        ) : isRefetching ? (
                          "Updating..."
                        ) : userLabsAccountQuery.error ? (
                          "Error"
                        ) : (
                          `${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS`
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="group relative bg-gradient-to-br from-white/8 via-white/5 to-white/3 rounded-xl p-4 border border-white/10 hover:border-orange-400/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-orange-400" />
                          <span className="text-white/70 text-sm font-medium">Staked Amount</span>
                        </div>
                        {isRefetching && (
                          <RefreshCw className="w-3 h-3 text-orange-400 animate-spin" />
                        )}
                      </div>
                      <div className="text-xl font-bold text-white/95">
                        {isRefetching ? (
                          "Updating..."
                        ) : (
                          `${stakedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS`
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#4a85ff] to-[#1851c4] hover:from-[#5a95ff] hover:to-[#2861d4] text-white font-semibold transition-all duration-300 rounded-xl px-6 py-3 h-12 text-base shadow-lg shadow-[#4a85ff]/30 hover:shadow-[#4a85ff]/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    onPress={() => setIsStakeModalOpen(true)}
                    startContent={<Plus className="w-4 h-4" />}
                    isDisabled={availableBalance <= 0}
                  >
                    Stake Tokens
                  </Button>

                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold transition-all duration-300 rounded-xl px-6 py-3 h-12 text-base shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    onPress={() => setIsUnstakeModalOpen(true)}
                    startContent={<Minus className="w-4 h-4" />}
                    isDisabled={stakedAmount <= 0}
                  >
                    Unstake Tokens
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stake Pool Details */}
          <motion.div variants={itemVariants}>
            <Card
              ref={poolDetailsRef}
              className="bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-700/20 border border-slate-600/20 backdrop-blur-sm relative overflow-hidden transition-all duration-300 ease-out rounded-2xl"
              style={{
                background: `
                  radial-gradient(var(--glow-size, 600px) circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
                    rgba(74, 133, 255, calc(0.15 * var(--glow-opacity, 0) * var(--glow-intensity, 1))), 
                    rgba(88, 80, 236, calc(0.08 * var(--glow-opacity, 0) * var(--glow-intensity, 1))) 25%,
                    rgba(74, 133, 255, calc(0.03 * var(--glow-opacity, 0) * var(--glow-intensity, 1))) 50%,
                    transparent 75%
                  ),
                  linear-gradient(to bottom right, 
                    rgb(15 23 42 / 0.4), 
                    rgb(30 41 59 / 0.3), 
                    rgb(51 65 85 / 0.2)
                  )
                `,
                transition: 'var(--glow-transition, all 200ms cubic-bezier(0.4, 0, 0.2, 1))'
              }}
            >
              <CardBody className="p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-[#4a85ff]/20 flex items-center justify-center border border-[#4a85ff]/30">
                    <TrendingUp className="w-4 h-4 text-[#4a85ff]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white/95">Stake Pool Details</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-white/70 text-sm font-medium">Total Value Locked:</span>
                    <div className="flex items-center gap-2">
                      {isRefetching && (
                        <RefreshCw className="w-3 h-3 text-[#4a85ff] animate-spin" />
                      )}
                      <div className="text-right">
                        <div className="text-white/95 text-base font-semibold">
                          {vaultAccountQuery.isLoading ? (
                            "Loading..."
                          ) : isRefetching ? (
                            "Updating..."
                          ) : vaultAccountQuery.error ? (
                            "Error"
                          ) : (
                            `${totalValueLocked.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS`
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-1">
                    <span className="text-white/70 text-sm font-medium">USD Value:</span>
                    <div className="flex items-center gap-2">
                      {isRefetching && (
                        <RefreshCw className="w-3 h-3 text-[#4a85ff] animate-spin" />
                      )}
                      <div className="text-right">
                        <div className="text-white/95 text-base font-semibold">
                          {vaultAccountQuery.isLoading ? (
                            "Loading..."
                          ) : isRefetching ? (
                            "Updating..."
                          ) : vaultAccountQuery.error ? (
                            "Error"
                          ) : (
                            `$${totalValueLockedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-1">
                    <span className="text-white/70 text-sm font-medium">Staking APY:</span>
                    <Chip 
                      className="bg-gradient-to-r from-[#4a85ff]/20 to-[#1851c4]/20 border border-[#4a85ff]/30 rounded-lg px-3 py-1 h-8"
                    >
                      <span className="font-mono text-[#4a85ff] text-base font-bold" style={{ textShadow: "0 0 8px #4a85ff80" }}>
                        {stakePoolConfigQuery.isLoading ? "Loading..." : `${stakeApy}%`}
                      </span>
                    </Chip>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Account Overview */}
          <motion.div variants={itemVariants}>
            <Card
              ref={accountOverviewRef}
              className="bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-700/20 border border-slate-600/20 backdrop-blur-sm relative overflow-hidden transition-all duration-300 ease-out rounded-2xl"
              style={{
                background: `
                  radial-gradient(var(--glow-size, 600px) circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
                    rgba(74, 133, 255, calc(0.15 * var(--glow-opacity, 0) * var(--glow-intensity, 1))), 
                    rgba(88, 80, 236, calc(0.08 * var(--glow-opacity, 0) * var(--glow-intensity, 1))) 25%,
                    rgba(74, 133, 255, calc(0.03 * var(--glow-opacity, 0) * var(--glow-intensity, 1))) 50%,
                    transparent 75%
                  ),
                  linear-gradient(to bottom right, 
                    rgb(15 23 42 / 0.4), 
                    rgb(30 41 59 / 0.3), 
                    rgb(51 65 85 / 0.2)
                  )
                `,
                transition: 'var(--glow-transition, all 200ms cubic-bezier(0.4, 0, 0.2, 1))'
              }}
            >
              <CardBody className="p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-[#4a85ff]/20 flex items-center justify-center border border-[#4a85ff]/30">
                    <Wallet className="w-4 h-4 text-[#4a85ff]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white/95">Account Overview</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-white/70 text-sm font-medium">Staked Amount:</span>
                    <div className="flex items-center gap-2">
                      {isRefetching && (
                        <RefreshCw className="w-3 h-3 text-[#4a85ff] animate-spin" />
                      )}
                      <div className="text-right">
                        <div className="text-white/95 text-base font-semibold">
                          {isRefetching ? (
                            "Updating..."
                          ) : (
                            `${stakedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS`
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-white/70 text-sm font-medium">Total Rewards:</span>
                    <Chip 
                      className="bg-gradient-to-r from-[#4a85ff]/20 to-[#1851c4]/20 border border-[#4a85ff]/30 rounded-lg px-3 py-1 h-8"
                    >
                      <div className="font-mono text-[#4a85ff] flex items-center gap-1 text-sm font-semibold">
                        {realtimeRewardsQuery.isLoading ? (
                          <span>Loading...</span>
                        ) : (
                          <>
                            <span>{pendingRewards.toFixed(4)}</span>
                            <span className="text-[#4a85ff]">xLABS</span>
                          </>
                        )}
                      </div>
                    </Chip>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Claim Rewards */}
          <motion.div variants={itemVariants}>
            <Card
              ref={claimRewardsRef}
              className="bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-700/20 border border-slate-600/20 backdrop-blur-sm relative overflow-hidden transition-all duration-300 ease-out rounded-2xl"
              style={{
                background: `
                  radial-gradient(var(--glow-size, 600px) circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
                    rgba(74, 133, 255, calc(0.15 * var(--glow-opacity, 0) * var(--glow-intensity, 1))), 
                    rgba(88, 80, 236, calc(0.08 * var(--glow-opacity, 0) * var(--glow-intensity, 1))) 25%,
                    rgba(74, 133, 255, calc(0.03 * var(--glow-opacity, 0) * var(--glow-intensity, 1))) 50%,
                    transparent 75%
                  ),
                  linear-gradient(to bottom right, 
                    rgb(15 23 42 / 0.4), 
                    rgb(30 41 59 / 0.3), 
                    rgb(51 65 85 / 0.2)
                  )
                `,
                transition: 'var(--glow-transition, all 200ms cubic-bezier(0.4, 0, 0.2, 1))'
              }}
            >
              <CardBody className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#4a85ff]/20 flex items-center justify-center border border-[#4a85ff]/30">
                    <TrendingUp className="w-4 h-4 text-[#4a85ff]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white/95">Claim Rewards</h3>
                </div>
                <p className="text-white/70 text-sm mb-4 leading-relaxed">
                  Your current xLABS tokens to claim • Updates live based on staking time
                </p>
                <div className="py-4">
                  <AnimatedRewardCounter
                    stakeAccountData={stakeAccountData}
                    className=""
                  />
                </div>
                <Button
                  size="lg"
                  className="w-full font-semibold text-base bg-gradient-to-r from-[#4a85ff] to-[#1851c4] hover:from-[#5a95ff] hover:to-[#2861d4] text-white transition-all duration-300 rounded-xl py-3 h-12 shadow-lg shadow-[#4a85ff]/30 hover:shadow-[#4a85ff]/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  isDisabled={pendingRewards <= 0}
                  isLoading={claimMutation.isPending}
                  onClick={handleClaimConfirm}
                >
                  {claimMutation.isPending ? 'Claiming...' : pendingRewards > 0 ? "Claim Rewards" : "No Rewards to Claim"}
                </Button>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <StakeModal
        isOpen={isStakeModalOpen}
        onOpenChange={() => setIsStakeModalOpen(false)}
        availableBalance={availableBalance}
        onStake={handleStake}
        isProcessing={stakeMutation.isPending}
        isRefetching={isRefetching}
      />

      <UnstakeModal
        isOpen={isUnstakeModalOpen}
        onOpenChange={() => setIsUnstakeModalOpen(false)}
        stakedAmount={stakedAmount}
        onUnstake={handleUnstake}
        isProcessing={unstakeMutation.isPending}
        isRefetching={isRefetching}
      />
    </motion.div>
  )
}
