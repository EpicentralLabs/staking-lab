import prisma from './prisma'

/**
 * Utility functions for managing xLABS claims and global statistics
 */

export interface ClaimResult {
  success: boolean
  userTotalClaimed: number
  globalTotalClaimed: number
  userPendingClaim: number
  globalPendingClaim: number
  error?: string
}

export interface PendingUpdateResult {
  success: boolean
  userPendingClaim: number
  globalPendingClaim: number
  error?: string
}

/**
 * Record an xLABS claim for a user and update global statistics
 * This moves pending xLABS to claimed and reduces pending amounts
 */
export async function recordXLabsClaim(
  walletAddress: string,
  claimAmount: number
): Promise<ClaimResult> {
  try {
    const currentTime = Math.floor(Date.now() / 1000)

    // Use a transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get current user to check pending amount
      const currentUser = await tx.user.findUnique({
        where: { walletAddress },
        select: { pendingXLabsClaim: true }
      })

      // Update user's claim record
      const user = await tx.user.upsert({
        where: { walletAddress },
        update: {
          totalXLabsClaimed: {
            increment: claimAmount
          },
          pendingXLabsClaim: {
            decrement: claimAmount // Reduce pending by claimed amount
          },
          lastClaimTime: currentTime
        },
        create: {
          walletAddress,
          firstVisitTime: currentTime,
          labsBalance: 0,
          xLABSBalance: 0,
          stakedBalance: 0,
          unstakedBalance: 0,
          pendingRewards: 0,
          interestIndex: 0,
          bump: 0,
          totalXLabsClaimed: claimAmount,
          pendingXLabsClaim: 0, // New user starts with 0 pending
          lastClaimTime: currentTime
        }
      })

      // Update global statistics
      const globalStats = await tx.globalStats.upsert({
        where: { id: 'global' },
        update: {
          totalXLabsClaimed: {
            increment: claimAmount
          },
          totalPendingXLabs: {
            decrement: claimAmount // Reduce global pending
          },
          lastUpdated: currentTime
        },
        create: {
          id: 'global',
          totalXLabsClaimed: claimAmount,
          totalPendingXLabs: 0,
          totalUsers: 1,
          totalStaked: 0,
          lastUpdated: currentTime
        }
      })

      return {
        userTotalClaimed: user.totalXLabsClaimed,
        globalTotalClaimed: globalStats.totalXLabsClaimed,
        userPendingClaim: user.pendingXLabsClaim,
        globalPendingClaim: globalStats.totalPendingXLabs
      }
    })

    return {
      success: true,
      userTotalClaimed: result.userTotalClaimed,
      globalTotalClaimed: result.globalTotalClaimed,
      userPendingClaim: result.userPendingClaim,
      globalPendingClaim: result.globalPendingClaim
    }
  } catch (error) {
    console.error('Error recording xLABS claim:', error)
    return {
      success: false,
      userTotalClaimed: 0,
      globalTotalClaimed: 0,
      userPendingClaim: 0,
      globalPendingClaim: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Update pending xLABS for a user (e.g., when rewards are calculated)
 */
export async function updatePendingXLabs(
  walletAddress: string,
  newPendingAmount: number
): Promise<PendingUpdateResult> {
  try {
    const currentTime = Math.floor(Date.now() / 1000)

    const result = await prisma.$transaction(async (tx) => {
      // Get current user's pending amount
      const currentUser = await tx.user.findUnique({
        where: { walletAddress },
        select: { pendingXLabsClaim: true }
      })

      const currentPending = currentUser?.pendingXLabsClaim || 0
      const pendingDifference = newPendingAmount - currentPending

      // Update user's pending amount
      const user = await tx.user.upsert({
        where: { walletAddress },
        update: {
          pendingXLabsClaim: newPendingAmount,
          lastPendingUpdate: currentTime
        },
        create: {
          walletAddress,
          firstVisitTime: currentTime,
          labsBalance: 0,
          xLABSBalance: 0,
          stakedBalance: 0,
          unstakedBalance: 0,
          pendingRewards: 0,
          interestIndex: 0,
          bump: 0,
          pendingXLabsClaim: newPendingAmount,
          lastPendingUpdate: currentTime
        }
      })

      // Update global pending statistics
      const globalStats = await tx.globalStats.upsert({
        where: { id: 'global' },
        update: {
          totalPendingXLabs: {
            increment: pendingDifference
          },
          lastUpdated: currentTime
        },
        create: {
          id: 'global',
          totalPendingXLabs: newPendingAmount,
          totalUsers: 1,
          totalStaked: 0,
          lastUpdated: currentTime
        }
      })

      return {
        userPendingClaim: user.pendingXLabsClaim,
        globalPendingClaim: globalStats.totalPendingXLabs
      }
    })

    return {
      success: true,
      userPendingClaim: result.userPendingClaim,
      globalPendingClaim: result.globalPendingClaim
    }
  } catch (error) {
    console.error('Error updating pending xLABS:', error)
    return {
      success: false,
      userPendingClaim: 0,
      globalPendingClaim: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get xLABS statistics for a specific user
 */
export async function getUserXLabsStats(walletAddress: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      select: {
        totalXLabsClaimed: true,
        pendingXLabsClaim: true,
        lastClaimTime: true,
        lastPendingUpdate: true,
        xLABSBalance: true
      }
    })

    return {
      success: true,
      totalClaimed: user?.totalXLabsClaimed || 0,
      pendingClaim: user?.pendingXLabsClaim || 0,
      lastClaimTime: user?.lastClaimTime || null,
      lastPendingUpdate: user?.lastPendingUpdate || null,
      currentBalance: user?.xLABSBalance || 0
    }
  } catch (error) {
    console.error('Error fetching user xLABS stats:', error)
    return {
      success: false,
      totalClaimed: 0,
      pendingClaim: 0,
      lastClaimTime: null,
      lastPendingUpdate: null,
      currentBalance: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get global xLABS statistics
 */
export async function getGlobalXLabsStats() {
  try {
    const globalStats = await prisma.globalStats.findUnique({
      where: { id: 'global' }
    })

    // Also get additional stats from user table
    const userStats = await prisma.user.aggregate({
      _count: { id: true },
      _sum: {
        totalXLabsClaimed: true,
        pendingXLabsClaim: true,
        stakedBalance: true
      }
    })

    return {
      success: true,
      totalXLabsClaimed: globalStats?.totalXLabsClaimed || 0,
      totalPendingXLabs: globalStats?.totalPendingXLabs || 0,
      totalUsers: userStats._count.id,
      totalStaked: userStats._sum.stakedBalance || 0,
      lastUpdated: globalStats?.lastUpdated || null,
      // Verification: sum from users should match global stats
      userClaimedVerification: userStats._sum.totalXLabsClaimed || 0,
      userPendingVerification: userStats._sum.pendingXLabsClaim || 0
    }
  } catch (error) {
    console.error('Error fetching global xLABS stats:', error)
    return {
      success: false,
      totalXLabsClaimed: 0,
      totalPendingXLabs: 0,
      totalUsers: 0,
      totalStaked: 0,
      lastUpdated: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get top xLABS claimers (leaderboard)
 */
export async function getTopXLabsClaimers(limit: number = 10) {
  try {
    const topClaimers = await prisma.user.findMany({
      select: {
        walletAddress: true,
        totalXLabsClaimed: true,
        pendingXLabsClaim: true,
        lastClaimTime: true
      },
      orderBy: {
        totalXLabsClaimed: 'desc'
      },
      take: limit,
      where: {
        totalXLabsClaimed: {
          gt: 0
        }
      }
    })

    return {
      success: true,
      claimers: topClaimers
    }
  } catch (error) {
    console.error('Error fetching top xLABS claimers:', error)
    return {
      success: false,
      claimers: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get users with highest pending xLABS (pending leaderboard)
 */
export async function getTopPendingXLabs(limit: number = 10) {
  try {
    const topPending = await prisma.user.findMany({
      select: {
        walletAddress: true,
        pendingXLabsClaim: true,
        totalXLabsClaimed: true,
        lastPendingUpdate: true
      },
      orderBy: {
        pendingXLabsClaim: 'desc'
      },
      take: limit,
      where: {
        pendingXLabsClaim: {
          gt: 0
        }
      }
    })

    return {
      success: true,
      pendingUsers: topPending
    }
  } catch (error) {
    console.error('Error fetching top pending xLABS:', error)
    return {
      success: false,
      pendingUsers: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Recalculate and sync global pending xLABS from user data
 * Useful for data integrity checks or after bulk operations
 */
export async function syncGlobalPendingStats() {
  try {
    const currentTime = Math.floor(Date.now() / 1000)
    
    const userStats = await prisma.user.aggregate({
      _sum: {
        pendingXLabsClaim: true,
        totalXLabsClaimed: true
      },
      _count: { id: true }
    })

    const globalStats = await prisma.globalStats.upsert({
      where: { id: 'global' },
      update: {
        totalPendingXLabs: userStats._sum.pendingXLabsClaim || 0,
        totalXLabsClaimed: userStats._sum.totalXLabsClaimed || 0,
        totalUsers: userStats._count.id,
        lastUpdated: currentTime
      },
      create: {
        id: 'global',
        totalPendingXLabs: userStats._sum.pendingXLabsClaim || 0,
        totalXLabsClaimed: userStats._sum.totalXLabsClaimed || 0,
        totalUsers: userStats._count.id,
        totalStaked: 0,
        lastUpdated: currentTime
      }
    })

    return {
      success: true,
      syncedPending: globalStats.totalPendingXLabs,
      syncedClaimed: globalStats.totalXLabsClaimed,
      totalUsers: globalStats.totalUsers
    }
  } catch (error) {
    console.error('Error syncing global pending stats:', error)
    return {
      success: false,
      syncedPending: 0,
      syncedClaimed: 0,
      totalUsers: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
