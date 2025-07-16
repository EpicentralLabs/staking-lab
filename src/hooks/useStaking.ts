"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from '@/hooks/use-toast';
import { Connection, PublicKey } from '@solana/web3.js';
import { useAnchorWallet, useConnection, type AnchorWallet } from '@solana/wallet-adapter-react';
import type { StakingProgram } from '@/programs/staking_program/staking_program';
import idl from "@/programs/staking_program/staking_program.json";
import { AnchorProvider, setProvider, Program, BN } from '@coral-xyz/anchor';
import { LABS_TOKEN_MINT } from '@/lib/constants';
import { getAccount, getAssociatedTokenAddress, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, getTokenAccountsByOwner } from '@solana/spl-token';
export interface StakeData {
  stakedAmount: number;
  pendingRewards: number;
  totalRewardsEarned: number;
  lastUpdated: Date | null;
}

export interface PoolData {
  totalValueLocked: number;
  apy: number;
  isActive: boolean;
}

export interface StakingState {
  stakeData: StakeData;
  poolData: PoolData;
  userBalance: bigint;
  isLoading: boolean;
  isInitialized: boolean;
  hasStakeAccount: boolean;
}

export function useStaking() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { toast } = useToast();

  const [stakingState, setStakingState] = useState<StakingState>({
    stakeData: {
      stakedAmount: 0,
      pendingRewards: 0,
      totalRewardsEarned: 0,
      lastUpdated: null,
    },
    poolData: {
      totalValueLocked: 0,
      apy: 0,
      isActive: false,
    },
    userBalance: BigInt(0),
    isLoading: false,
    isInitialized: false,
    hasStakeAccount: false,
  });

  const [transactionStates, setTransactionStates] = useState({
    isStaking: false,
    isUnstaking: false,
    isClaiming: false,
    isUpdatingRewards: false,
  });

  // Fetch all staking data
  const fetchStakingData = useCallback(async () => {
    if (!connected || !publicKey) {
      setStakingState(prev => ({ ...prev, isInitialized: false }));
      return;
    }

    setStakingState(prev => ({ ...prev, isLoading: true }));

    try {
      // TODO (pen): Fetch user's stake account data
      // This should get: stakedAmount, pendingRewards, totalRewardsEarned, lastUpdated
      const stakeAccountData = await fetchUserStakeAccount(publicKey, connection, wallet);

      // TODO (pen): Fetch pool configuration and state
      // This should get: totalValueLocked, apy, isActive
      const poolConfigData = await fetchPoolData(connection, wallet);

      // TODO (pen): Fetch user's token balance
      // This should get the user's LABS token balance
      const userBalance = await fetchUserTokenBalance(publicKey, connection);

      setStakingState({
        stakeData: stakeAccountData || {
          stakedAmount: 0,
          pendingRewards: 0,
          totalRewardsEarned: 0,
          lastUpdated: null,
        },
        poolData: poolConfigData,
        userBalance,
        isLoading: false,
        isInitialized: true,
        hasStakeAccount: stakeAccountData !== null,
      });
    } catch (error) {
      console.error('Failed to fetch staking data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load staking data',
        variant: 'destructive',
      });
      setStakingState(prev => ({ ...prev, isLoading: false, hasStakeAccount: false }));
    }
  }, [connected, publicKey, toast]);

  // Update pending rewards
  const updatePendingRewards = useCallback(async () => {
    if (!connected || !publicKey) return;

    setTransactionStates(prev => ({ ...prev, isUpdatingRewards: true }));

    try {
      // TODO (pen): Send update pending rewards transaction
      // This should call the updatePendingRewards instruction
      await sendUpdatePendingRewardsTransaction(publicKey, connection, wallet);

      // Refresh data after updating rewards
      await fetchStakingData();

      toast({
        title: 'Success',
        description: 'Rewards updated successfully',
      });
    } catch (error) {
      console.error('Failed to update rewards:', error);
      toast({
        title: 'Error',
        description: 'Failed to update rewards',
        variant: 'destructive',
      });
    } finally {
      setTransactionStates(prev => ({ ...prev, isUpdatingRewards: false }));
    }
  }, [connected, publicKey, fetchStakingData, toast]);

  // Stake tokens
  const stakeTokens = useCallback(async (amount: bigint) => {
    if (!connected || !publicKey || amount <= 0n) return;

    setTransactionStates(prev => ({ ...prev, isStaking: true }));

    try {
      // TODO (pen): Send stake transaction
      // This should call the stakeToStakePool instruction with the specified amount
      const signature = await sendStakeTransaction(publicKey, amount, connection, wallet);

      toast({
        title: 'Stake Successful',
        description: `Transaction: ${signature}`,
      });

      // Refresh data after staking
      await fetchStakingData();
    } catch (error) {
      console.error('Stake failed:', error);
      
      // Enhanced error handling for transaction errors
      let errorMessage = 'Transaction failed';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check if it's a SendTransactionError and try to get logs
        if ('logs' in error && typeof error.logs === 'object' && Array.isArray(error.logs)) {
          console.error('Transaction logs:', error.logs);
          errorMessage = `Transaction failed: ${error.logs.join(', ')}`;
        }
      }
      
      toast({
        title: 'Stake Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setTransactionStates(prev => ({ ...prev, isStaking: false }));
    }
  }, [connected, publicKey, fetchStakingData, toast]);

  // Unstake tokens
  const unstakeTokens = useCallback(async (amount: bigint) => {
    if (!connected || !publicKey || amount <= 0n) return;

    setTransactionStates(prev => ({ ...prev, isUnstaking: true }));

    try {
      // Update rewards before unstaking
      await updatePendingRewards();

      // TODO (pen): Send unstake transaction
      // This should call the unstakeFromStakePool instruction with the specified amount
      const signature = await sendUnstakeTransaction();

      toast({
        title: 'Unstake Successful',
        description: `Transaction: ${signature}`,
      });

      // Refresh data after unstaking
      await fetchStakingData();
    } catch (error) {
      console.error('Unstake failed:', error);
      toast({
        title: 'Unstake Failed',
        description: error instanceof Error ? error.message : 'Transaction failed',
        variant: 'destructive',
      });
    } finally {
      setTransactionStates(prev => ({ ...prev, isUnstaking: false }));
    }
  }, [connected, publicKey, updatePendingRewards, fetchStakingData, toast]);

  // Claim rewards
  const claimRewards = useCallback(async () => {
    if (!connected || !publicKey || stakingState.stakeData.pendingRewards <= 0) return;

    setTransactionStates(prev => ({ ...prev, isClaiming: true }));

    try {
      // TODO (pen): Send claim rewards transaction
      // This should call the claimRewards instruction
      const signature = await sendClaimRewardsTransaction();

      toast({
        title: 'Rewards Claimed',
        description: `Transaction: ${signature}`,
      });

      // Refresh data after claiming
      await fetchStakingData();
    } catch (error) {
      console.error('Claim failed:', error);
      toast({
        title: 'Claim Failed',
        description: error instanceof Error ? error.message : 'Transaction failed',
        variant: 'destructive',
      });
    } finally {
      setTransactionStates(prev => ({ ...prev, isClaiming: false }));
    }
  }, [connected, publicKey, stakingState.stakeData.pendingRewards, fetchStakingData, toast]);

  // Initialize data on wallet connection and page load
  useEffect(() => {
    fetchStakingData();
  }, [fetchStakingData]);

  // Auto-update rewards every time the component mounts (page load)
  useEffect(() => {
    if (connected && publicKey && stakingState.isInitialized) {
      updatePendingRewards();
    }
  }, [connected, publicKey, stakingState.isInitialized, updatePendingRewards]);

  return {
    // State
    ...stakingState,
    ...transactionStates,

    // Actions
    stakeTokens,
    unstakeTokens,
    claimRewards,
    updatePendingRewards,
    refreshData: fetchStakingData,
  };
}

// TODO (pen): Implement these Solana interaction functions
async function fetchUserStakeAccount(userPublicKey: PublicKey, connection: Connection, wallet: AnchorWallet | undefined): Promise<StakeData | null> {
  if (wallet === undefined) {
    throw new Error("Wallet not connected!")
  }
  const provider = new AnchorProvider(connection, wallet, {});
  setProvider(provider);
  const program = new Program<StakingProgram>(idl as StakingProgram, { connection })
  const [stakePoolPda] = await PublicKey.findProgramAddressSync([Buffer.from("stake_pool")], program.programId)
  const seeds = [Buffer.from("stake_account"), stakePoolPda.toBuffer(), userPublicKey.toBuffer()]
  const [userStakeAccountPda] = await PublicKey.findProgramAddressSync(seeds, program.programId)

  try {
    const stakeAccount = await program.account.stakeAccount.fetch(userStakeAccountPda)
    // Return: { stakedAmount, pendingRewards, totalRewardsEarned, lastUpdated }
    return {
      stakedAmount: Number(stakeAccount.stakedAmount?.toString(10) ?? 0),
      pendingRewards: Number(stakeAccount.pendingRewards?.toString(10) ?? 0),
      totalRewardsEarned: Number(stakeAccount.rewardsEarned?.toString(10) ?? 0),
      lastUpdated: stakeAccount.lastUpdated ? new Date(Number(stakeAccount.lastUpdated) * 1000) : null,
    }
  } catch {
    // Return null if stake account doesn't exist
    return null;
  }
}

async function fetchPoolData(connection: Connection, wallet: AnchorWallet | undefined): Promise<PoolData> {
  if (wallet === undefined) {
    throw new Error("Wallet not connected!")
  }
  const program = new Program<StakingProgram>(idl as StakingProgram, { connection });

  // Get all stake accounts for this pool
  const stakeAccounts = await program.account.stakeAccount.all();

  // Sum all staked amounts
  const totalValueLocked = stakeAccounts.reduce((total, account) => {
    return total + Number(account.account.stakedAmount?.toString(10) ?? 0);
  }, 0);

  // Get pool config for APY and status
  const [stakePoolConfigPda] = await PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId
  );
  const poolConfig = await program.account.stakePoolConfig.fetch(stakePoolConfigPda);

  return {
    totalValueLocked,
    apy: Number(poolConfig.apy ?? 0),
    isActive: true, // Pool is always active for now
  };
}

async function fetchUserTokenBalance(userPublicKey: PublicKey, connection: Connection): Promise<bigint> {
  // Fetch user's LABS token balance
  const tokenAddress = new PublicKey(LABS_TOKEN_MINT)
  const tokenAccountAddress = await getAssociatedTokenAddress(tokenAddress, userPublicKey)

  try {
    const tokenAccount = await getAccount(connection, tokenAccountAddress)
    return tokenAccount.amount
  } catch {
    // Token account doesn't exist, return 0 balance
    return BigInt(0);
  }
}

async function sendUpdatePendingRewardsTransaction(userPublicKey: PublicKey, connection: Connection, wallet: AnchorWallet | undefined): Promise<string> {
  if (wallet === undefined) {
    throw new Error("Wallet not connected!")
  }
  const provider = new AnchorProvider(connection, wallet, {});
  setProvider(provider);
  const program = new Program<StakingProgram>(idl as StakingProgram, provider)
  // You must provide the correct accounts for updatePendingRewards
  // Replace the following object keys/values with the actual required accounts for your program
  const txSig = await program
    .methods
    .updatePendingRewards()
    .accounts({
      signer: userPublicKey,
    })
    .signers([])
    .rpc()

  return txSig;
}

async function sendStakeTransaction(userPublicKey: PublicKey, amount: bigint, connection: Connection, wallet: AnchorWallet | undefined): Promise<string> {
  if (wallet === undefined) {
    throw new Error("Wallet not connected!")
  }
  const provider = new AnchorProvider(connection, wallet, {});
  setProvider(provider);
  const program = new Program<StakingProgram>(idl as StakingProgram, provider)
  const [stakePoolPda] = await PublicKey.findProgramAddressSync([Buffer.from("stake_pool")], program.programId)
  const tokenMint = new PublicKey(LABS_TOKEN_MINT)
  const userTokenAccount = getAssociatedTokenAddressSync(tokenMint, userPublicKey)
  const [vault] = await PublicKey.findProgramAddressSync([Buffer.from("vault"), stakePoolPda.toBuffer()], program.programId)
  
  console.log('Staking transaction details:');
  console.log('- Token mint:', tokenMint.toString());
  console.log('- User token account:', userTokenAccount.toString());
  console.log('- Vault:', vault.toString());
  console.log('- Stake pool PDA:', stakePoolPda.toString());
  console.log('- Amount:', amount.toString());
  
  // Debug: Check all user's token accounts
  try {
    const allTokenAccounts = await getTokenAccountsByOwner(connection, userPublicKey, {
      programId: TOKEN_PROGRAM_ID
    });
    console.log('User has', allTokenAccounts.value.length, 'token accounts:');
    for (const account of allTokenAccounts.value) {
      try {
        const tokenAccount = await getAccount(connection, account.pubkey);
        console.log(`- Account: ${account.pubkey.toString()}, Mint: ${tokenAccount.mint.toString()}, Balance: ${tokenAccount.amount.toString()}`);
      } catch (e) {
        console.log(`- Account: ${account.pubkey.toString()}, Error reading: ${e}`);
      }
    }
  } catch (error) {
    console.log('Error getting user token accounts:', error);
  }

  // Check if user's token account exists, create if it doesn't
  let userTokenAccountExists = true;
  let existingTokenAccount = null;
  try {
    existingTokenAccount = await getAccount(connection, userTokenAccount);
    console.log('Existing token account found:');
    console.log('- Address:', userTokenAccount.toString());
    console.log('- Mint:', existingTokenAccount.mint.toString());
    console.log('- Balance:', existingTokenAccount.amount.toString());
    
    // Verify the mint matches what we expect
    if (!existingTokenAccount.mint.equals(tokenMint)) {
      throw new Error(`Token account mint mismatch. Expected: ${tokenMint.toString()}, Found: ${existingTokenAccount.mint.toString()}`);
    }
  } catch (error) {
    console.log('Token account does not exist or error:', error);
    userTokenAccountExists = false;
  }

  // Check if vault exists and its mint
  try {
    const vaultAccount = await getAccount(connection, vault);
    console.log('Vault account found:');
    console.log('- Address:', vault.toString());
    console.log('- Mint:', vaultAccount.mint.toString());
    console.log('- Balance:', vaultAccount.amount.toString());
    
    // Verify the vault mint matches what we expect
    if (!vaultAccount.mint.equals(tokenMint)) {
      throw new Error(`Vault mint mismatch. Expected: ${tokenMint.toString()}, Found: ${vaultAccount.mint.toString()}`);
    }
  } catch (error) {
    console.log('Vault account check error:', error);
    // This might be expected if vault doesn't exist yet
  }

  // The stake account and config PDAs will be resolved automatically by the program

  // Build the transaction with pre-instructions if needed
  const preInstructions = [];

  // Add instruction to create user's token account if it doesn't exist
  if (!userTokenAccountExists) {
    preInstructions.push(
      createAssociatedTokenAccountInstruction(
        userPublicKey, // payer
        userTokenAccount, // associatedToken
        userPublicKey, // owner
        tokenMint // mint
      )
    );
  }
  
  const txSig = await program
    .methods
    .stakeToStakePool(new BN(amount.toString()))
    .accounts({
      signer: userPublicKey,
      userTokenAccount: userTokenAccount,
      vault: vault,
      tokenMint: tokenMint,
      tokenProgram: TOKEN_PROGRAM_ID
    })
    .preInstructions(preInstructions)
    .signers([])
    .rpc()

  return txSig;
}

async function sendUnstakeTransaction(): Promise<string> {
  // Send unstakeFromStakePool instruction
  throw new Error('sendUnstakeTransaction not implemented');
}

async function sendClaimRewardsTransaction(): Promise<string> {
  // Send claimRewards instruction
  throw new Error('sendClaimRewardsTransaction not implemented');
}