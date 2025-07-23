"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ClaimRewardsSectionProps {
  pendingRewards: number;
  isClaiming: boolean;
  isPoolActive: boolean;
  onClaim: () => void;
  isUpdatingRewards: boolean;
  onUpdateRewards: () => void;
}

// Smooth number animation component
function SmoothNumber({ value, decimals = 4 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const startValue = displayValue;
    const endValue = value;
    const duration = 100;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuad = (t: number) => t * (2 - t);
      const currentValue = startValue + (endValue - startValue) * easeOutQuad(progress);
      setDisplayValue(currentValue);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value, displayValue]);

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: false,
  });

  return <span className="tabular-nums">{formatted}</span>;
}

export function ClaimRewardsSection({ 
  pendingRewards, 
  isClaiming, 
  isPoolActive, 
  onClaim,
  isUpdatingRewards,
  onUpdateRewards
}: ClaimRewardsSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClaim = () => {
    onClaim();
    setIsDialogOpen(false);
  };

  const isDisabled = pendingRewards <= 0 || isClaiming || !isPoolActive;

  return (
    <div className="space-y-2 sm:space-y-6">
      <div className="text-center py-2 sm:py-6">
        <p className="text-xl sm:text-4xl font-light text-[#4a85ff] mb-2">
          <SmoothNumber value={pendingRewards} />
        </p>
        <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">xLABS</p>
      </div>

      {/* Update Rewards Button */}
      <Button
        onClick={onUpdateRewards}
        disabled={isUpdatingRewards || !isPoolActive}
        variant="outline"
        className="w-full border-[#4a85ff]/30 text-[#4a85ff] hover:bg-[#4a85ff]/10 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl transition-all hover:scale-[1.02] font-medium disabled:opacity-50 disabled:hover:scale-100"
      >
        {isUpdatingRewards ? 'Updating...' : 'Update Rewards'}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={isDisabled}
            className="w-full bg-white text-black hover:bg-gray-100 py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] font-medium disabled:opacity-50 disabled:hover:scale-100"
          >
            {isClaiming 
              ? 'Claiming...' 
              : pendingRewards > 0 
                ? 'Claim Rewards' 
                : 'No Rewards to Claim'
            }
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Claim</DialogTitle>
            <DialogDescription className="text-gray-400">
              Claim {pendingRewards.toFixed(4)} xLABS rewards?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleClaim} disabled={isClaiming}>
              {isClaiming ? 'Claiming...' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}