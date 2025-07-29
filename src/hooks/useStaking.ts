"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from '@/hooks/use-toast';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { useAnchorWallet, useConnection, type AnchorWallet } from '@solana/wallet-adapter-react';
import type { StakingProgram } from '@/programs/staking_program/staking_program';
import idl from "@/programs/staking_program/staking_program.json";
import { AnchorProvider, setProvider, Program, BN } from '@coral-xyz/anchor';
import { LABS_TOKEN_MINT, STAKING_PROGRAM_ID, ADMIN_PANEL_ACCESS_ADDRESS } from '@/lib/constants';
import { getAccount, getAssociatedTokenAddress, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, getMint } from '@solana/spl-token';
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

export interface InitializationStatus {
  isInitialized: boolean;
  missingComponents: string[];
  canAutoInitialize: boolean;
}

export interface StakingState {
  stakeData: StakeData;
  poolData: PoolData;
  userBalance: bigint;
  isLoading: boolean;
  isInitialized: boolean;
  hasStakeAccount: boolean;
  initializationStatus: InitializationStatus;
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
    initializationStatus: {
      isInitialized: false,
      missingComponents: [],
      canAutoInitialize: false,
    },
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

      // Check pool initialization status using both methods for comparison
      let initStatus: InitializationStatus;
      try {
        initStatus = await checkStakePoolInitialization(connection, wallet);
        console.log('🔍 Wallet-based initialization check result:', initStatus);
      } catch (walletError) {
        console.log('⚠️  Wallet-based check failed, trying read-only approach:', walletError);
        try {
          initStatus = await checkStakePoolInitializationReadOnly(connection);
          console.log('🔍 Read-only initialization check result:', initStatus);
          // Update admin privileges check
          const userPublicKey = wallet?.publicKey;
          initStatus.canAutoInitialize = userPublicKey ? ADMIN_PANEL_ACCESS_ADDRESS.includes(userPublicKey.toString()) : false;
        } catch (readOnlyError) {
          console.error('❌ Both initialization checks failed:', { walletError, readOnlyError });
          initStatus = {
            isInitialized: false,
            missingComponents: ['Failed to check initialization status'],
            canAutoInitialize: false,
          };
        }
      }

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
        isInitialized: initStatus.isInitialized,
        hasStakeAccount: stakeAccountData !== null,
        initializationStatus: initStatus,
      });
    } catch (error) {
      console.error('Failed to fetch staking data:', error);

      let errorMessage = 'Failed to load staking data';

      if (error instanceof Error) {
        if (error.message.includes('Cannot stake: Missing required components') ||
          error.message.includes('Cannot update rewards: Missing required components')) {
          errorMessage = 'Staking pool is not initialized. Please use the Admin Panel (/admin) to initialize the missing components.';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      // Set initialization status even on error
      let initStatus: InitializationStatus;
      try {
        initStatus = await checkStakePoolInitialization(connection, wallet);
      } catch {
        initStatus = {
          isInitialized: false,
          missingComponents: ['Unable to check status'],
          canAutoInitialize: false,
        };
      }

      setStakingState(prev => ({
        ...prev,
        isLoading: false,
        hasStakeAccount: false,
        isInitialized: initStatus.isInitialized,
        initializationStatus: initStatus,
      }));
    }
  }, [connected, publicKey, connection, wallet, toast]);

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
  }, [connected, publicKey, connection, wallet, fetchStakingData, toast]);

  // Stake tokens
  const stakeTokens = useCallback(async (amount: bigint) => {
    if (!connected || !publicKey || amount <= 0n) return;

    setTransactionStates(prev => ({ ...prev, isStaking: true }));

    try {
      // Check if stake pool is initialized
      const { isInitialized, missingComponents } = await checkStakePoolInitialization(connection, wallet);
      if (!isInitialized) {
        throw new Error(`Stake pool not initialized: ${missingComponents.join(', ')}`);
      }

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
  }, [connected, publicKey, connection, wallet, fetchStakingData, toast]);

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
  }, [connected, publicKey, connection, wallet, updatePendingRewards, fetchStakingData, toast]);

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
  }, [connected, publicKey, connection, wallet, stakingState.stakeData.pendingRewards, fetchStakingData, toast]);

  // Initialize data on wallet connection and page load
  useEffect(() => {
    fetchStakingData();
  }, [fetchStakingData]);

  // Attempt automatic initialization for admins
  const initializeStakePool = useCallback(async () => {
    if (!connected || !publicKey || !wallet) return;

    try {
      await autoInitializeStakePool(connection, wallet);
      toast({
        title: 'Success',
        description: 'Stake pool components initialized successfully',
      });
      await fetchStakingData();
    } catch (error) {
      console.error('Failed to initialize stake pool:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during initialization';

      if (errorMessage.includes('Admin Panel')) {
        toast({
          title: 'Initialization Required',
          description: `${errorMessage} You can access it at /admin`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Initialization Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  }, [connected, publicKey, wallet, connection, fetchStakingData, toast]);

  // Note: Removed automatic reward updates to prevent unwanted transaction prompts
  // Users can manually update rewards using the updatePendingRewards function

  return {
    // State
    ...stakingState,
    ...transactionStates,

    // Actions
    stakeTokens,
    unstakeTokens,
    claimRewards,
    updatePendingRewards,
    initializeStakePool,
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
  const programId = new PublicKey(STAKING_PROGRAM_ID)
  const program = new Program<StakingProgram>(idl as StakingProgram, provider)
  const [stakePoolPda] = await PublicKey.findProgramAddressSync([Buffer.from("stake_pool")], programId)
  const seeds = [Buffer.from("stake_account"), stakePoolPda.toBuffer(), userPublicKey.toBuffer()]
  const [userStakeAccountPda] = await PublicKey.findProgramAddressSync(seeds, programId)

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
  const provider = new AnchorProvider(connection, wallet, {});
  const program = new Program<StakingProgram>(idl as StakingProgram, provider);
  const programId = new PublicKey(STAKING_PROGRAM_ID)

  // Get all stake accounts for this pool
  const stakeAccounts = await program.account.stakeAccount.all();

  // Sum all staked amounts
  const totalValueLocked = stakeAccounts.reduce((total, account) => {
    return total + Number(account.account.stakedAmount?.toString(10) ?? 0);
  }, 0);

  // Get pool config for APY and status
  const [stakePoolConfigPda] = await PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    programId
  );

  let apy = 0;
  try {
    const poolConfig = await program.account.stakePoolConfig.fetch(stakePoolConfigPda);
    apy = Number(poolConfig.apy ?? 0);
  } catch {
    console.warn('Stake pool config not found, using default APY of 0%');
    apy = 0;
  }

  return {
    totalValueLocked,
    apy,
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

  // Check if stake pool is properly initialized
  const initStatus = await checkStakePoolInitialization(connection, wallet);
  if (!initStatus.isInitialized) {
    throw new Error(`Cannot update rewards: Missing required components - ${initStatus.missingComponents.join(', ')}`);
  }

  const provider = new AnchorProvider(connection, wallet, {});
  setProvider(provider);
  const program = new Program<StakingProgram>(idl as StakingProgram, provider)
  const programId = new PublicKey(STAKING_PROGRAM_ID)

  // Derive required PDAs
  const [stakePoolPda] = await PublicKey.findProgramAddressSync([Buffer.from("stake_pool")], programId)
  const [stakeAccountPda] = await PublicKey.findProgramAddressSync([Buffer.from("stake_account"), stakePoolPda.toBuffer(), userPublicKey.toBuffer()], programId)
  const [stakePoolConfigPda] = await PublicKey.findProgramAddressSync([Buffer.from("config")], programId)

  const txSig = await program
    .methods
    .updatePendingRewards()
    .accountsPartial({
      signer: userPublicKey,
      stakePool: stakePoolPda,
      stakeAccount: stakeAccountPda,
      stakePoolConfig: stakePoolConfigPda
    })
    .signers([])
    .rpc()

  return txSig;
}

async function sendStakeTransaction(userPublicKey: PublicKey, amount: bigint, connection: Connection, wallet: AnchorWallet | undefined): Promise<string> {
  if (wallet === undefined) {
    throw new Error("Wallet not connected!")
  }

  // Check if stake pool is properly initialized before attempting to stake
  const initStatus = await checkStakePoolInitialization(connection, wallet);
  if (!initStatus.isInitialized) {
    throw new Error(`Cannot stake: Missing required components - ${initStatus.missingComponents.join(', ')}. Please contact admin to initialize these components.`);
  }

  const provider = new AnchorProvider(connection, wallet, {});
  setProvider(provider);
  const program = new Program<StakingProgram>(idl as StakingProgram, provider)
  const programId = new PublicKey(STAKING_PROGRAM_ID)
  // Derive all required PDAs
  const [stakePoolPda] = await PublicKey.findProgramAddressSync([Buffer.from("stake_pool")], programId)
  const [stakePoolConfigPda] = await PublicKey.findProgramAddressSync([Buffer.from("config")], programId)
  const [stakeAccountPda] = await PublicKey.findProgramAddressSync([Buffer.from("stake_account"), stakePoolPda.toBuffer(), userPublicKey.toBuffer()], programId)
  const tokenMint = new PublicKey(LABS_TOKEN_MINT)
  const userTokenAccount = getAssociatedTokenAddressSync(tokenMint, userPublicKey)
  const [vault] = await PublicKey.findProgramAddressSync([Buffer.from("vault"), stakePoolPda.toBuffer()], programId)

  console.log('Staking transaction details:');
  console.log('- Token mint:', tokenMint.toString());
  console.log('- User token account:', userTokenAccount.toString());
  console.log('- Vault:', vault.toString());
  console.log('- Stake pool PDA:', stakePoolPda.toString());
  console.log('- Stake pool config PDA:', stakePoolConfigPda.toString());
  console.log('- Stake account PDA:', stakeAccountPda.toString());
  console.log('- Amount:', amount.toString());

  // Debug: Check all user's token accounts
  try {
    const allTokenAccounts = await connection.getTokenAccountsByOwner(userPublicKey, {
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
    .accountsPartial({
      signer: userPublicKey,
      stakePool: stakePoolPda,
      stakePoolConfig: stakePoolConfigPda,
      stakeAccount: stakeAccountPda,
      userTokenAccount: userTokenAccount,
      vault: vault,
      tokenMint: tokenMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId
    })
    .preInstructions(preInstructions)
    .signers([])
    .rpc()

  return txSig;
}

async function sendUnstakeTransaction(userPublicKey: PublicKey, amount: bigint, connection: Connection, wallet: AnchorWallet | undefined): Promise<string> {
  if (wallet === undefined) {
    throw new Error("Wallet not connected!")
  }

  // Check if stake pool is properly initialized
  const initStatus = await checkStakePoolInitialization(connection, wallet);
  if (!initStatus.isInitialized) {
    throw new Error(`Cannot unstake: Missing required components - ${initStatus.missingComponents.join(', ')}`);
  }

  const provider = new AnchorProvider(connection, wallet, {});
  setProvider(provider);
  const program = new Program<StakingProgram>(idl as StakingProgram, provider)
  const programId = new PublicKey(STAKING_PROGRAM_ID)

  // Derive required PDAs
  const [stakePoolPda] = await PublicKey.findProgramAddressSync([Buffer.from("stake_pool")], programId)
  const [stakePoolConfigPda] = await PublicKey.findProgramAddressSync([Buffer.from("config")], programId)
  const [stakeAccountPda] = await PublicKey.findProgramAddressSync([Buffer.from("stake_account"), stakePoolPda.toBuffer(), userPublicKey.toBuffer()], programId)
  const [vault] = await PublicKey.findProgramAddressSync([Buffer.from("vault"), stakePoolPda.toBuffer()], programId)
  const [vaultAuthorityPda] = await PublicKey.findProgramAddressSync([Buffer.from("vault_authority"), stakePoolPda.toBuffer()], programId)

  const tokenMint = new PublicKey(LABS_TOKEN_MINT)
  const userTokenAccount = getAssociatedTokenAddressSync(tokenMint, userPublicKey)

  // Check if user's token account exists, create if it doesn't
  const preInstructions = [];
  try {
    await getAccount(connection, userTokenAccount);
  } catch {
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
    .unstakeFromStakePool(new BN(amount.toString()))
    .accountsPartial({
      signer: userPublicKey,
      stakePool: stakePoolPda,
      stakePoolConfig: stakePoolConfigPda,
      stakeAccount: stakeAccountPda,
      userTokenAccount: userTokenAccount,
      vault: vault,
      vaultAuthority: vaultAuthorityPda,
      tokenMint: tokenMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId
    })
    .preInstructions(preInstructions)
    .signers([])
    .rpc()

  return txSig;
}

async function sendClaimRewardsTransaction(userPublicKey: PublicKey, connection: Connection, wallet: AnchorWallet | undefined): Promise<string> {
  if (wallet === undefined) {
    throw new Error("Wallet not connected!")
  }

  // Check if stake pool is properly initialized
  const initStatus = await checkStakePoolInitialization(connection, wallet);
  if (!initStatus.isInitialized) {
    throw new Error(`Cannot claim rewards: Missing required components - ${initStatus.missingComponents.join(', ')}`);
  }

  const provider = new AnchorProvider(connection, wallet, {});
  setProvider(provider);
  const program = new Program<StakingProgram>(idl as StakingProgram, provider)
  const programId = new PublicKey(STAKING_PROGRAM_ID)

  // Derive required PDAs
  const [stakePoolPda] = await PublicKey.findProgramAddressSync([Buffer.from("stake_pool")], programId)
  const [stakePoolConfigPda] = await PublicKey.findProgramAddressSync([Buffer.from("config")], programId)
  const [stakeAccountPda] = await PublicKey.findProgramAddressSync([Buffer.from("stake_account"), stakePoolPda.toBuffer(), userPublicKey.toBuffer()], programId)
  const [mintAuthorityPda] = await PublicKey.findProgramAddressSync([Buffer.from("mint_authority")], programId)
  const [rewardMintPda] = await PublicKey.findProgramAddressSync([Buffer.from("xlabs_mint")], programId)

  // Get user's reward token account
  const userRewardAccount = getAssociatedTokenAddressSync(rewardMintPda, userPublicKey)

  // Check if reward token account exists, create if it doesn't
  const preInstructions = [];
  try {
    await getAccount(connection, userRewardAccount);
  } catch {
    preInstructions.push(
      createAssociatedTokenAccountInstruction(
        userPublicKey, // payer
        userRewardAccount, // associatedToken
        userPublicKey, // owner
        rewardMintPda // mint
      )
    );
  }

  const txSig = await program
    .methods
    .claimRewards()
    .accountsPartial({
      signer: userPublicKey,
      stakePool: stakePoolPda,
      stakePoolConfig: stakePoolConfigPda,
      stakeAccount: stakeAccountPda,
      mintAuthority: mintAuthorityPda,
      rewardMint: rewardMintPda,
      userRewardAccount: userRewardAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId
    })
    .preInstructions(preInstructions)
    .signers([])
    .rpc()

  return txSig;
}

// Check if stake pool is properly initialized
async function checkStakePoolInitialization(connection: Connection, wallet: AnchorWallet | undefined): Promise<InitializationStatus> {
  if (wallet === undefined) {
    throw new Error("Wallet not connected!")
  }

  const provider = new AnchorProvider(connection, wallet, {});
  const program = new Program<StakingProgram>(idl as StakingProgram, provider);
  const programId = new PublicKey(STAKING_PROGRAM_ID)

  const missingComponents: string[] = [];
  const debugInfo: string[] = [];

  // Check if user has admin access for auto-initialization
  const userPublicKey = wallet.publicKey;
  const canAutoInitialize = userPublicKey ? ADMIN_PANEL_ACCESS_ADDRESS.includes(userPublicKey.toString()) : false;

  console.log('🔍 Checking stake pool initialization status...');
  console.log('Program ID:', programId.toString());

  // Check stake pool config
  try {
    const [configPda] = await PublicKey.findProgramAddressSync([Buffer.from("config")], programId);
    console.log('📋 Checking Stake Pool Config at:', configPda.toString());

    const configAccount = await program.account.stakePoolConfig.fetch(configPda);
    console.log('✅ Stake Pool Config found:', configAccount);
    debugInfo.push(`Config found with APY: ${configAccount.apy}`);
  } catch (error) {
    console.log('❌ Stake Pool Config not found:', error);
    missingComponents.push("Stake Pool Config");
    debugInfo.push(`Config error: ${error}`);
  }

  // Check xLABS mint
  try {
    const [xLabsMintPda] = await PublicKey.findProgramAddressSync([Buffer.from("xlabs_mint")], programId);
    console.log('🪙 Checking xLABS Mint at:', xLabsMintPda.toString());

    const mintInfo = await getMint(connection, xLabsMintPda);
    console.log('✅ xLABS Reward Mint found:', mintInfo);
    debugInfo.push(`xLABS mint found with supply: ${mintInfo.supply}, decimals: ${mintInfo.decimals}`);
  } catch (error) {
    console.log('❌ xLABS Reward Mint not found:', error);
    missingComponents.push("xLABS Reward Mint");
    debugInfo.push(`xLABS mint error: ${error}`);
  }

  // Check stake pool
  try {
    const [stakePoolPda] = await PublicKey.findProgramAddressSync([Buffer.from("stake_pool")], programId);
    console.log('🏊 Checking Stake Pool at:', stakePoolPda.toString());

    const stakePoolAccount = await program.account.stakePool.fetch(stakePoolPda);
    console.log('✅ Stake Pool found:', stakePoolAccount);
    debugInfo.push(`Stake pool found with authority: ${stakePoolAccount.authority}`);
  } catch (error) {
    console.log('❌ Stake Pool not found:', error);
    missingComponents.push("Stake Pool");
    debugInfo.push(`Stake pool error: ${error}`);
  }

  const isInitialized = missingComponents.length === 0;

  console.log('📊 Initialization Status Summary:');
  console.log('- Is Initialized:', isInitialized);
  console.log('- Missing Components:', missingComponents);
  console.log('- Can Auto Initialize:', canAutoInitialize);
  console.log('- Debug Info:', debugInfo);

  if (!isInitialized) {
    console.log('⚠️  Some components are missing. If you believe they should exist, check:');
    console.log('  1. Network connection and RPC endpoint');
    console.log('  2. Program ID matches deployed program');
    console.log('  3. Components were created on the correct network');
    console.log('  4. Admin panel shows components as created');
  }

  return {
    isInitialized,
    missingComponents,
    canAutoInitialize
  };
}

// Read-only version of initialization check (doesn't require wallet)
async function checkStakePoolInitializationReadOnly(connection: Connection): Promise<InitializationStatus> {
  const programId = new PublicKey(STAKING_PROGRAM_ID);
  const missingComponents: string[] = [];
  const debugInfo: string[] = [];

  // Create a mock wallet for read-only operations
  const mockWallet = {
    publicKey: new PublicKey("11111111111111111111111111111111"),
    signTransaction: async () => { throw new Error("Mock wallet cannot sign"); },
    signAllTransactions: async () => { throw new Error("Mock wallet cannot sign"); }
  };

  const provider = new AnchorProvider(connection, mockWallet, { preflightCommitment: "processed" });
  const program = new Program<StakingProgram>(idl as StakingProgram, provider);

  console.log('🔍 Checking stake pool initialization status (read-only)...');
  console.log('Program ID:', programId.toString());

  // Check stake pool config
  try {
    const [configPda] = await PublicKey.findProgramAddressSync([Buffer.from("config")], programId);
    console.log('📋 Checking Stake Pool Config at:', configPda.toString());

    const configAccount = await program.account.stakePoolConfig.fetch(configPda);
    console.log('✅ Stake Pool Config found:', configAccount);
    debugInfo.push(`Config found with APY: ${configAccount.apy}`);
  } catch (error) {
    console.log('❌ Stake Pool Config not found:', error);
    missingComponents.push("Stake Pool Config");
    debugInfo.push(`Config error: ${error}`);
  }

  // Check xLABS mint
  try {
    const [xLabsMintPda] = await PublicKey.findProgramAddressSync([Buffer.from("xlabs_mint")], programId);
    console.log('🪙 Checking xLABS Mint at:', xLabsMintPda.toString());

    const mintInfo = await getMint(connection, xLabsMintPda);
    console.log('✅ xLABS Reward Mint found:', mintInfo);
    debugInfo.push(`xLABS mint found with supply: ${mintInfo.supply}, decimals: ${mintInfo.decimals}`);
  } catch (error) {
    console.log('❌ xLABS Reward Mint not found:', error);
    missingComponents.push("xLABS Reward Mint");
    debugInfo.push(`xLABS mint error: ${error}`);
  }

  // Check stake pool
  try {
    const [stakePoolPda] = await PublicKey.findProgramAddressSync([Buffer.from("stake_pool")], programId);
    console.log('🏊 Checking Stake Pool at:', stakePoolPda.toString());

    const stakePoolAccount = await program.account.stakePool.fetch(stakePoolPda);
    console.log('✅ Stake Pool found:', stakePoolAccount);
    debugInfo.push(`Stake pool found with authority: ${stakePoolAccount.authority}`);
  } catch (error) {
    console.log('❌ Stake Pool not found:', error);
    missingComponents.push("Stake Pool");
    debugInfo.push(`Stake pool error: ${error}`);
  }

  const isInitialized = missingComponents.length === 0;

  console.log('📊 Read-Only Initialization Status Summary:');
  console.log('- Is Initialized:', isInitialized);
  console.log('- Missing Components:', missingComponents);
  console.log('- Debug Info:', debugInfo);

  return {
    isInitialized,
    missingComponents,
    canAutoInitialize: false // Always false for read-only check
  };
}

// Auto-initialize stake pool components for admin users
async function autoInitializeStakePool(connection: Connection, wallet: AnchorWallet | undefined): Promise<void> {
  if (wallet === undefined) {
    throw new Error("Wallet not connected!")
  }

  // Check if user has admin privileges
  const userPublicKey = wallet.publicKey;
  const isAdmin = ADMIN_PANEL_ACCESS_ADDRESS.includes(userPublicKey.toString());

  if (!isAdmin) {
    throw new Error("Admin privileges required for initialization");
  }

  const initStatus = await checkStakePoolInitialization(connection, wallet);
  if (initStatus.isInitialized) {
    console.log('Stake pool is already initialized');
    return;
  }

  // For now, we'll direct users to use the admin panel for manual initialization
  // This ensures proper error handling and user feedback
  throw new Error(`Please use the Admin Panel to initialize missing components: ${initStatus.missingComponents.join(', ')}`);
}

// Helper function to get initialization instructions
export function getInitializationInstructions(missingComponents: string[]): string {
  if (missingComponents.length === 0) {
    return "All components are initialized and ready to use.";
  }

  const instructions = [
    "Please initialize the missing components in the following order using the Admin Panel:",
    ""
  ];

  // Add specific initialization order
  if (missingComponents.includes("Stake Pool Config")) {
    instructions.push("1. Create Stake Pool Config (sets up basic pool parameters)");
  }

  if (missingComponents.includes("xLABS Reward Mint")) {
    instructions.push("2. Create xLABS Reward Mint (reward token for stakers)");
  }

  if (missingComponents.includes("Stake Pool")) {
    instructions.push("3. Create Stake Pool (main staking contract)");
  }

  instructions.push("");
  instructions.push("Note: These components must be created in the correct order to function properly.");

  return instructions.join("\n");
}

// Debug function to manually check initialization status - can be called from browser console
(globalThis as unknown as Record<string, unknown>).debugStakePoolStatus = async () => {
  // You'll need to provide a wallet for this to work
  console.log('To use this debug function, call it with a wallet:');
  console.log('debugStakePoolStatus(wallet, connection)');
};

// Add to window for browser console access
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).debugInitStatus = async (wallet?: AnchorWallet, connection?: Connection) => {
    const conn = connection || new Connection("https://api.devnet.solana.com", "processed");

    try {
      if (wallet) {
        const status = await checkStakePoolInitialization(conn, wallet);
        console.log('🔍 Debug Initialization Status (with wallet):', status);
        return status;
      } else {
        const status = await checkStakePoolInitializationReadOnly(conn);
        console.log('🔍 Debug Initialization Status (read-only):', status);
        return status;
      }
    } catch (error) {
      console.error('❌ Debug check failed:', error);
      return null;
    }
  };

  // Also expose the read-only version directly
  (window as unknown as Record<string, unknown>).checkInitStatusReadOnly = async (connection?: Connection) => {
    const conn = connection || new Connection("https://api.devnet.solana.com", "processed");
    return await checkStakePoolInitializationReadOnly(conn);
  };
}