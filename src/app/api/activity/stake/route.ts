import { NextRequest, NextResponse } from 'next/server'
import { recordStakingActivity } from '@/lib/analytics-stats'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, amount, isStaking = true } = body

    if (!walletAddress || amount === undefined) {
      return NextResponse.json(
        { error: 'Wallet address and amount are required' },
        { status: 400 }
      )
    }

    const currentTime = Math.floor(Date.now() / 1000)

    // Update user's staked balance
    await prisma.user.update({
      where: { walletAddress },
      data: {
        stakedBalance: isStaking 
          ? { increment: amount }
          : { decrement: amount },
        unstakedBalance: !isStaking
          ? { increment: amount }
          : undefined,
        lastStakeTime: isStaking ? currentTime : undefined,
        lastUnstakeTime: !isStaking ? currentTime : undefined
      }
    })

    // Update global staked amount
    await prisma.globalStats.update({
      where: { id: 'global' },
      data: {
        totalStaked: isStaking
          ? { increment: amount }
          : { decrement: amount },
        lastUpdated: currentTime
      }
    })

    // Record activity for analytics
    const result = await recordStakingActivity(walletAddress, amount, isStaking)

    if (!result.success) {
      console.error('Failed to record staking activity:', result.error)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully recorded ${isStaking ? 'stake' : 'unstake'} activity`,
      amount,
      isStaking
    })
  } catch (error) {
    console.error('Error tracking staking activity:', error)
    return NextResponse.json(
      { error: 'Failed to track staking activity' },
      { status: 500 }
    )
  }
}
