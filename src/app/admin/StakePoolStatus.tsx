export function StakePoolStatus({
  programAddress,
  stakePoolAddress,
  configAddress,
  currentOnChainApy,
  labsTokenAddress,
  xLabsTokenAddress,
  unclaimedRewards,
  claimedRewards,
  totalStaked,
  tvlStaked,
  refreshStakePoolStatus,
  isRefreshing
}: {
  programAddress: string,
  stakePoolAddress: string,
  configAddress: string,
  currentOnChainApy: string,
  labsTokenAddress: string,
  xLabsTokenAddress: string,
  unclaimedRewards: string,
  claimedRewards: string,
  totalStaked: string,
  tvlStaked: string,
  refreshStakePoolStatus?: () => Promise<void>,
  isRefreshing?: boolean
}) {
  // Helper function to create Solscan links
  const getSolscanLink = (address: string) => `https://solscan.io/account/${address}`;
  const getSolscanTokenLink = (address: string) => `https://solscan.io/token/${address}`;

  // Helper function to render address with Solscan link
  const renderAddressLink = (address: string, isToken = false) => {
    if (!address || address === "11111111111111111111111111111111") {
      return <span className="text-red-400">Not Set</span>;
    }

    const link = isToken ? getSolscanTokenLink(address) : getSolscanLink(address);
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
      >
        {address.slice(0, 4)}...{address.slice(-4)}
      </a>
    );
  };

  // Check initialization status
  const isConfigInitialized = currentOnChainApy !== 'Config not created' && currentOnChainApy !== 'Not Set';
  const isStakePoolInitialized = stakePoolAddress && stakePoolAddress !== "";
  const isXLabsTokenInitialized = xLabsTokenAddress && xLabsTokenAddress !== "11111111111111111111111111111111";
  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Status:</span>
        {refreshStakePoolStatus && (
          <button
            onClick={refreshStakePoolStatus}
            disabled={isRefreshing}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </div>

      {/* Overall Status Summary */}
      <div className="mb-4 p-3 rounded-lg border border-gray-600/40 bg-gray-800/20">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300 font-medium">Initialization Status</span>
          <span className={`text-xs px-2 py-1 rounded ${isConfigInitialized && isStakePoolInitialized && isXLabsTokenInitialized
              ? 'bg-green-900/30 text-green-400 border border-green-500/30'
              : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
            }`}>
            {isConfigInitialized && isStakePoolInitialized && isXLabsTokenInitialized ? 'Fully Initialized' : 'Partially Initialized'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className={`flex items-center gap-1 ${isConfigInitialized ? 'text-green-400' : 'text-red-400'}`}>
            <span>{isConfigInitialized ? '✅' : '❌'}</span>
            <span>Config</span>
          </div>
          <div className={`flex items-center gap-1 ${isStakePoolInitialized ? 'text-green-400' : 'text-red-400'}`}>
            <span>{isStakePoolInitialized ? '✅' : '❌'}</span>
            <span>Pool</span>
          </div>
          <div className={`flex items-center gap-1 ${isXLabsTokenInitialized ? 'text-green-400' : 'text-red-400'}`}>
            <span>{isXLabsTokenInitialized ? '✅' : '❌'}</span>
            <span>xLABS</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Program Address:</span>
        {renderAddressLink(programAddress)}
      </div>

      <div className="flex justify-between">
        <span className="text-gray-400">Stake Pool Address:</span>
        {stakePoolAddress ? renderAddressLink(stakePoolAddress) : <span className="text-red-400">Not Created</span>}
      </div>
      {!isStakePoolInitialized && (
        <div className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded border border-yellow-500/30">
          ⚠️ Stake pool not created. Use &quot;Create Stake Pool&quot; to initialize.
        </div>
      )}

      <div className="flex justify-between">
        <span className="text-gray-400">Config Address:</span>
        {renderAddressLink(configAddress)}
      </div>

      <div className="flex justify-between">
        <span className="text-gray-400">Current On-Chain APY:</span>
        <span className={`font-mono text-xs ${isConfigInitialized ? 'text-green-400' : 'text-red-400'}`}>
          {currentOnChainApy}
        </span>
      </div>
      {!isConfigInitialized && (
        <div className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded border border-yellow-500/30">
          ⚠️ Config not created. Use &quot;Create Stake Pool Config&quot; to initialize on-chain APY.
        </div>
      )}

      <div className="flex justify-between">
        <span className="text-gray-400">LABS Token Address:</span>
        {renderAddressLink(labsTokenAddress, true)}
      </div>

      <div className="flex justify-between">
        <span className="text-gray-400">xLABS Token Address:</span>
        {renderAddressLink(xLabsTokenAddress, true)}
      </div>
      {!isXLabsTokenInitialized && (
        <div className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded border border-yellow-500/30">
          ⚠️ xLABS token not created. Use &quot;Create xLABS Mint&quot; to initialize reward token.
        </div>
      )}
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