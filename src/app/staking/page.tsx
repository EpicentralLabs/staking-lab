"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardBody, Chip, Button } from "@heroui/react"
import { motion } from "framer-motion"
import { Loader2, RefreshCw, TrendingUp, Wallet, Plus, Minus, Vote, Shield, DollarSign } from "lucide-react"
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
import { useActivityTracking } from "@/hooks/use-activity-tracking"

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
  const { account } = useWalletUi()
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false)
  const [isUnstakeModalOpen, setIsUnstakeModalOpen] = useState(false)

  // Query hooks
  const userLabsAccountQuery = useUserLabsAccount()
  const userStakeAccountQuery = useUserStakeAccount()
  const vaultAccountQuery = useVaultAccount()
  const stakePoolConfigQuery = useStakePoolConfigData()

  // Coordinated refetch hook
  const { isRefetching, refetchStakingQueries, refetchUnstakingQueries, refetchClaimingQueries } = useCoordinatedRefetch()
  
  // Activity tracking hook
  const { trackStakingActivity, trackClaimActivity } = useActivityTracking()

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
  
  // Update pending rewards in the database periodically
  useEffect(() => {
    if (!account?.address || pendingRewards <= 0) return;
    
    const updatePendingRewards = async () => {
      try {
        const pendingAmountInBaseUnit = Math.floor(pendingRewards * 1e9);
        await fetch('/api/users/update-pending', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: account.address,
            pendingAmount: pendingAmountInBaseUnit
          }),
        });
      } catch (error) {
        console.error('Failed to update pending rewards:', error);
      }
    };
    
    // Update pending rewards every 30 seconds
    const interval = setInterval(updatePendingRewards, 30000);
    
    // Update immediately on first load
    updatePendingRewards();
    
    return () => clearInterval(interval);
  }, [account?.address, pendingRewards]);

  // Helper function to format numbers intelligently
  const formatNumber = (value: number): string => {
    // If the number is a whole number, show it without decimals
    if (value % 1 === 0) {
      return value.toLocaleString();
    }
    
    // Otherwise, show up to 4 decimal places, removing trailing zeros
    const formatted = value.toLocaleString(undefined, { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 4 
    });
    
    return formatted;
  };

  // Transaction handlers for modals
  const handleStake = async (amount: string) => {
    try {
      const numericAmount = Math.floor(Number.parseFloat(amount.replace(/,/g, '')) * 1e9);
      await stakeMutation.mutateAsync(numericAmount);
      setIsStakeModalOpen(false);
      
      // Track the staking activity
      await trackStakingActivity(numericAmount, true);
      
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
      
      // Track the unstaking activity
      await trackStakingActivity(numericAmount, false);
      
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
      // Convert pendingRewards to the base unit (multiply by 1e9)
      const claimAmount = Math.floor(pendingRewards * 1e9);
      await claimMutation.mutateAsync(pendingRewards);
      
      // Track the claim activity
      await trackClaimActivity(claimAmount);
      
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
      className="container mx-auto px-3 sm:px-4 py-3 sm:py-6 md:py-8 flex-1 max-w-7xl"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="text-center py-6 sm:py-8 md:py-12 relative overflow-hidden">
        {/* Floating LABS tokens - decorative */}
        <div className="absolute top-8 right-16 w-20 h-20 rounded-full bg-gradient-to-br from-[#4a85ff]/20 to-[#1851c4]/20 blur-sm animate-pulse"></div>
        <div className="absolute top-20 right-32 w-12 h-12 rounded-full bg-gradient-to-br from-orange-400/20 to-orange-600/20 blur-sm animate-pulse delay-300"></div>
        <div className="absolute top-12 right-48 w-16 h-16 rounded-full bg-gradient-to-br from-[#4a85ff]/15 to-[#1851c4]/15 blur-sm animate-pulse delay-700"></div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
          Stake LABS for xLABS
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-4xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2 sm:px-0">
          The Staking Lab allows is an on-chain revenue sharing model that allows users to stake LABS for &quot;xLABS&quot;, a revenue sharing token. This allows for Epicentral DAO members to realize gains from OPX without giving up their governance power.
        </p>
      </motion.div>

      {/* Stats Above Container */}
      <motion.div variants={itemVariants} className="max-w-4xl mx-auto mb-3 sm:mb-4 px-2 sm:px-0">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#4a85ff]/20 to-[#1851c4]/20 flex items-center justify-center border border-[#4a85ff]/30">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#4a85ff]" />
            </div>
            <div>
              <span className="text-white/70 text-sm">Total LABS Staked</span>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white/95">
                {vaultAccountQuery.isLoading ? (
                  "Loading..."
                ) : vaultAccountQuery.error ? (
                  "Error"
                ) : (
                  <>
                    {`${Math.round(totalValueLocked).toLocaleString()}`}
                    <span className="text-white/50 text-sm sm:text-base md:text-lg font-normal ml-1 sm:ml-2 block sm:inline">
                      (${Math.round(totalValueLockedUsd).toLocaleString()} USDC)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Central Staking Card */}
      <motion.div variants={itemVariants} className="max-w-4xl mx-auto mb-8 sm:mb-12 md:mb-16 px-2 sm:px-0">
        <Card
          ref={mainCardRef}
          className="bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-slate-800/40 border border-slate-700/30 backdrop-blur-sm relative overflow-hidden transition-all duration-300 ease-out rounded-2xl"
          style={{
            background: `
              radial-gradient(var(--glow-size, 600px) circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
                rgba(74, 133, 255, calc(0.15 * var(--glow-opacity, 0) * var(--glow-intensity, 1))), 
                rgba(88, 80, 236, calc(0.08 * var(--glow-opacity, 0) * var(--glow-intensity, 1))) 25%,
                rgba(74, 133, 255, calc(0.03 * var(--glow-opacity, 0) * var(--glow-intensity, 1))) 50%,
                transparent 75%
              ),
              linear-gradient(to bottom right, 
                rgb(2 6 23 / 0.8), 
                rgb(15 23 42 / 0.6), 
                rgb(30 41 59 / 0.4)
              )
            `,
            transition: 'var(--glow-transition, all 200ms cubic-bezier(0.4, 0, 0.2, 1))'
          }}
        >
          <CardBody className="p-4 sm:p-6 md:p-8">
            <div className="text-center space-y-4 sm:space-y-6 md:space-y-8">

              {/* Stats Grid */}
              <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
                {/* APR - Full width on mobile */}
                <div className="space-y-1 sm:space-y-2">
                  <span className="text-white/70 text-sm font-medium">APR</span>
                  <div className="text-xl sm:text-2xl font-bold text-[#4AFFBA] animate-pulse" style={{textShadow: '0 0 15px #4AFFBA50, 0 0 30px #4AFFBA30'}}>
                    {stakePoolConfigQuery.isLoading ? "Loading..." : `${stakeApy}%`}
                  </div>
                </div>

                {/* xLABS to Claim and My Stake - Side by side on mobile */}
                <div className="grid grid-cols-2 gap-4 sm:contents">
                  <div className="space-y-1 sm:space-y-2">
                    <span className="text-white/70 text-sm font-medium">xLABS to Claim</span>
                    <div className="flex items-center justify-center">
                      <span className="text-xl sm:text-2xl font-normal text-white/95" style={{textShadow: '0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)'}}>
                        {pendingRewards === 0 ? '0' : pendingRewards.toFixed(4).replace(/\.?0+$/, '')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <span className="text-white/70 text-sm font-medium">My Stake</span>
                    <div className="flex items-center justify-center">
                      <span className="text-xl sm:text-2xl font-normal text-white/95" style={{textShadow: '0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)'}}>
                        {formatNumber(stakedAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available to Stake */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gradient-to-r from-white/5 via-white/3 to-white/5 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 gap-3 sm:gap-0">
                <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 sm:flex-1">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-[#4a85ff]" />
                    <span className="text-sm sm:text-base text-white/95 font-medium">Available to Stake:</span>
                  </div>
                  <span className="text-white/95 text-base sm:text-lg font-normal sm:hidden" style={{textShadow: '0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)'}}>
                    {formatNumber(availableBalance)} LABS
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <span className="text-white/95 text-base sm:text-lg font-normal hidden sm:block" style={{textShadow: '0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)'}}>
                    {formatNumber(availableBalance)} LABS
                  </span>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      className="bg-gradient-to-r from-[#4a85ff] to-[#1851c4] hover:from-[#5a95ff] hover:to-[#2861d4] text-white font-semibold transition-all duration-300 rounded-lg px-4 sm:px-6 py-2 text-sm sm:text-base flex-1 sm:flex-none"
                      onPress={() => setIsStakeModalOpen(true)}
                      isDisabled={availableBalance <= 0}
                    >
                      Stake
                    </Button>
                    <Button
                      className="bg-transparent border border-orange-500 hover:border-orange-400 text-orange-500 hover:text-orange-400 font-semibold transition-all duration-300 rounded-lg px-4 sm:px-6 py-2 text-sm sm:text-base flex-1 sm:flex-none"
                      onPress={() => setIsUnstakeModalOpen(true)}
                      isDisabled={stakedAmount <= 0}
                    >
                      Unstake
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className={`${pendingRewards > 0 ? 'bg-gradient-to-r from-[#4a85ff] to-[#1851c4] hover:from-[#5a95ff] hover:to-[#2861d4] text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'} font-semibold transition-all duration-300 rounded-xl px-4 sm:px-6 py-3 h-10 sm:h-12 text-sm sm:text-base shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 w-full sm:w-auto max-w-xs`}
                  isDisabled={pendingRewards <= 0}
                  isLoading={claimMutation.isPending}
                  onClick={handleClaimConfirm}
                >
                  {claimMutation.isPending ? 'Claiming...' : 'Claim xLABS'}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

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
