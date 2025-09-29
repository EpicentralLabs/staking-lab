import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const currentTime = Math.floor(Date.now() / 1000)

    // Upsert user - create if doesn't exist, track connection if exists
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {
        // User already exists, no additional fields to update on connection
      },
      create: {
        walletAddress,
        firstVisitTime: currentTime,
        labsBalance: BigInt(0),
        xLABSBalance: BigInt(0),
        stakedBalance: BigInt(0),
        unstakedBalance: BigInt(0),
        pendingRewards: BigInt(0),
        interestIndex: BigInt(0),
        bump: 0,
        totalXLabsClaimed: BigInt(0),
        pendingXLabsClaim: BigInt(0)
      }
    })

    // Update global stats for total users
    await prisma.globalStats.upsert({
      where: { id: 'global' },
      update: {
        totalUsers: await prisma.user.count(),
        lastUpdated: currentTime
      },
      create: {
        id: 'global',
        totalUsers: 1,
        totalStaked: BigInt(0),
        totalXLabsClaimed: BigInt(0),
        totalPendingXLabs: BigInt(0),
        lastUpdated: currentTime
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        walletAddress: user.walletAddress,
        firstVisit: user.firstVisitTime === currentTime,
        totalXLabsClaimed: user.totalXLabsClaimed.toString(),
        pendingXLabsClaim: user.pendingXLabsClaim.toString(),
        stakedBalance: user.stakedBalance.toString()
      }
    })
  } catch (error) {
    console.error('Error tracking wallet connection:', error)
    return NextResponse.json(
      { error: 'Failed to track wallet connection' },
      { status: 500 }
    )
  }
}
