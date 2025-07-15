"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PoolStatsProps {
  totalValueLocked: number;
  apy: number;
  isActive: boolean;
}

interface AccountStatsProps {
  userBalance: bigint;
  stakedAmount: number;
  totalRewardsEarned: number;
  lastUpdated: Date | null;
}

export function PoolStats({ totalValueLocked, apy, isActive }: PoolStatsProps) {
  return (
    <Card className="bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30">
      <CardHeader>
        <CardTitle className="text-base sm:text-xl font-medium text-white">Stake Pool Details</CardTitle>
        <CardDescription className="text-gray-400 font-light text-xs sm:text-base">
          Current state of the staking pool
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Value Locked:</span>
          <span className="font-mono text-white">{totalValueLocked.toFixed(2)} LABS</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Staking APY:</span>
          <span className="font-mono text-[#4a85ff]">{apy.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Pool Status:</span>
          <span className={`font-mono ${isActive ? 'text-green-400' : 'text-red-400'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function AccountStats({ 
  userBalance, 
  stakedAmount, 
  totalRewardsEarned, 
  lastUpdated 
}: AccountStatsProps) {
  return (
    <Card className="bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30">
      <CardHeader>
        <CardTitle className="text-base sm:text-xl font-medium text-white">Account Overview</CardTitle>
        <CardDescription className="text-gray-400 font-light text-xs sm:text-base">
          Your personal staking details
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Available Balance:</span>
          <span className="font-mono text-white">{(Number(userBalance) / 1e6).toFixed(2)} LABS</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Staked Amount:</span>
          <span className="font-mono text-white">{stakedAmount.toFixed(2)} LABS</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Rewards Earned:</span>
          <span className="font-mono text-[#4a85ff]">{totalRewardsEarned.toFixed(4)} xLABS</span>
        </div>
        {lastUpdated && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">Last Updated:</span>
            <span className="font-mono text-gray-400">
              {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}