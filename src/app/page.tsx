"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlowingBackground } from "../components/flowing-background";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useWallet } from "@solana/wallet-adapter-react";
import { Toaster } from "@/components/ui/toaster";
import { useStaking } from "@/hooks/useStaking";
import { StakeSection } from "@/components/staking/StakeSection";
import { UnstakeSection } from "@/components/staking/UnstakeSection";
import { ClaimRewardsSection } from "@/components/staking/ClaimRewardsSection";
import { InitializationAlert } from "@/components/staking/InitializationAlert";
import { PoolStats, AccountStats } from "@/components/staking/StakingStats";

export default function SolanaStakingDApp() {
  const { connected } = useWallet();
  const {
    // State
    stakeData,
    poolData,
    userBalance,
    isLoading,
    isInitialized,
    initializationStatus,
    // Transaction states
    isStaking,
    isUnstaking,
    isClaiming,
    isUpdatingRewards,
    // Actions
    stakeTokens,
    unstakeTokens,
    claimRewards,
    updatePendingRewards,
    initializeStakePool,
    refreshData,
  } = useStaking();


  const handleReset = () => {
    // Reset any local state if needed
    refreshData();
  };





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
                {!connected ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">Connect your wallet to start staking</p>
                  </div>
                ) : isLoading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">Loading staking data...</p>
                  </div>
                ) : !isInitialized ? (
                  <InitializationAlert
                    initializationStatus={initializationStatus}
                    onInitialize={initializeStakePool}
                    isInitializing={isUpdatingRewards}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-10">
                    <StakeSection
                      userBalance={userBalance}
                      isStaking={isStaking}
                      isPoolActive={poolData.isActive}
                      onStake={stakeTokens}
                    />
                    <UnstakeSection
                      stakedAmount={stakeData.stakedAmount}
                      isUnstaking={isUnstaking}
                      isPoolActive={poolData.isActive}
                      onUnstake={unstakeTokens}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-8">
              <PoolStats
                totalValueLocked={poolData.totalValueLocked}
                apy={poolData.apy}
                isActive={poolData.isActive}
              />

              <AccountStats
                userBalance={userBalance}
                stakedAmount={stakeData.stakedAmount}
                totalRewardsEarned={stakeData.totalRewardsEarned}
                lastUpdated={stakeData.lastUpdated}
              />

              {/* Claim Rewards */}
              <Card className="bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30">
                <CardHeader>
                  <CardTitle className="text-base sm:text-xl font-medium text-white">Claim Rewards</CardTitle>
                  <CardDescription className="text-gray-400 font-light text-xs sm:text-base">Your current xLABS tokens to claim</CardDescription>
                </CardHeader>
                <CardContent>
                  <ClaimRewardsSection
                    pendingRewards={stakeData.pendingRewards}
                    isClaiming={isClaiming}
                    isPoolActive={poolData.isActive}
                    onClaim={claimRewards}
                    isUpdatingRewards={isUpdatingRewards}
                    onUpdateRewards={updatePendingRewards}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Footer />
      </div>
      <Toaster />
    </div>
  )
}