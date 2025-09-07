/**
 * Calculate real-time pending rewards based on the same logic as the Rust program
 */

// Simple approximation of PreciseNumber for JavaScript
class PreciseNumber {
    private value: bigint;

    constructor(value: bigint | number) {
        this.value = typeof value === 'bigint' ? value : BigInt(value);
    }

    static new(value: bigint | number): PreciseNumber | null {
        try {
            return new PreciseNumber(value);
        } catch {
            return null;
        }
    }

    checkedSub(other: PreciseNumber): PreciseNumber | null {
        try {
            const result = this.value - other.value;
            if (result < 0n) return null;
            return new PreciseNumber(result);
        } catch {
            return null;
        }
    }

    checkedMul(other: PreciseNumber): PreciseNumber | null {
        try {
            // Handle potential overflow - in a real implementation you'd want more sophisticated overflow detection
            const result = this.value * other.value;
            return new PreciseNumber(result);
        } catch {
            return null;
        }
    }

    checkedAdd(other: PreciseNumber): PreciseNumber | null {
        try {
            const result = this.value + other.value;
            return new PreciseNumber(result);
        } catch {
            return null;
        }
    }

    toImprecise(): bigint | null {
        try {
            return this.value;
        } catch {
            return null;
        }
    }
}

/**
 * Calculate the current interest index based on APR and time elapsed
 * This approximates how the on-chain program would update the interest index
 */
export function calculateCurrentInterestIndex(
    lastInterestIndex: bigint,
    lastUpdatedTimestamp: bigint,
    aprBps: bigint,
    currentTimestamp?: number
): bigint {
    const now = currentTimestamp ? BigInt(Math.floor(currentTimestamp / 1000)) : BigInt(Math.floor(Date.now() / 1000));
    const timeElapsed = now - lastUpdatedTimestamp;

    if (timeElapsed <= 0n) {
        return lastInterestIndex;
    }

    // APR is in basis points (10000 = 100%)
    // Calculate interest accrued: (APR / 10000) * (timeElapsed / SECONDS_PER_YEAR)
    const SECONDS_PER_YEAR = 365n * 24n * 60n * 60n; // 31,536,000
    const PRECISION_FACTOR = 1000000000000000000n; // 18 decimal places for precision

    // Calculate interest rate per second with precision
    const interestPerSecond = (aprBps * PRECISION_FACTOR) / (10000n * SECONDS_PER_YEAR);

    // Calculate total interest accumulated
    const interestAccumulated = interestPerSecond * timeElapsed;

    // Add to the last interest index
    return lastInterestIndex + interestAccumulated;
}

/**
 * Calculate real-time pending rewards using the same logic as the Rust update_pending_rewards function
 */
export function calculateRealtimePendingRewards(
    stakedAmount: bigint,
    pendingRewards: bigint,
    interestIndexAtDeposit: bigint,
    currentInterestIndex: bigint
): bigint | null {
    // Mirror the Rust logic exactly
    const stakedAmountPrecise = PreciseNumber.new(stakedAmount);
    const interestIndexAtDepositPrecise = PreciseNumber.new(interestIndexAtDeposit);
    const currentInterestIndexPrecise = PreciseNumber.new(currentInterestIndex);

    if (!stakedAmountPrecise || !interestIndexAtDepositPrecise || !currentInterestIndexPrecise) {
        return null;
    }

    const rewardInterestIndex = currentInterestIndexPrecise.checkedSub(interestIndexAtDepositPrecise);
    if (!rewardInterestIndex) return null;

    const rewards = rewardInterestIndex.checkedMul(stakedAmountPrecise);
    if (!rewards) return null;

    const currentPendingRewardsPrecise = PreciseNumber.new(pendingRewards);
    if (!currentPendingRewardsPrecise) return null;

    const newPendingRewards = currentPendingRewardsPrecise.checkedAdd(rewards);
    if (!newPendingRewards) return null;

    const newRewardsU128 = newPendingRewards.toImprecise();
    if (!newRewardsU128) return null;

    // Check for overflow (u64::MAX)
    const U64_MAX = 18446744073709551615n;
    if (newRewardsU128 > U64_MAX) {
        return null;
    }

    return newRewardsU128;
}

/**
 * Calculate real-time pending rewards for display
 * Returns the rewards in the token's native units (before decimal adjustment)
 */
export function calculateDisplayPendingRewards(
    stakeAccountData: {
        stakedAmount: bigint;
        pendingRewards: bigint;
        interestIndexAtDeposit: bigint;
    },
    stakePoolData: {
        interestIndex: bigint;
        interestIndexLastUpdated: bigint;
    },
    stakePoolConfigData: {
        aprBps: bigint;
    },
    currentTimestamp?: number
): bigint {
    // Calculate the current interest index
    const currentInterestIndex = calculateCurrentInterestIndex(
        stakePoolData.interestIndex,
        stakePoolData.interestIndexLastUpdated,
        stakePoolConfigData.aprBps,
        currentTimestamp
    );

    // Calculate real-time pending rewards
    const realtimeRewards = calculateRealtimePendingRewards(
        stakeAccountData.stakedAmount,
        stakeAccountData.pendingRewards,
        stakeAccountData.interestIndexAtDeposit,
        currentInterestIndex
    );

    return realtimeRewards || stakeAccountData.pendingRewards;
}
