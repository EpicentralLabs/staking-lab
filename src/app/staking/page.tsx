"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardBody, Chip, Button, Input, cn } from "@heroui/react"
import { motion } from "framer-motion"
import { ArrowUpRight, ArrowDownRight, Loader2, RefreshCw, DollarSign, TrendingUp, Wallet } from "lucide-react"
import { useMouseGlow } from "@/hooks/useMouseGlow"
import { useEnhancedStakeToStakePoolMutation, useEnhancedUnstakeFromStakePoolMutation, useEnhancedClaimFromStakePoolMutation } from "@/components/staking/staking-mutations"
import { useCoordinatedRefetch } from "@/hooks/use-coordinated-refetch"
import { useWalletUi, WalletUiDropdown } from "@wallet-ui/react"
import { useUserLabsAccount, useUserStakeAccount, useVaultAccount, useStakePoolConfigData } from "@/components/shared/data-access"
import { useRealtimePendingRewards } from "@/components/use-realtime-pending-rewards"
import { AnimatedRewardCounter } from "@/components/ui/animated-reward-counter"
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

  const totalValueLockedUsd = useMemo(() => {
    return totalValueLocked * LABS_TOKEN_PRICE_USD;
  }, [totalValueLocked]);

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
      className="container mx-auto sm:px-2 px-1 py-6 sm:py-8 md:py-12 flex-1"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-8 md:gap-10">
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
            <CardBody className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stake Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-[#4a85ff]/20 flex items-center justify-center">
                      <ArrowUpRight className="w-3 h-3 text-[#4a85ff]" />
                    </div>
                    <h3 className="text-sm font-medium text-white">Stake Tokens</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-white/60">Amount to Stake</label>
                    </div>
                    <Input
                      id="stake-amount"
                      type="text"
                      autoComplete="off"
                      inputMode="decimal"
                      pattern="[0-9]*\.?[0-9]*"
                      placeholder="Enter amount to stake"
                      value={formatWithCommas(stakeAmount)}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/,/g, '');
                        if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
                          setStakeAmount(rawValue);
                        }
                      }}
                      variant="flat"
                      classNames={{
                        base: "max-w-full",
                        input: "text-white font-sans",
                        inputWrapper: "bg-white/5 border-transparent hover:border-transparent data-[hover=true]:bg-white/5 data-[focus=true]:!bg-white/5 data-[focus-visible=true]:!bg-white/5 focus:!bg-white/5 data-[focus=true]:!border-transparent data-[focus-visible=true]:!border-transparent focus:!border-transparent rounded-xl !outline-none !ring-0 !shadow-none"
                      }}
                      endContent={<span className="text-white/40">LABS</span>}
                    />

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Available:</span>
                      <div className="flex items-center gap-1">
                        {isRefetching && (
                          <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                        )}
                        <Chip
                          variant="flat"
                          size="sm"
                          className="cursor-pointer hover:opacity-80 transition-all duration-200 bg-transparent border-none rounded-lg"
                          onClick={() => !userLabsAccountQuery.isLoading && setStakeAmount(
                            availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          )}
                        >
                          <span className="font-sans text-white text-xs">
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
                        </Chip>
                      </div>
                    </div>

                    {stakeError && (
                      <p className="text-danger text-xs">{stakeError}</p>
                    )}
                  </div>

                  <Button
                    color="primary"
                    size="lg"
                    className={cn(
                      "w-full font-medium transition-all duration-200 rounded-xl py-4 h-[3.5rem]",
                      !stakeAmount || !!stakeError || Number.parseFloat(stakeAmount.replace(/,/g, '')) <= 0
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed shadow-none"
                        : "bg-gradient-to-r from-[#4a85ff] to-[#1851c4] hover:from-[#5a95ff] hover:to-[#2861d4] hover:shadow-xl hover:shadow-[#4a85ff]/40 shadow-lg shadow-[#4a85ff]/25"
                    )}
                    isDisabled={!stakeAmount || !!stakeError || Number.parseFloat(stakeAmount.replace(/,/g, '')) <= 0}
                    isLoading={stakeMutation.isPending}
                    onClick={handleStakeConfirm}
                  >
                    {stakeMutation.isPending ? 'Staking...' : 'Stake LABS'}
                  </Button>
                </div>

                {/* Unstake Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-orange-400/20 flex items-center justify-center">
                      <ArrowDownRight className="w-3 h-3 text-orange-400" />
                    </div>
                    <h3 className="text-sm font-medium text-white">Unstake Tokens</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-white/60">Amount to Unstake</label>
                    </div>
                    <Input
                      id="unstake-amount"
                      type="text"
                      autoComplete="off"
                      inputMode="decimal"
                      pattern="[0-9]*\.?[0-9]*"
                      placeholder="Enter amount to unstake"
                      value={formatWithCommas(unstakeAmount)}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/,/g, '');
                        if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
                          setUnstakeAmount(rawValue);
                        }
                      }}
                      variant="flat"
                      classNames={{
                        base: "max-w-full",
                        input: "text-white font-sans",
                        inputWrapper: "bg-white/5 border-transparent hover:border-transparent data-[hover=true]:bg-white/5 data-[focus=true]:!bg-white/5 data-[focus-visible=true]:!bg-white/5 focus:!bg-white/5 data-[focus=true]:!border-transparent data-[focus-visible=true]:!border-transparent focus:!border-transparent rounded-xl !outline-none !ring-0 !shadow-none"
                      }}
                      endContent={<span className="text-white/40">LABS</span>}
                    />

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Staked:</span>
                      <div className="flex items-center gap-1">
                        {isRefetching && (
                          <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                        )}
                        <Chip
                          variant="flat"
                          size="sm"
                          className="cursor-pointer hover:opacity-80 transition-all duration-200 bg-transparent border-none rounded-lg"
                          onClick={() => setUnstakeAmount(
                            stakedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          )}
                        >
                          <span className="font-sans text-white text-xs">
                            {isRefetching ? (
                              "Updating..."
                            ) : (
                              `${stakedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS`
                            )}
                          </span>
                        </Chip>
                      </div>
                    </div>

                    {unstakeError && (
                      <p className="text-danger text-xs">{unstakeError}</p>
                    )}
                  </div>

                  <Button
                    variant="bordered"
                    size="lg"
                    className={cn(
                      "w-full font-medium text-white bg-transparent transition-all duration-200 rounded-xl py-4 h-[3.5rem]",
                      !unstakeAmount || !!unstakeError || Number.parseFloat(unstakeAmount.replace(/,/g, '')) <= 0
                        ? "border border-white/20 hover:border-white/30"
                        : "border border-white/60 hover:border-white/80 hover:bg-white/5 hover:shadow-lg hover:shadow-white/10"
                    )}
                    isDisabled={!unstakeAmount || !!unstakeError || Number.parseFloat(unstakeAmount.replace(/,/g, '')) <= 0}
                    isLoading={unstakeMutation.isPending}
                    onClick={handleUnstakeConfirm}
                  >
                    {unstakeMutation.isPending ? 'Unstaking...' : 'Unstake LABS'}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-6">
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
              <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-[#4a85ff]/20 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-[#4a85ff]" />
                  </div>
                  <h3 className="text-sm font-medium text-white">Stake Pool Details</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total Value Locked:</span>
                    <div className="flex items-center gap-1">
                      {isRefetching && (
                        <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                      )}
                      <Chip variant="flat" size="sm" className="bg-transparent border-none rounded-lg">
                        <span className="font-sans text-white text-xs">
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
                      </Chip>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">USD Value:</span>
                    <div className="flex items-center gap-1">
                      {isRefetching && (
                        <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                      )}
                      <Chip variant="flat" size="sm" className="bg-transparent border-none rounded-lg">
                        <span className="font-sans text-white text-xs">
                          {vaultAccountQuery.isLoading ? (
                            "Loading..."
                          ) : isRefetching ? (
                            "Updating..."
                          ) : vaultAccountQuery.error ? (
                            "Error"
                          ) : (
                            `$${totalValueLockedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          )}
                        </span>
                      </Chip>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Staking APY:</span>
                    <Chip color="primary" variant="flat" size="sm" className="rounded-lg">
                      <span className="font-mono text-[#4a85ff] text-xs" style={{ textShadow: "0 0 8px #4a85ff" }}>
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
              <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-[#4a85ff]/20 flex items-center justify-center">
                    <Wallet className="w-3 h-3 text-[#4a85ff]" />
                  </div>
                  <h3 className="text-sm font-medium text-white">Account Overview</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Staked Amount:</span>
                    <div className="flex items-center gap-1">
                      {isRefetching && (
                        <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                      )}
                      <Chip variant="flat" size="sm" className="bg-transparent border-none rounded-lg">
                        <span className="font-sans text-white text-xs">
                          {isRefetching ? (
                            "Updating..."
                          ) : (
                            `${stakedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LABS`
                          )}
                        </span>
                      </Chip>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total Rewards:</span>
                    <Chip color="primary" variant="flat" size="sm" className="rounded-lg">
                      <div className="font-mono text-[#4a85ff] flex items-center gap-1 text-xs">
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
              <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-[#4a85ff]/20 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-[#4a85ff]" />
                  </div>
                  <h3 className="text-sm font-medium text-white">Claim Rewards</h3>
                </div>
                <p className="text-gray-400 font-light text-xs mb-3">
                  Your current xLABS tokens to claim • Updates live based on staking time
                </p>
                <div className="py-4">
                  <AnimatedRewardCounter
                    stakeAccountData={stakeAccountData}
                    className=""
                  />
                </div>
                <Button
                  color="primary"
                  size="lg"
                  className="w-full font-medium bg-gradient-to-r from-[#4a85ff] to-[#1851c4] hover:from-[#5a95ff] hover:to-[#2861d4] hover:shadow-xl hover:shadow-[#4a85ff]/40 transition-all duration-200 shadow-lg shadow-[#4a85ff]/25 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-4 h-[3.5rem]"
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
    </motion.div>
  )
}
