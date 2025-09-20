import { useEffect, useState } from 'react';
import { calculateDisplayPendingRewards } from '@/lib/rewards-calculator';
import { useStakePoolData, useStakePoolConfigData } from './shared/data-access';

/**
 * Hook that provides real-time pending rewards calculation
 * Simulates continuous rewards growth by passing live timestamps to mirror onchain interest accrual
 * Updates every 100ms for smooth visual feedback
 */
export function useRealtimePendingRewards(
    stakeAccountData: {
        stakedAmount: bigint;
        pendingRewards: bigint;
        interestIndexAtDeposit: bigint;
    } | null
) {
    const stakePoolQuery = useStakePoolData();
    const stakePoolConfigQuery = useStakePoolConfigData();

    // Use simple state without lazy initializer - let useEffect handle the calculation
    const [realtimeRewards, setRealtimeRewards] = useState<bigint>(0n);

    useEffect(() => {
        console.log('🚨 REWARDS HOOK DEBUG - You said you have staked tokens:', {
            hasStakeAccountData: !!stakeAccountData,
            stakeAccountData,
            stakePoolLoading: stakePoolQuery.isLoading,
            stakePoolConfigLoading: stakePoolConfigQuery.isLoading,
            hasStakePoolData: !!stakePoolQuery.data,
            hasStakePoolConfigData: !!stakePoolConfigQuery.data,
            stakePoolError: stakePoolQuery.error?.message,
            stakePoolConfigError: stakePoolConfigQuery.error?.message,
        });

        // Early return if data isn't ready yet
        if (stakePoolQuery.isLoading || stakePoolConfigQuery.isLoading) {
            console.log('🚨 Still loading queries');
            return;
        }

        // If no stake account, set to 0
        if (!stakeAccountData) {
            console.log('🚨 No stake account data - but you said you have staked tokens!');
            setRealtimeRewards(0n);
            return;
        }

        // If queries failed or don't have data, fall back to existing pending rewards
        if (!stakePoolQuery.data || !stakePoolConfigQuery.data) {
            console.log('🚨 Missing pool data, falling back to existing pending rewards');
            setRealtimeRewards(stakeAccountData.pendingRewards);
            return;
        }

        console.log('🚨 All data available, calculating rewards with:', {
            stakedAmount: stakeAccountData.stakedAmount,
            pendingRewards: stakeAccountData.pendingRewards,
            interestIndexAtDeposit: stakeAccountData.interestIndexAtDeposit,
            currentInterestIndex: stakePoolQuery.data.data.interestIndex,
            lastUpdated: stakePoolQuery.data.data.interestIndexLastUpdated,
            aprBps: stakePoolConfigQuery.data.data.aprBps,
        });

        const updateRewards = () => {
            // Calculate rewards with LIVE timestamp - this is the key for real-time growth!
            const currentRewards = calculateDisplayPendingRewards(
                stakeAccountData,
                {
                    interestIndex: stakePoolQuery.data.data.interestIndex,
                    interestIndexLastUpdated: stakePoolQuery.data.data.interestIndexLastUpdated,
                },
                {
                    aprBps: stakePoolConfigQuery.data.data.aprBps,
                },
                Date.now() // Pass live timestamp for continuous growth simulation
            );

            console.log('🚨 Calculated rewards result:', currentRewards);
            setRealtimeRewards(currentRewards);
        };

        // Calculate immediately when effect runs (handles data loading after initial render)
        updateRewards();

        // Update every 100ms for smooth real-time growth
        const interval = setInterval(updateRewards, 100);

        return () => clearInterval(interval);
    }, [
        stakeAccountData,
        stakePoolQuery.data,
        stakePoolConfigQuery.data,
        stakePoolQuery.isLoading,
        stakePoolConfigQuery.isLoading,
    ]);

    return {
        realtimeRewards,
        isLoading: stakePoolQuery.isLoading || stakePoolConfigQuery.isLoading,
        error: stakePoolQuery.error || stakePoolConfigQuery.error,
    };
}
