import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, labsBalance, stakedBalance } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const currentTime = Math.floor(Date.now() / 1000)

    // Update user's balance information
    const user = await prisma.user.update({
      where: { walletAddress },
      data: {
        labsBalance: labsBalance || 0,
        stakedBalance: stakedBalance || 0,
        lastBalanceUpdate: currentTime
      }
    })

    return NextResponse.json({
      success: true,
      balances: {
        labs: user.labsBalance,
        staked: user.stakedBalance
      }
    })
  } catch (error) {
    console.error('Error updating user balances:', error)
    return NextResponse.json(
      { error: 'Failed to update user balances' },
      { status: 500 }
    )
  }
}
