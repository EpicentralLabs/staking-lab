import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CopyableAddress } from '@/components/ui/copyable-address';

interface AdminStatsSectionProps {
  programAddress: string;
  stakePoolAddress: string;
  configAddress: string;
  configAuthority: string;
  vaultAddress: string;
  currentOnChainApy: string;
  labsTokenAddress: string;
  xLabsTokenAddress: string;
  unclaimedRewards: string;
  claimedRewards: string;
  totalStaked: string;
  tvlStaked: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function AdminStatsSection({
  programAddress,
  stakePoolAddress,
  configAddress,
  configAuthority,
  vaultAddress,
  currentOnChainApy,
  labsTokenAddress,
  xLabsTokenAddress,
  unclaimedRewards,
  claimedRewards,
  totalStaked,
  tvlStaked,
  onRefresh,
  isRefreshing
}: AdminStatsSectionProps) {

  const getStatusBadge = (value: string, successValue?: string) => {
    const isSuccess = successValue ? value === successValue : 
      value !== "Not Set" && value !== "Config not created" && value !== "11111111111111111111111111111111";
    
    return (
      <Badge 
        variant={isSuccess ? "default" : "secondary"}
        className={`text-xs px-2 py-1 whitespace-nowrap ${isSuccess ? "bg-green-600 text-white" : "bg-gray-600 text-gray-300"}`}
      >
        {isSuccess ? "Active" : "Inactive"}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-xl font-medium text-white">Stake Pool Status</h3>
        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="text-gray-300 border-gray-600 hover:bg-gray-700 cursor-pointer"
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      
      <Card className="bg-gray-800/30 border-gray-700/60 p-4 rounded-lg">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-lg font-semibold text-white">Program Information</CardTitle>
          <CardDescription className="text-gray-400 text-sm">
            Current state of the stake pool and program accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex flex-col space-y-1">
                <span className="text-gray-400">Program Address</span>
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <CopyableAddress address={programAddress} label="program address" className="min-w-0 flex-shrink" />
                  <div className="flex-shrink-0">
                    {getStatusBadge(programAddress)}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-gray-400">Stake Pool Address</span>
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <CopyableAddress address={stakePoolAddress} label="stake pool address" className="min-w-0 flex-shrink" />
                  <div className="flex-shrink-0">
                    {getStatusBadge(stakePoolAddress)}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-gray-400">Config Address</span>
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <CopyableAddress address={configAddress} label="config address" className="min-w-0 flex-shrink" />
                  <div className="flex-shrink-0">
                    {getStatusBadge(configAddress)}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-gray-400">Config Authority</span>
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <CopyableAddress address={configAuthority} label="config authority" className="min-w-0 flex-shrink" />
                  <div className="flex-shrink-0">
                    {getStatusBadge(configAuthority)}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-gray-400">Vault Address</span>
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <CopyableAddress address={vaultAddress} label="vault address" className="min-w-0 flex-shrink" />
                  <div className="flex-shrink-0">
                    {getStatusBadge(vaultAddress)}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-gray-400">Current APY</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold">{currentOnChainApy}</span>
                  {getStatusBadge(currentOnChainApy)}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-col space-y-1">
                <span className="text-gray-400">LABS Token Address</span>
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <CopyableAddress address={labsTokenAddress} label="LABS token address" className="min-w-0 flex-shrink" />
                  <div className="flex-shrink-0">
                    {getStatusBadge(labsTokenAddress)}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-gray-400">xLABS Token Address</span>
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <CopyableAddress address={xLabsTokenAddress} label="xLABS token address" className="min-w-0 flex-shrink" />
                  <div className="flex-shrink-0">
                    {getStatusBadge(xLabsTokenAddress)}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-gray-400">Total Staked</span>
                <span className="text-white font-semibold">{totalStaked} LABS</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-gray-400">TVL Staked</span>
                <span className="text-white font-semibold">{tvlStaked}</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-700/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col space-y-1">
                <span className="text-gray-400">Claimed Rewards</span>
                <span className="text-green-400 font-semibold">{claimedRewards} xLABS</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-gray-400">Unclaimed Rewards</span>
                <span className="text-yellow-400 font-semibold">{unclaimedRewards} xLABS</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}