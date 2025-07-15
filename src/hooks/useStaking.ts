"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from '@/hooks/use-toast';
import { Connection, PublicKey } from '@solana/web3.js';
import { useAnchorWallet, useConnection, type AnchorWallet } from '@solana/wallet-adapter-react';
import type { StakingProgram } from '@/programs/staking_program/staking_program';
import idl from "@/programs/staking_program/staking_program.json";
import { AnchorProvider, setProvider, Program } from '@coral-xyz/anchor';
import { LABS_TOKEN_MINT } from '@/lib/constants';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
export interface StakeData {
  stakedAmount: number;
  pendingRewards: number;
  totalRewardsEarned: number;
  lastUpdated: Date | null;
}

export interface PoolData {
  totalValueLocked: number;
  apy: number;
}

export interface StakingState {
  stakeData: StakeData;
  poolData: PoolData;
  userBalance: BigInt;
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
      const userBalance = await fetchUserTokenBalance(publicKey, connection, wallet);

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
      toast({
        title: 'Stake Failed',
        description: error instanceof Error ? error.message : 'Transaction failed',
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
      const signature = await sendUnstakeTransaction(publicKey, amount, connection, wallet);

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
      const signature = await sendClaimRewardsTransaction(publicKey, connection, wallet);

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
  const [stakePoolPda, stakePoolBump] = await PublicKey.findProgramAddressSync([Buffer.from("stake_pool")], program.programId)
  const seeds = [Buffer.from("stake_account"), stakePoolPda.toBuffer(), userPublicKey.toBuffer()]
  const [userStakeAccountPda, userStakeAccountBump] = await PublicKey.findProgramAddressSync(seeds, program.programId)

  try {
    const stakeAccount = await program.account.stakeAccount.fetch(userStakeAccountPda)
    // Return: { stakedAmount, pendingRewards, totalRewardsEarned, lastUpdated }
    return {
      stakedAmount: Number(stakeAccount.stakedAmount?.toString(10) ?? 0),
      pendingRewards: Number(stakeAccount.pendingRewards?.toString(10) ?? 0),
      totalRewardsEarned: Number(stakeAccount.rewardsEarned?.toString(10) ?? 0),
      lastUpdated: stakeAccount.lastUpdated ? new Date(Number(stakeAccount.lastUpdated) * 1000) : null,
    }
  } catch (error) {
    // Return null if stake account doesn't exist
    return null;
  }
}

async function fetchPoolData(connection: Connection, wallet: AnchorWallet | undefined): Promise<PoolData> {
  if (wallet === undefined) {
    throw new Error("Wallet not connected!")
  }
  const provider = new AnchorProvider(connection, wallet, {});
  const program = new Program<StakingProgram>(idl as StakingProgram, { connection });

  // Get all stake accounts for this pool
  const stakeAccounts = await program.account.stakeAccount.all();

  // Sum all staked amounts
  const totalValueLocked = stakeAccounts.reduce((total, account) => {
    return total + Number(account.account.stakedAmount?.toString(10) ?? 0);
  }, 0);

  // Get pool config for APY and status
  const [stakePoolConfigPda, bump] = await PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId
  );
  const poolConfig = await program.account.stakePoolConfig.fetch(stakePoolConfigPda);

  return {
    totalValueLocked,
    apy: Number(poolConfig.apy ?? 0),
  };
}

async function fetchUserTokenBalance(userPublicKey: PublicKey, connection: Connection, wallet: AnchorWallet | undefined): Promise<BigInt> {
  // Fetch user's LABS token balance
  userPublicKey; connection; wallet; // TODO (pen): Remove these when implementing
  const tokenAddress = new PublicKey(LABS_TOKEN_MINT)
  const tokenAccountAddress = await getAssociatedTokenAddress(tokenAddress, userPublicKey)
  const tokenAccount = await getAccount(connection, tokenAccountAddress)
  return tokenAccount.amount
}

async function sendUpdatePendingRewardsTransaction(userPublicKey: PublicKey, connection: Connection, wallet: AnchorWallet | undefined): Promise<string> {
  // Send updatePendingRewards instruction
  userPublicKey; connection; wallet; // TODO (pen): Remove these when implementing
  throw new Error('sendUpdatePendingRewardsTransaction not implemented');
}

async function sendStakeTransaction(userPublicKey: PublicKey, amount: bigint, connection: Connection, wallet: AnchorWallet | undefined): Promise<string> {
  // Send stakeToStakePool instruction
  userPublicKey; amount; connection; wallet; // TODO (pen): Remove these when implementing
  throw new Error('sendStakeTransaction not implemented');
}

async function sendUnstakeTransaction(userPublicKey: PublicKey, amount: bigint, connection: Connection, wallet: AnchorWallet | undefined): Promise<string> {
  // Send unstakeFromStakePool instruction
  userPublicKey; amount; connection; wallet; // TODO (pen): Remove these when implementing
  throw new Error('sendUnstakeTransaction not implemented');
}

async function sendClaimRewardsTransaction(userPublicKey: PublicKey, connection: Connection, wallet: AnchorWallet | undefined): Promise<string> {
  // Send claimRewards instruction
  userPublicKey; connection; wallet; // TODO (pen): Remove these when implementing
  throw new Error('sendClaimRewardsTransaction not implemented');
}