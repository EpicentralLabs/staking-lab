import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

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
     * Retry fetching stake account until it exists and meets the expected conditions
     * Uses exponential backoff to handle blockchain propagation delays
     */
    const retryStakeAccountUntilReady = async (expectedStakedAmount?: bigint) => {
        let attempts = 0
        const maxAttempts = 8
        const startTime = Date.now()

        console.log('🔄 Starting stake account retry sequence', {
            expectedStakedAmount: expectedStakedAmount?.toString(),
            maxAttempts,
            timestamp: new Date().toISOString()
        })

        while (attempts < maxAttempts) {
            const attemptTime = Date.now()
            setRetryStatus(attempts === 0 ? 'Waiting for blockchain...' : `Retrying... (${attempts + 1}/${maxAttempts})`)

            console.log(`🔄 Retry attempt ${attempts + 1}/${maxAttempts}`, {
                elapsedTime: `${attemptTime - startTime}ms`,
                timestamp: new Date().toISOString()
            })

            try {
                await queryClient.refetchQueries({ queryKey: ['user-stake-account'] })

                // Get the current data from the query cache
                const stakeAccountData = queryClient.getQueryData(['user-stake-account'])

                console.log(`📊 Stake account data (attempt ${attempts + 1}):`, {
                    exists: (stakeAccountData as any)?.exists,
                    fullData: stakeAccountData,
                    dataStructure: stakeAccountData ? Object.keys(stakeAccountData as any) : 'null',
                    timestamp: new Date().toISOString()
                })

                // Check if stake account exists and meets our expectations
                if ((stakeAccountData as any)?.exists) {
                    const stakedAmount = (stakeAccountData as any)?.data?.stakedAmount

                    console.log(`✅ Account exists! Validating staked amount:`, {
                        stakedAmount: stakedAmount?.toString(),
                        expectedStakedAmount: expectedStakedAmount?.toString(),
                        hasExpectedAmount: !!expectedStakedAmount,
                        meetsExpectation: expectedStakedAmount ? (stakedAmount && stakedAmount >= expectedStakedAmount) : 'N/A'
                    })

                    // If we have an expected amount, validate it
                    if (expectedStakedAmount) {
                        if (stakedAmount && stakedAmount >= expectedStakedAmount) {
                            console.log('🎉 SUCCESS: Account ready with expected amount!', {
                                stakedAmount: stakedAmount.toString(),
                                expectedStakedAmount: expectedStakedAmount.toString(),
                                totalTime: `${Date.now() - startTime}ms`
                            })
                            setRetryStatus('Account ready!')
                            return // Success!
                        } else {
                            console.log(`❌ Amount validation failed:`, {
                                reason: !stakedAmount ? 'No staked amount' : 'Amount too low',
                                stakedAmount: stakedAmount?.toString(),
                                expectedStakedAmount: expectedStakedAmount.toString(),
                                difference: stakedAmount ? (expectedStakedAmount - stakedAmount).toString() : 'N/A'
                            })
                        }
                    } else {
                        // For operations that just need the account to exist
                        console.log('🎉 SUCCESS: Account exists (no amount validation needed)!', {
                            totalTime: `${Date.now() - startTime}ms`
                        })
                        setRetryStatus('Account ready!')
                        return // Success!
                    }
                } else {
                    console.log(`❌ Account does not exist yet (attempt ${attempts + 1})`, {
                        dataReceived: !!stakeAccountData,
                        existsField: (stakeAccountData as any)?.exists
                    })
                }

                attempts++

                if (attempts < maxAttempts) {
                    // Exponential backoff: 500ms, 1s, 2s, 4s, 8s, etc.
                    const delay = 500 * Math.pow(2, attempts - 1)
                    console.log(`⏳ Waiting ${delay}ms before next attempt...`)
                    await new Promise(resolve => setTimeout(resolve, delay))
                }
            } catch (error) {
                console.error(`❌ Stake account retry ${attempts + 1} failed:`, {
                    error: error instanceof Error ? error.message : String(error),
                    fullError: error,
                    attempt: attempts + 1,
                    timestamp: new Date().toISOString()
                })
                attempts++

                if (attempts < maxAttempts) {
                    const delay = 500 * Math.pow(2, attempts - 1)
                    console.log(`⏳ Waiting ${delay}ms before next attempt after error...`)
                    await new Promise(resolve => setTimeout(resolve, delay))
                }
            }
        }

        // If we get here, all retries failed
        const totalTime = Date.now() - startTime
        console.error('💥 RETRY SEQUENCE FAILED - All attempts exhausted', {
            totalAttempts: maxAttempts,
            totalTime: `${totalTime}ms`,
            expectedStakedAmount: expectedStakedAmount?.toString(),
            timestamp: new Date().toISOString()
        })
        setRetryStatus('Timeout - please refresh manually')
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

    const refetchStakingQueries = async (expectedStakedAmount?: bigint) => {
        setIsRefetching(true)
        setRetryStatus('')

        try {
            // For staking operations - refetch other accounts immediately
            await Promise.all([
                queryClient.refetchQueries({ queryKey: ['user-labs-account'] }),
                queryClient.refetchQueries({ queryKey: ['vault-account'] }),
                queryClient.refetchQueries({ queryKey: ['stake-pool-data'] }),
            ])

            // Then retry stake account until it's ready with the expected amount
            await retryStakeAccountUntilReady(expectedStakedAmount)
        } catch (error) {
            console.error('Staking refetch failed:', error)
            throw error
        } finally {
            setIsRefetching(false)
            setRetryStatus('')
        }
    }

    const refetchUnstakingQueries = async (expectedRemainingAmount?: bigint) => {
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

            // Then retry stake account until it shows the correct remaining amount
            if (expectedRemainingAmount !== undefined) {
                await retryStakeAccountUntilReady(expectedRemainingAmount)
            } else {
                // Just do a single refetch if no expected amount
                await queryClient.refetchQueries({ queryKey: ['user-stake-account'] })
            }
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