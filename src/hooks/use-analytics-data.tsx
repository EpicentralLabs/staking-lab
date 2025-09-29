'use client'

import { useQuery } from '@tanstack/react-query'

// Types for API responses
interface LabsStakingDataPoint {
  date: string
  staked: number
  unstaked: number
}

interface XLabsRewardsDataPoint {
  date: string
  claimed: number
  pending: number
}

interface AnalyticsApiResponse<T> {
  success: boolean
  data: T[]
  days: number
  error?: string
}

/**
 * Hook to fetch LABS staking chart data
 */
export function useLabsStakingData(days: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'labs-staking', days],
    queryFn: async (): Promise<LabsStakingDataPoint[]> => {
      const response = await fetch(`/api/analytics/labs-staking?days=${days}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const result: AnalyticsApiResponse<LabsStakingDataPoint> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch LABS staking data')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook to fetch xLABS rewards chart data
 */
export function useXLabsRewardsData(days: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'xlabs-rewards', days],
    queryFn: async (): Promise<XLabsRewardsDataPoint[]> => {
      const response = await fetch(`/api/analytics/xlabs-rewards?days=${days}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const result: AnalyticsApiResponse<XLabsRewardsDataPoint> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch xLABS rewards data')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook to fetch both analytics datasets
 */
export function useAnalyticsData(days: number = 30) {
  const labsStakingQuery = useLabsStakingData(days)
  const xLabsRewardsQuery = useXLabsRewardsData(days)

  return {
    labsStaking: labsStakingQuery,
    xLabsRewards: xLabsRewardsQuery,
    isLoading: labsStakingQuery.isLoading || xLabsRewardsQuery.isLoading,
    isError: labsStakingQuery.isError || xLabsRewardsQuery.isError,
    error: labsStakingQuery.error || xLabsRewardsQuery.error,
    isSuccess: labsStakingQuery.isSuccess && xLabsRewardsQuery.isSuccess,
    refetch: () => {
      labsStakingQuery.refetch()
      xLabsRewardsQuery.refetch()
    }
  }
}
