import { useRealtimePendingRewards } from '../use-realtime-pending-rewards';
import { cn } from '@/lib/utils';

interface AnimatedRewardCounterProps {
    stakeAccountData: {
        stakedAmount: bigint;
        pendingRewards: bigint;
        interestIndexAtDeposit: bigint;
    } | null;
    className?: string;
    showLabel?: boolean;
    labelText?: string;
}

export function AnimatedRewardCounter({
    stakeAccountData,
    className,
    showLabel = true,
    labelText = "xLABS"
}: AnimatedRewardCounterProps) {
    const { realtimeRewards, isLoading, error } = useRealtimePendingRewards(stakeAccountData);

    // Convert to tokens for display
    const rewardsInTokens = Number(realtimeRewards) / 1e9;
    const isAnimating = rewardsInTokens > 0;

    if (isLoading) {
        return (
            <div className={cn("text-center", className)}>
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded w-24 mx-auto mb-2"></div>
                    {showLabel && <div className="h-4 bg-gray-700 rounded w-16 mx-auto"></div>}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cn("text-center", className)}>
                <p className="text-red-400">Error loading rewards</p>
            </div>
        );
    }

    return (
        <div className={cn("text-center", className)}>
            <div className="relative">
                <p
                    className={cn(
                        "text-xl sm:text-4xl font-light text-[#4a85ff] mb-2 tabular-nums transition-all duration-150",
                        isAnimating && "scale-[1.02] drop-shadow-[0_0_8px_rgba(74,133,255,0.6)]"
                    )}
                    style={{
                        textShadow: isAnimating
                            ? "0 0 12px #4a85ff, 0 0 24px rgba(74,133,255,0.4)"
                            : "0 0 8px #4a85ff"
                    }}
                >
                    {rewardsInTokens.toFixed(4)}
                </p>

                {/* Animated indicator when rewards are actively increasing */}
                {rewardsInTokens > 0 && (
                    <div className="absolute -top-1 -right-1">
                        <div
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                isAnimating
                                    ? "bg-green-400 animate-pulse scale-125 shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                                    : "bg-green-400 animate-pulse"
                            )}
                        />
                    </div>
                )}

                {/* Subtle increment animation */}
                {isAnimating && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                            <div className="animate-bounce">
                                <div className="w-1 h-1 bg-[#4a85ff] rounded-full opacity-60"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showLabel && (
                <p className={cn(
                    "text-xs sm:text-sm text-gray-400 uppercase tracking-wider transition-all duration-150",
                    isAnimating && "text-[#4a85ff] font-medium"
                )}>
                    {labelText} {rewardsInTokens > 0 && "(Live)"}
                </p>
            )}
        </div>
    );
}