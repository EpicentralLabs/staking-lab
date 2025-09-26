// Delay for refetching queries after transactions to allow blockchain data propagation
export const REFETCH_DELAY = 1500 // 1.5 seconds (legacy, kept for admin panel)

// Specific delays for different operations
export const STAKE_REFETCH_DELAY = 1500 // 1.5 seconds for deposits
export const UNSTAKE_REFETCH_DELAY = 1500 // 1.5 seconds for withdrawals
export const ACCOUNT_OVERVIEW_REFETCH_DELAY = 1500 // 1.5 seconds for account overview
export const STAKE_POOL_AUTO_REFRESH_INTERVAL = 1500 // 1.5 seconds auto-refresh for stake pool details

// Delay for querying data after deposits to prevent loading issues
export const POST_DEPOSIT_QUERY_DELAY = 1500 // 1.5 seconds for post-deposit queries
export const POST_WITHDRAWAL_QUERY_DELAY = 1500 // 1.5 seconds for post-withdrawal queries
export const POST_CLAIM_QUERY_DELAY = 1500 // 1.5 seconds for post-claim queries
