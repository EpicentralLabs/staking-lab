// Delay for refetching queries after transactions to allow blockchain data propagation
export const REFETCH_DELAY = 1500 // 1.5 seconds - used across the app

// Specific aliases for different contexts (all use the same delay)
export const STAKE_REFETCH_DELAY = REFETCH_DELAY
export const UNSTAKE_REFETCH_DELAY = REFETCH_DELAY
export const ACCOUNT_OVERVIEW_REFETCH_DELAY = REFETCH_DELAY
export const STAKE_POOL_AUTO_REFRESH_INTERVAL = REFETCH_DELAY
export const POST_DEPOSIT_QUERY_DELAY = REFETCH_DELAY

// Token pricing
export const LABS_TOKEN_PRICE_USD = 1 // $1 per LABS token
