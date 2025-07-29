"use client";

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface StakeSectionProps {
  userBalance: bigint;
  isStaking: boolean;
  isPoolActive: boolean;
  onStake: (amount: bigint) => void;
}

export function StakeSection({ userBalance, isStaking, isPoolActive, onStake }: StakeSectionProps) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAmountChange = (value: string) => {
    const rawValue = value.replace(/,/g, '');
    if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
      setStakeAmount(rawValue);
    }
  };

  const handleMaxClick = () => {
    setStakeAmount((Number(userBalance) / 1e6).toString());
  };

  const handleStake = () => {
    const amount = BigInt(Math.floor(Number(stakeAmount) * 1e6));
    if (amount > 0n) {
      onStake(amount);
      setStakeAmount('');
      setIsDialogOpen(false);
    }
  };

  const isValidAmount = stakeAmount && Number(stakeAmount) > 0 && BigInt(Math.floor(Number(stakeAmount) * 1e6)) <= userBalance;
  const isDisabled = !isValidAmount || isStaking || !isPoolActive;

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
        <div className="p-2 bg-[#4a85ff]/20 rounded-lg">
          <ArrowUpRight className="w-5 h-5 text-[#4a85ff]" />
        </div>
        <h3 className="text-base sm:text-xl font-medium text-white">Stake Tokens</h3>
      </div>

      <div className="space-y-1 sm:space-y-4">
        <Label htmlFor="stake-amount" className="text-gray-300 font-medium text-xs sm:text-base">
          Amount to Stake
        </Label>
        <div className="relative">
          <Input
            id="stake-amount"
            type="text"
            autoComplete="off"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            placeholder="0.00"
            value={stakeAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="bg-gray-800/30 border-gray-600/40 text-white placeholder-gray-500 pr-16 py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl backdrop-blur-xl w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm font-medium">
            LABS
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span
            className="text-gray-400 hover:text-[#4a85ff] transition-colors cursor-pointer underline"
            onClick={handleMaxClick}
          >
            Available: {(Number(userBalance) / 1e6).toFixed(2)} LABS
          </span>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={isDisabled}
            className="w-full bg-[#4a85ff] hover:bg-[#3a75ef] text-white py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] disabled:opacity-50 disabled:hover:scale-100 font-medium"
          >
            {isStaking ? 'Staking...' : 'Stake LABS'}
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Stake</DialogTitle>
            <DialogDescription className="text-gray-400">
              Stake {stakeAmount} LABS to earn xLABS rewards?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStake} disabled={isStaking}>
              {isStaking ? 'Staking...' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}