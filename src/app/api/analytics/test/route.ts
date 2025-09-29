import { NextRequest, NextResponse } from 'next/server'
import { getGlobalXLabsStats, getTopXLabsClaimers, getTopPendingXLabs } from '@/lib/analytics-stats'
import { getAnalyticsServiceStatus } from '@/lib/analytics-service'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get analytics service status
    const serviceStatus = getAnalyticsServiceStatus()
    
    // Get global stats
    const globalStats = await getGlobalXLabsStats()
    
    // Get top claimers
    const topClaimers = await getTopXLabsClaimers(5)
    
    // Get top pending
    const topPending = await getTopPendingXLabs(5)
    
    // Get recent users
    const recentUsers = await prisma.user.findMany({
      select: {
        walletAddress: true,
        firstVisitTime: true,
        labsBalance: true,
        stakedBalance: true,
        totalXLabsClaimed: true,
        pendingXLabsClaim: true
      },
      orderBy: {
        firstVisitTime: 'desc'
      },
      take: 5
    })
    
    // Get daily analytics sample
    const dailyAnalytics = await prisma.dailyAnalytics.findMany({
      orderBy: {
        date: 'desc'
      },
      take: 7
    })
    
    return NextResponse.json({
      success: true,
      analyticsService: serviceStatus,
      globalStats,
      topClaimers,
      topPending,
      recentUsers,
      dailyAnalyticsSample: dailyAnalytics,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('API Error - Analytics test:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
