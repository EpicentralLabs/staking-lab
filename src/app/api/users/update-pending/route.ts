import { NextRequest, NextResponse } from 'next/server'
import { updatePendingXLabs } from '@/lib/analytics-stats'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, pendingAmount } = body

    if (!walletAddress || pendingAmount === undefined) {
      return NextResponse.json(
        { error: 'Wallet address and pending amount are required' },
        { status: 400 }
      )
    }

    const result = await updatePendingXLabs(walletAddress, pendingAmount)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update pending xLABS' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      userPendingClaim: result.userPendingClaim,
      globalPendingClaim: result.globalPendingClaim
    })
  } catch (error) {
    console.error('Error updating pending xLABS:', error)
    return NextResponse.json(
      { error: 'Failed to update pending xLABS' },
      { status: 500 }
    )
  }
}
