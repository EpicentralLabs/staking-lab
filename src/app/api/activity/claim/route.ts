import { NextRequest, NextResponse } from 'next/server'
import { recordXLabsClaim, recordXLabsClaimActivity } from '@/lib/analytics-stats'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, amount } = body

    if (!walletAddress || amount === undefined) {
      return NextResponse.json(
        { error: 'Wallet address and amount are required' },
        { status: 400 }
      )
    }

    // Record the claim in user stats and global stats
    const claimResult = await recordXLabsClaim(walletAddress, amount)

    if (!claimResult.success) {
      return NextResponse.json(
        { error: claimResult.error || 'Failed to record xLABS claim' },
        { status: 500 }
      )
    }

    // Record activity for analytics charts
    const activityResult = await recordXLabsClaimActivity(walletAddress, amount)

    if (!activityResult.success) {
      console.error('Failed to record claim activity for analytics:', activityResult.error)
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully recorded xLABS claim',
      amount,
      userTotalClaimed: claimResult.userTotalClaimed,
      globalTotalClaimed: claimResult.globalTotalClaimed,
      userPendingClaim: claimResult.userPendingClaim,
      globalPendingClaim: claimResult.globalPendingClaim
    })
  } catch (error) {
    console.error('Error tracking claim activity:', error)
    return NextResponse.json(
      { error: 'Failed to track claim activity' },
      { status: 500 }
    )
  }
}
