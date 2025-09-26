import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { UserStakeAccountQueryData } from '../types/staking'

/**
 * Hook for coordinating refetches across multiple queries after transactions
 * Provides a single loading state and ensures all refetches complete together
 * Includes retry logic for stake account to handle blockchain propagation delays
 */
export function useCoordinatedRefetch() {
    const [isRefetching, setIsRefetching] = useState(false)
    const [retryStatus, setRetryStatus] = useState<string>('')
    const queryClient = useQueryClient()

    /**
     * Simple delayed refetch for stake account
     * Just waits a moment for blockchain to propagate, then refetches once
     */
    const delayedStakeAccountRefetch = async () => {
        setRetryStatus('Updating...')
        
        // Simple 1 second delay to allow blockchain propagation
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Single refetch
        await queryClient.refetchQueries({ queryKey: ['user-stake-account'] })
        
        setRetryStatus('')
    }

    const refetchAll = async () => {
        setIsRefetching(true)
        setRetryStatus('')

        try {
            // Refetch all critical queries in parallel and wait for all to complete
            await Promise.all([
                queryClient.refetchQueries({ queryKey: ['user-labs-account'] }),
                queryClient.refetchQueries({ queryKey: ['user-stake-account'] }),
                queryClient.refetchQueries({ queryKey: ['user-xlabs-account'] }),
                queryClient.refetchQueries({ queryKey: ['vault-account'] }),
                queryClient.refetchQueries({ queryKey: ['stake-pool-data'] }),
            ])
        } catch (error) {
            console.error('Coordinated refetch failed:', error)
            throw error
        } finally {
            setIsRefetching(false)
            setRetryStatus('')
        }
    }

    const refetchStakingQueries = async () => {
        setIsRefetching(true)
        setRetryStatus('')

        try {
            // For staking operations - refetch other accounts immediately
            await Promise.all([
                queryClient.refetchQueries({ queryKey: ['user-labs-account'] }),
                queryClient.refetchQueries({ queryKey: ['vault-account'] }),
                queryClient.refetchQueries({ queryKey: ['stake-pool-data'] }),
            ])

            // Then do a simple delayed refetch of stake account
            await delayedStakeAccountRefetch()
        } catch (error) {
            console.error('Staking refetch failed:', error)
            throw error
        } finally {
            setIsRefetching(false)
            setRetryStatus('')
        }
    }

    const refetchUnstakingQueries = async () => {
        setIsRefetching(true)
        setRetryStatus('')

        try {
            // For unstaking operations - refetch other accounts immediately
            await Promise.all([
                queryClient.refetchQueries({ queryKey: ['user-labs-account'] }),
                queryClient.refetchQueries({ queryKey: ['user-xlabs-account'] }),
                queryClient.refetchQueries({ queryKey: ['vault-account'] }),
                queryClient.refetchQueries({ queryKey: ['stake-pool-data'] }),
            ])

            // Then do a simple delayed refetch of stake account
            await delayedStakeAccountRefetch()
        } catch (error) {
            console.error('Unstaking refetch failed:', error)
            throw error
        } finally {
            setIsRefetching(false)
            setRetryStatus('')
        }
    }

    const refetchClaimingQueries = async () => {
        setIsRefetching(true)
        setRetryStatus('')

        try {
            // For claiming operations - refetch stake account and xlabs balance
            // Claims usually work immediately, so no retry needed
            await Promise.all([
                queryClient.refetchQueries({ queryKey: ['user-stake-account'] }),
                queryClient.refetchQueries({ queryKey: ['user-xlabs-account'] }),
                queryClient.refetchQueries({ queryKey: ['stake-pool-data'] }),
            ])
        } catch (error) {
            console.error('Claiming refetch failed:', error)
            throw error
        } finally {
            setIsRefetching(false)
            setRetryStatus('')
        }
    }

    return {
        isRefetching,
        retryStatus,
        refetchAll,
        refetchStakingQueries,
        refetchUnstakingQueries,
        refetchClaimingQueries,
    }
}