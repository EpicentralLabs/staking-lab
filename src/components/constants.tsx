// Delay for refetching queries after transactions to allow blockchain data propagation
export const REFETCH_DELAY = 2000 // 2 seconds (legacy, kept for admin panel)

// Specific delays for different operations
export const STAKE_REFETCH_DELAY = 5000 // 5 seconds for deposits
export const UNSTAKE_REFETCH_DELAY = 2000 // 2 seconds for withdrawals
export const ACCOUNT_OVERVIEW_REFETCH_DELAY = 5000 // 5 seconds for account overview
export const STAKE_POOL_AUTO_REFRESH_INTERVAL = 5000 // 5 seconds auto-refresh for stake pool details
