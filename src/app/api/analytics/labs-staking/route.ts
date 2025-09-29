import { NextRequest, NextResponse } from 'next/server'
import { getLabsStakingChartData } from '@/lib/analytics-stats'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30', 10)
    
    // Validate days parameter
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days parameter must be between 1 and 365' },
        { status: 400 }
      )
    }

    const result = await getLabsStakingChartData(days)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch LABS staking data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      days: days
    })
    
  } catch (error) {
    console.error('API Error - LABS staking data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
