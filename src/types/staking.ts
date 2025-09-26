// Type definitions for staking-related data structures

import type { Address } from 'gill'

// Token account structure from gill/programs
export interface TokenAccount {
  address: Address
  data: {
    amount: bigint
    delegate?: Address
    owner: Address
    state: number
    delegatedAmount?: bigint
    closeAuthority?: Address
  }
}

// Stake account structure from program-client
export interface StakeAccountData {
  discriminator: Uint8Array
  user: Address
  stakePool: Address
  stakedAmount: bigint
  pendingRewards: bigint
  interestIndexAtDeposit: bigint
  bump: number
}

export interface StakeAccount {
  address: Address
  data: StakeAccountData
}

export interface MaybeStakeAccount {
  exists: boolean
  address: Address
  data?: StakeAccountData
}

// Stake pool structure from program-client
export interface StakePoolData {
  discriminator: Uint8Array
  vault: Address
  config: Address
  interestIndex: bigint
  interestIndexLastUpdated: bigint
  bump: number
}

export interface StakePool {
  address: Address
  data: StakePoolData
}

// Stake pool config structure from program-client
export interface StakePoolConfigData {
  discriminator: Uint8Array
  stakeMint: Address
  rewardMint: Address
  aprBps: bigint
  bump: number
}

export interface StakePoolConfig {
  address: Address
  data: StakePoolConfigData
}

// Query data types (what our queries return)
export interface UserLabsAccountQueryData {
  data: {
    amount: bigint
  } | null
}

export interface UserStakeAccountQueryData {
  exists: boolean
  data?: {
    stakedAmount: bigint
    rewardsEarned: bigint
    lastUpdateSlot: bigint
    pendingRewards?: bigint
    interestIndexAtDeposit?: bigint
  }
}

export interface VaultAccountQueryData {
  data: {
    amount: bigint
  } | null
}

export interface UserXLabsAccountQueryData {
  data: {
    amount: bigint
  } | null
}

export interface StakePoolConfigQueryData {
  data: {
    aprBps: bigint
    stakeMint: Address
    rewardMint: Address
  } | null
}

// Context types for mutations
export interface MutationContext {
  previousLabsAccount?: UserLabsAccountQueryData
  previousStakeAccount?: UserStakeAccountQueryData
  previousVaultAccount?: VaultAccountQueryData
  previousXLabsAccount?: UserXLabsAccountQueryData
  toast?: {
    start: () => void
    success: (tx: string, message: string) => void
    error: (message: string) => void
  }
  claimedAmount?: bigint
}
