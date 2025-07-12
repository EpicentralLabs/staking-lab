import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BN } from "@coral-xyz/anchor"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to calculate xLABS accumulation
export const calculateXLABSAccumulation = (
  stakedAmount: number,
  daysStaked: number,
  apyPercentage: number
): number => {
  const dailyRate = apyPercentage / 100 / 365; // Convert APY to daily rate
  const accumulatedXLABS = stakedAmount * (1 + dailyRate) ** daysStaked - stakedAmount;
  return accumulatedXLABS;
};

// Utility function to safely convert token amount to lamports
export const tokenAmountToLamports = (amount: number): BN => {
  // Validate amount is reasonable (not too large)
  if (amount > Number.MAX_SAFE_INTEGER / 1e9) {
    throw new Error("Amount too large")
  }
  
  if (amount < 0) {
    throw new Error("Amount cannot be negative")
  }
  
  // Convert to lamports using string to avoid floating point issues
  const amountStr = amount.toFixed(9) // Ensure 9 decimal places
  const [intPart, decPart = ''] = amountStr.split('.')
  const paddedDecPart = decPart.padEnd(9, '0').slice(0, 9) // Ensure exactly 9 digits
  const lamportsStr = intPart + paddedDecPart
  return new BN(lamportsStr)
};
