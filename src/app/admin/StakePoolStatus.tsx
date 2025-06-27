export function StakePoolStatus({
  programAddress,
  stakePoolAddress,
  labsTokenAddress,
  xLabsTokenAddress,
  unclaimedRewards,
  claimedRewards,
  totalStaked,
  tvlStaked
}: {
  programAddress: string,
  stakePoolAddress: string,
  labsTokenAddress: string,
  xLabsTokenAddress: string,
  unclaimedRewards: string,
  claimedRewards: string,
  totalStaked: string,
  tvlStaked: string
}) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-400">Program Address:</span>
        <span className="font-mono text-xs truncate text-gray-500">{programAddress}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Stake Pool Address:</span>
        <span className="font-mono text-xs truncate text-gray-500">{stakePoolAddress}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">LABS Token Address:</span>
        <a
          href={`https://solscan.io/token/${labsTokenAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
        >
          {labsTokenAddress.slice(0, 4)}...{labsTokenAddress.slice(-3)}
        </a>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">xLABS Token Address:</span>
        <a
          href={`https://solscan.io/token/${xLabsTokenAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
        >
          {xLabsTokenAddress === '11111111111111111111111111111111' ? 'NULL' : `${xLabsTokenAddress.slice(0, 4)}...${xLabsTokenAddress.slice(-3)}`}
        </a>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Unclaimed Rewards (xLABS Pending):</span>
        <span className="font-mono text-xs text-gray-500">{unclaimedRewards}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Claimed Rewards (xLABS Minted):</span>
        <span className="font-mono text-xs text-gray-500">{claimedRewards}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Total LABS Staked:</span>
        <span className="font-mono text-xs text-gray-500">{totalStaked}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">TVL Staked (USDC Value):</span>
        <span className="font-mono text-xs text-gray-500">{tvlStaked}</span>
      </div>
    </div>
  )
} 