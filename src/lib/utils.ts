import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { STAKE_APY } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to calculate xLABS accumulation
export const calculateXLABSAccumulation = (
  stakedAmount: number,
  daysStaked: number
): number => {
  const dailyRate = STAKE_APY / 100 / 365; // Convert APY to daily rate
  const accumulatedXLABS = stakedAmount * (1 + dailyRate) ** daysStaked - stakedAmount;
  return accumulatedXLABS;
};
