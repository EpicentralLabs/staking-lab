/**
 * Analytics Integration Utilities
 * 
 * Helper functions to easily integrate analytics tracking into transaction flows
 */

import { 
  recordStakingActivity, 
  recordXLabsClaimActivity,
  recordXLabsClaim
} from './analytics-stats'

/**
 * Track a staking transaction
 * Call this after a successful stake transaction
 */
export async function trackStakingTransaction(
  walletAddress: string,
  amount: number
) {
  try {
    await recordStakingActivity(walletAddress, amount, true)
    console.log(`Analytics: Tracked staking of ${amount} LABS for ${walletAddress}`)
  } catch (error) {
    console.error('Analytics: Failed to track staking transaction:', error)
    // Don't throw - analytics shouldn't block main transaction flow
  }
}

/**
 * Track an unstaking transaction
 * Call this after a successful unstake transaction
 */
export async function trackUnstakingTransaction(
  walletAddress: string,
  amount: number
) {
  try {
    await recordStakingActivity(walletAddress, amount, false)
    console.log(`Analytics: Tracked unstaking of ${amount} LABS for ${walletAddress}`)
  } catch (error) {
    console.error('Analytics: Failed to track unstaking transaction:', error)
    // Don't throw - analytics shouldn't block main transaction flow
  }
}

/**
 * Track an xLABS claim transaction
 * Call this after a successful xLABS claim
 */
export async function trackXLabsClaimTransaction(
  walletAddress: string,
  amount: number
) {
  try {
    // Record both the claim in user records and daily analytics
    const [claimResult, analyticsResult] = await Promise.all([
      recordXLabsClaim(walletAddress, amount),
      recordXLabsClaimActivity(walletAddress, amount)
    ])
    
    if (!claimResult.success) {
      console.error('Analytics: Failed to record xLABS claim:', claimResult.error)
    }
    
    if (!analyticsResult.success) {
      console.error('Analytics: Failed to track xLABS claim analytics:', analyticsResult.error)
    }
    
    if (claimResult.success && analyticsResult.success) {
      console.log(`Analytics: Tracked xLABS claim of ${amount} for ${walletAddress}`)
    }
  } catch (error) {
    console.error('Analytics: Failed to track xLABS claim transaction:', error)
    // Don't throw - analytics shouldn't block main transaction flow
  }
}

/**
 * Track when a user's pending xLABS amount changes
 * Call this when rewards are calculated or updated
 */
export async function trackPendingXLabsUpdate(
  walletAddress: string,
  newPendingAmount: number
) {
  try {
    const { updatePendingXLabs } = await import('./analytics-stats')
    const result = await updatePendingXLabs(walletAddress, newPendingAmount)
    
    if (!result.success) {
      console.error('Analytics: Failed to update pending xLABS:', result.error)
    } else {
      console.log(`Analytics: Updated pending xLABS to ${newPendingAmount} for ${walletAddress}`)
    }
  } catch (error) {
    console.error('Analytics: Failed to track pending xLABS update:', error)
    // Don't throw - analytics shouldn't block main transaction flow
  }
}

/**
 * Batch track multiple transactions (useful for bulk operations)
 */
export async function trackBatchTransactions(transactions: {
  type: 'stake' | 'unstake' | 'claim'
  walletAddress: string
  amount: number
}[]) {
  const promises = transactions.map(tx => {
    switch (tx.type) {
      case 'stake':
        return trackStakingTransaction(tx.walletAddress, tx.amount)
      case 'unstake':
        return trackUnstakingTransaction(tx.walletAddress, tx.amount)
      case 'claim':
        return trackXLabsClaimTransaction(tx.walletAddress, tx.amount)
      default:
        return Promise.resolve()
    }
  })
  
  await Promise.allSettled(promises)
  console.log(`Analytics: Processed ${transactions.length} batch transactions`)
}
