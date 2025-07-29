# Solana Integration Guide

This document provides detailed specifications for implementing the Solana blockchain interactions in the `useStaking.ts` hook. All functions marked with `//TODO (pen):` need to be implemented to connect the frontend to the Solana staking program.

## Overview

The staking interface is designed with complete separation between UI and blockchain logic. All Solana interactions are abstracted into 7 key functions that handle:
- Data fetching (user accounts, pool state, balances)
- Transaction sending (stake, unstake, claim, update rewards)

## Function Specifications

### 1. `fetchUserStakeAccount(userPublicKey): Promise<StakeData>`

**Purpose**: Retrieves the user's staking account data from the blockchain.

**Parameters**:
- `userPublicKey: PublicKey` - The user's wallet public key

**Returns**: `Promise<StakeData>`
```typescript
interface StakeData {
  stakedAmount: number;        // Amount of LABS tokens currently staked
  pendingRewards: number;      // xLABS rewards available to claim
  totalRewardsEarned: number;  // Lifetime xLABS rewards earned
  lastUpdated: Date | null;    // When rewards were last calculated
}
```

**Implementation Notes**:
- Fetch the user's stake account PDA using seeds: `["stake_account", stakePool, userPublicKey]`
- Parse the account data according to the `StakeAccount` struct from the IDL
- Convert lamports to token amounts (divide by 1e9 for LABS, appropriate decimals for xLABS)
- Handle case where stake account doesn't exist (return zeros)
- Convert Unix timestamp to JavaScript Date object

**Error Handling**:
- Return zero values if account doesn't exist
- Throw descriptive error for network/RPC issues
- Throw error for invalid account data

### 2. `fetchPoolData(): Promise<PoolData>`

**Purpose**: Retrieves staking pool configuration and current state.

**Returns**: `Promise<PoolData>`
```typescript
interface PoolData {
  totalValueLocked: number;  // Total LABS tokens staked in the pool
  apy: number;              // Annual percentage yield from config
  isActive: boolean;        // Whether the pool is accepting new stakes
}
```

**Implementation Notes**:
- Fetch stake pool PDA using seeds: `["stake_pool"]`
- Fetch stake pool config PDA using seeds: `["config"]`
- Get vault account to calculate total value locked
- Parse APY from config (convert from program format to percentage)
- Determine if pool is active (config exists and has valid data)

**Error Handling**:
- Return `isActive: false` if pool/config accounts don't exist
- Throw error for network issues
- Default to 0 for missing numeric values

### 3. `fetchUserTokenBalance(userPublicKey): Promise<number>`

**Purpose**: Gets the user's LABS token balance from their associated token account.

**Parameters**:
- `userPublicKey: PublicKey` - The user's wallet public key

**Returns**: `Promise<number>` - LABS token balance

**Implementation Notes**:
- Calculate user's associated token account address for LABS mint
- Fetch the token account and parse balance
- Convert from lamports to token amount (divide by 1e9)
- Handle case where token account doesn't exist (return 0)

**Error Handling**:
- Return 0 if token account doesn't exist
- Throw error for network issues
- Throw error for invalid token account data

### 4. `sendUpdatePendingRewardsTransaction(userPublicKey): Promise<string>`

**Purpose**: Sends a transaction to update the user's pending rewards calculation.

**Parameters**:
- `userPublicKey: PublicKey` - The user's wallet public key

**Returns**: `Promise<string>` - Transaction signature

**Implementation Notes**:
- Build `updatePendingRewards` instruction with required accounts:
  - `signer`: userPublicKey
  - `stakePool`: PDA with seeds `["stake_pool"]`
  - `stakeAccount`: PDA with seeds `["stake_account", stakePool, userPublicKey]`
  - `stakePoolConfig`: PDA with seeds `["config"]`
- Create and send versioned transaction
- Wait for confirmation

**Error Handling**:
- Throw error with transaction details if transaction fails
- Handle case where stake account doesn't exist
- Provide clear error messages for common failures

### 5. `sendStakeTransaction(userPublicKey, amount): Promise<string>`

**Purpose**: Sends a transaction to stake LABS tokens.

**Parameters**:
- `userPublicKey: PublicKey` - The user's wallet public key
- `amount: number` - Amount of LABS tokens to stake

**Returns**: `Promise<string>` - Transaction signature

**Implementation Notes**:
- Convert amount to lamports (multiply by 1e9)
- Build `stakeToStakePool` instruction with required accounts:
  - `signer`: userPublicKey
  - `stakePool`: PDA with seeds `["stake_pool"]`
  - `stakePoolConfig`: PDA with seeds `["config"]`
  - `stakeAccount`: PDA with seeds `["stake_account", stakePool, userPublicKey]`
  - `userTokenAccount`: Associated token account for LABS
  - `vault`: PDA with seeds `["vault", stakePool]`
  - `tokenMint`: LABS token mint address
  - `tokenProgram`: TOKEN_PROGRAM_ID
  - `systemProgram`: SystemProgram.programId
- Check if user's associated token account exists, create if needed
- Include amount as instruction argument
- Send and confirm transaction

**Error Handling**:
- Validate amount is positive and not greater than balance
- Handle insufficient balance errors gracefully
- Provide clear error messages for transaction failures

### 6. `sendUnstakeTransaction(userPublicKey, amount): Promise<string>`

**Purpose**: Sends a transaction to unstake LABS tokens.

**Parameters**:
- `userPublicKey: PublicKey` - The user's wallet public key
- `amount: number` - Amount of LABS tokens to unstake

**Returns**: `Promise<string>` - Transaction signature

**Implementation Notes**:
- Convert amount to lamports (multiply by 1e9)
- Build `unstakeFromStakePool` instruction with required accounts:
  - `signer`: userPublicKey
  - `stakePool`: PDA with seeds `["stake_pool"]`
  - `stakePoolConfig`: PDA with seeds `["config"]`
  - `stakeAccount`: PDA with seeds `["stake_account", stakePool, userPublicKey]`
  - `userTokenAccount`: Associated token account for LABS
  - `vault`: PDA with seeds `["vault", stakePool]`
  - `vaultAuthority`: PDA with seeds `["vault_authority", stakePool]`
  - `tokenMint`: LABS token mint address
  - `tokenProgram`: TOKEN_PROGRAM_ID
  - `systemProgram`: SystemProgram.programId
- Include amount as instruction argument
- Send and confirm transaction

**Error Handling**:
- Validate amount is positive and not greater than staked amount
- Handle insufficient stake errors
- Provide clear error messages for transaction failures

### 7. `sendClaimRewardsTransaction(userPublicKey): Promise<string>`

**Purpose**: Sends a transaction to claim pending xLABS rewards.

**Parameters**:
- `userPublicKey: PublicKey` - The user's wallet public key

**Returns**: `Promise<string>` - Transaction signature

**Implementation Notes**:
- Build `claimRewards` instruction with required accounts:
  - `signer`: userPublicKey
  - `stakePool`: PDA with seeds `["stake_pool"]`
  - `stakePoolConfig`: PDA with seeds `["config"]`
  - `stakeAccount`: PDA with seeds `["stake_account", stakePool, userPublicKey]`
  - `mintAuthority`: PDA with seeds `["mint_authority"]`
  - `rewardMint`: xLABS token mint address
  - `userRewardAccount`: Associated token account for xLABS
  - `tokenProgram`: TOKEN_PROGRAM_ID
  - `systemProgram`: SystemProgram.programId
- Check if user's xLABS associated token account exists, create if needed
- Send and confirm transaction

**Error Handling**:
- Handle case where no rewards are available
- Validate reward mint exists
- Provide clear error messages for transaction failures

## Common Implementation Patterns

### PDA Calculation
```typescript
import { PublicKey } from '@solana/web3.js';

function findProgramAddress(seeds: (Buffer | Uint8Array)[], programId: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(seeds, programId);
  return pda;
}

// Example usage:
const stakePool = findProgramAddress([Buffer.from("stake_pool")], programId);
```

### Associated Token Account
```typescript
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

const userTokenAccount = getAssociatedTokenAddressSync(
  tokenMint,
  userPublicKey
);
```

### Transaction Building
```typescript
import { 
  TransactionMessage, 
  VersionedTransaction,
  SystemProgram 
} from '@solana/web3.js';

// Build instruction
const instruction = await program.methods
  .instructionName(args)
  .accounts({ /* accounts */ })
  .instruction();

// Create transaction
const { blockhash } = await connection.getLatestBlockhash();
const message = new TransactionMessage({
  payerKey: userPublicKey,
  recentBlockhash: blockhash,
  instructions: [instruction]
}).compileToV0Message();

const transaction = new VersionedTransaction(message);
```

## Error Categories

### Network Errors
- RPC connection issues
- Transaction timeout
- Blockhash expiration

### Account Errors
- Account not found
- Invalid account data
- Insufficient balance

### Program Errors
- Custom program errors (see IDL error codes)
- Invalid instruction data
- Account constraint violations

### User Errors
- Wallet not connected
- Transaction rejected by user
- Insufficient SOL for fees

## Testing Strategy

### Unit Tests
- Mock RPC responses for each function
- Test error handling paths
- Validate data transformations

### Integration Tests
- Test against local validator
- Verify PDA calculations
- Test transaction building

### Error Simulation
- Network disconnection
- Invalid account states
- Program error conditions

## Configuration

### Environment Variables
```bash
NEXT_PUBLIC_SOLANA_CLUSTER=devnet  # or localnet, mainnet-beta
```

### Constants Usage
```typescript
import { 
  STAKING_PROGRAM_ID,
  LABS_TOKEN_MINT,
  XLABS_TOKEN_MINT,
  rpc 
} from '@/lib/constants';
```

### Program Setup
```typescript
import { Program } from '@coral-xyz/anchor';
import { StakingProgram } from '@/programs/staking_program/staking_program';
import idl from '@/programs/staking_program/staking_program.json';

const program = new Program<StakingProgram>(
  idl as StakingProgram,
  { connection: rpc }
);
```

## Performance Considerations

### Caching
- Cache PDA calculations
- Reuse connection instances
- Batch RPC calls where possible

### Error Recovery
- Implement retry logic for network issues
- Graceful degradation for account fetch failures
- User-friendly error messages

### Transaction Optimization
- Use versioned transactions for lower fees
- Batch multiple instructions when possible
- Implement proper confirmation strategies

## Security Notes

### Validation
- Always validate user inputs
- Check account ownership
- Verify program addresses

### Error Information
- Don't expose sensitive program details in errors
- Log errors for debugging but show user-friendly messages
- Validate all RPC responses before processing