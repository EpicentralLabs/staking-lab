import { useEffect, useState } from 'react';
import { calculateDisplayPendingRewards } from '@/lib/rewards-calculator';
import { useStakePoolData, useStakePoolConfigData } from './shared/data-access';

/**
 * Hook that provides real-time pending rewards calculation
 * Updates every second to show live rewards accumulation
 */
export function useRealtimePendingRewards(
    stakeAccountData: {
        stakedAmount: bigint;
        pendingRewards: bigint;
        interestIndexAtDeposit: bigint;
    } | null
) {
    const [realtimeRewards, setRealtimeRewards] = useState<bigint>(0n);
    const stakePoolQuery = useStakePoolData();
    const stakePoolConfigQuery = useStakePoolConfigData();

    useEffect(() => {
        if (!stakeAccountData || !stakePoolQuery.data || !stakePoolConfigQuery.data) {
            setRealtimeRewards(stakeAccountData?.pendingRewards || 0n);
            return;
        }

        const updateRewards = () => {
            const currentRewards = calculateDisplayPendingRewards(
                stakeAccountData,
                {
                    interestIndex: stakePoolQuery.data.data.interestIndex,
                    interestIndexLastUpdated: stakePoolQuery.data.data.interestIndexLastUpdated,
                },
                {
                    aprBps: stakePoolConfigQuery.data.data.aprBps,
                }
            );

            setRealtimeRewards(currentRewards);
        };

        // Update immediately
        updateRewards();

        // Update every second
        const interval = setInterval(updateRewards, 1000);

        return () => clearInterval(interval);
    }, [
        stakeAccountData,
        stakePoolQuery.data,
        stakePoolConfigQuery.data,
    ]);

    return {
        realtimeRewards,
        isLoading: stakePoolQuery.isLoading || stakePoolConfigQuery.isLoading,
        error: stakePoolQuery.error || stakePoolConfigQuery.error,
    };
}
