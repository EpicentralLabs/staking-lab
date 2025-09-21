import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { SolanaClusterId } from '@wallet-ui/react'
import {
  STAKING_PROGRAM_PROGRAM_ADDRESS
} from '@program-client'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ellipsify(str = '', len = 4, delimiter = '..') {
  const strLen = str.length
  const limit = len * 2 + delimiter.length

  return strLen >= limit ? str.substring(0, len) + delimiter + str.substring(strLen - len, strLen) : str
}

export function getStakingProgramProgramId(cluster: SolanaClusterId) {
  switch (cluster) {
    case 'solana:devnet':
    case 'solana:testnet':
    case 'solana:mainnet':
    default:
      return STAKING_PROGRAM_PROGRAM_ADDRESS
  }
}

