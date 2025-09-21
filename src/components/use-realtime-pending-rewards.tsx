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
        // Early return if data isn't ready yet
        if (stakePoolQuery.isLoading || stakePoolConfigQuery.isLoading) {
            return;
        }

        // If no stake account, set to 0
        if (!stakeAccountData) {
            setRealtimeRewards(0n);
            return;
        }

        // If queries failed or don't have data, fall back to existing pending rewards
        if (!stakePoolQuery.data || !stakePoolConfigQuery.data) {
            setRealtimeRewards(stakeAccountData.pendingRewards || 0n);
            return;
        }

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
