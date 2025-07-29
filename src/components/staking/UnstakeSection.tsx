"use client";

import { useState } from 'react';
import { ArrowDownRight } from 'lucide-react';
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

interface UnstakeSectionProps {
  stakedAmount: number;
  isUnstaking: boolean;
  isPoolActive: boolean;
  onUnstake: (amount: bigint) => void;
}

export function UnstakeSection({ stakedAmount, isUnstaking, isPoolActive, onUnstake }: UnstakeSectionProps) {
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAmountChange = (value: string) => {
    const rawValue = value.replace(/,/g, '');
    if (rawValue === '' || /^(?:\d+\.?\d*|\.\d+)$/.test(rawValue)) {
      setUnstakeAmount(rawValue);
    }
  };

  const handleMaxClick = () => {
    setUnstakeAmount(stakedAmount.toString());
  };

  const handleUnstake = () => {
    // Convert to fixed decimal string to avoid floating point precision issues
    const decimalAmount = parseFloat(unstakeAmount).toFixed(6);
    const amount = BigInt(Math.round(parseFloat(decimalAmount) * 1e6));
    if (amount > 0n) {
      onUnstake(amount);
      setUnstakeAmount('');
      setIsDialogOpen(false);
    }
  };

  const isValidAmount = unstakeAmount && Number(unstakeAmount) > 0 && Number(unstakeAmount) <= stakedAmount;
  const isDisabled = !isValidAmount || isUnstaking || !isPoolActive;

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
        <div className="p-2 bg-orange-400/20 rounded-lg">
          <ArrowDownRight className="w-5 h-5 text-orange-400" />
        </div>
        <h3 className="text-base sm:text-xl font-medium text-white">Unstake Tokens</h3>
      </div>

      <div className="space-y-1 sm:space-y-4">
        <Label htmlFor="unstake-amount" className="text-gray-300 font-medium text-xs sm:text-base">
          Amount to Unstake
        </Label>
        <div className="relative">
          <Input
            id="unstake-amount"
            type="text"
            autoComplete="off"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            placeholder="0.00"
            value={unstakeAmount}
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
            Staked: {stakedAmount.toFixed(2)} LABS
          </span>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={isDisabled}
            className="w-full bg-white text-black hover:bg-gray-200 py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 font-medium"
          >
            {isUnstaking ? 'Unstaking...' : 'Unstake LABS'}
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Unstake</DialogTitle>
            <DialogDescription className="text-gray-400">
              Unstake {unstakeAmount} LABS? This will also update your pending rewards.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUnstake} disabled={isUnstaking}>
              {isUnstaking ? 'Unstaking...' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}