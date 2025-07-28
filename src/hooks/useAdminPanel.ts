"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWallet, useAnchorWallet, useConnection, type AnchorWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program, BN, setProvider } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { ADMIN_PANEL_ACCESS_ADDRESS, LABS_TOKEN_MINT } from '@/lib/constants';
import idl from '@/programs/staking_program/staking_program.json';
import type { StakingProgram } from '@/programs/staking_program/staking_program';

export interface StakePoolStatus {
  programAddress: string;
  stakePoolAddress: string;
  configAddress: string;
  vaultAddress: string;
  currentOnChainApy: string;
  labsTokenAddress: string;
  xLabsTokenAddress: string;
  unclaimedRewards: string;
  claimedRewards: string;
  totalStaked: string;
  tvlStaked: string;
}

export interface AdminPanelState {
  apy: string;
  stakePoolStatus: StakePoolStatus;
  isRefreshing: boolean;
  updateMessage: { type: 'success' | 'error', text: string } | null;
  isNotificationVisible: boolean;
  dialogs: {
    updateApy: boolean;
    createStakePoolConfig: boolean;
    deleteStakePoolConfig: boolean;
    createXLabsMint: boolean;
    createStakePool: boolean;
    deleteStakePool: boolean;
  };
}

// Helper function to derive Program Derived Addresses (PDAs)
const findPda = (seeds: (Buffer | Uint8Array)[], programId: PublicKey) =>
  PublicKey.findProgramAddressSync(seeds, programId)[0];


export function useAdminPanel() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const [state, setState] = useState<AdminPanelState>({
    apy: "",
    stakePoolStatus: {
      programAddress: idl.address,
      stakePoolAddress: "",
      configAddress: "",
      vaultAddress: "",
      currentOnChainApy: "Not Set",
      labsTokenAddress: LABS_TOKEN_MINT as string,
      xLabsTokenAddress: "",
      unclaimedRewards: "0",
      claimedRewards: "0",
      totalStaked: "0",
      tvlStaked: "$0.00"
    },
    isRefreshing: false,
    updateMessage: null,
    isNotificationVisible: false,
    dialogs: {
      updateApy: false,
      createStakePoolConfig: false,
      deleteStakePoolConfig: false,
      createXLabsMint: false,
      createStakePool: false,
      deleteStakePool: false,
    }
  });

  const isAdmin = publicKey ? ADMIN_PANEL_ACCESS_ADDRESS.includes(publicKey.toBase58()) : false;

  // Function to refresh stake pool status
  const refreshStakePoolStatus = useCallback(async () => {
    setState(prev => ({ ...prev, isRefreshing: true }));
    try {
      const programId = new PublicKey(idl.address);
      const status = await sendFetchStakePoolStatusRequest(connection, programId, LABS_TOKEN_MINT);
      setState(prev => ({
        ...prev,
        stakePoolStatus: status,
        isRefreshing: false
      }));
    } catch (error) {
      console.error('Error during status refresh:', error);
      setState(prev => ({
        ...prev,
        updateMessage: { type: 'error', text: 'Failed to refresh stake pool status. Please try again.' },
        isRefreshing: false
      }));
    }
  }, [connection]);

  // Update APY
  const updateApy = useCallback(async () => {
    if (!isAdmin || !publicKey || !wallet) {
      setState(prev => ({
        ...prev,
        updateMessage: { type: 'error', text: 'Authorization failed. Ensure an admin wallet is connected.' },
        dialogs: { ...prev.dialogs, updateApy: false }
      }));
      return;
    }

    setState(prev => ({ ...prev, dialogs: { ...prev.dialogs, updateApy: false } }));

    try {
      const txSignature = await sendUpdateApyTransaction(publicKey, state.apy, connection, wallet);
      setState(prev => ({
        ...prev,
        updateMessage: { type: 'success', text: `APY updated on-chain to ${state.apy}%. Transaction: ${txSignature}` }
      }));
    } catch (error) {
      console.error('APY update failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error during APY update.';
      setState(prev => ({
        ...prev,
        updateMessage: { type: 'error', text: `Failed to update APY: ${errorMsg}` }
      }));
    }
  }, [isAdmin, publicKey, wallet, connection, state.apy]);

  // Create stake pool config
  const createStakePoolConfig = useCallback(async () => {
    if (!isAdmin || !publicKey || !wallet) {
      setState(prev => ({
        ...prev,
        updateMessage: { type: 'error', text: 'Authorization failed. Ensure an admin wallet is connected.' },
        dialogs: { ...prev.dialogs, createStakePoolConfig: false }
      }));
      return;
    }

    setState(prev => ({ ...prev, dialogs: { ...prev.dialogs, createStakePoolConfig: false } }));

    try {
      const txSignature = await sendCreateStakePoolConfigTransaction(publicKey, connection, wallet);
      setState(prev => ({
        ...prev,
        updateMessage: { type: 'success', text: `Stake pool config created. Transaction: ${txSignature}` }
      }));
      refreshStakePoolStatus();
    } catch (error) {
      console.error('Config creation failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error during config creation.';
      setState(prev => ({
        ...prev,
        updateMessage: { type: 'error', text: `Failed to create config: ${errorMsg}` }
      }));
    }
  }, [isAdmin, publicKey, wallet, connection, refreshStakePoolStatus]);

  // Delete stake pool config
  const deleteStakePoolConfig = useCallback(async () => {
    if (!isAdmin || !publicKey || !wallet) {
      setState(prev => ({
        ...prev,
        updateMessage: { type: 'error', text: 'Authorization failed. Ensure an admin wallet is connected.' },
        dialogs: { ...prev.dialogs, deleteStakePoolConfig: false }
      }));
      return;
    }

    setState(prev => ({ ...prev, dialogs: { ...prev.dialogs, deleteStakePoolConfig: false } }));

    try {
      const txSignature = await sendDeleteStakePoolConfigTransaction(publicKey, connection, wallet);
      setState(prev => ({
        ...prev,
        updateMessage: { type: 'success', text: `Stake pool config deleted. Transaction: ${txSignature}` }
      }));
      refreshStakePoolStatus();
    } catch (error) {
      console.error('Config deletion failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error during config deletion.';
      setState(prev => ({
        ...prev,
        updateMessage: { type: 'error', text: `Failed to delete config: ${errorMsg}` }
      }));
    }
  }, [isAdmin, publicKey, wallet, connection, refreshStakePoolStatus]);

  // Create xLABS mint
  const createXLabsMint = useCallback(async () => {
    if (!isAdmin || !publicKey || !wallet) {
      setState(prev => ({
        ...prev,
        updateMessage: { type: 'error', text: 'Authorization failed. Ensure an admin wallet is connected.' },
        dialogs: { ...prev.dialogs, createXLabsMint: false }
      }));
      return;
    }

    setState(prev => ({ ...prev, dialogs: { ...prev.dialogs, createXLabsMint: false } }));

    try {
      const txSignature = await sendCreateXLabsMintTransaction(publicKey, connection, wallet);

      setState(prev => ({
        ...prev,
        updateMessage: { type: 'success', text: `xLABS mint created. Transaction: ${txSignature}` }
      }));
      refreshStakePoolStatus();
    } catch (error) {
      console.error('Mint creation failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error during mint creation.';
      setState(prev => ({
        ...prev,
        updateMessage: { type: 'error', text: `Failed to create xLABS mint: ${errorMsg}` }
      }));
    }
  }, [isAdmin, publicKey, wallet, connection, refreshStakePoolStatus]);

  // Create stake pool
  const createStakePool = useCallback(async () => {
    if (!isAdmin || !publicKey || !wallet) {
      setState(prev => ({
        ...prev,
        updateMessage: { type: 'error', text: 'Authorization failed. Ensure an admin wallet is connected.' },
        dialogs: { ...prev.dialogs, createStakePool: false }
      }));
      return;
    }

    setState(prev => ({ ...prev, dialogs: { ...prev.dialogs, createStakePool: false } }));

    try {
      const txSignature = await sendCreateStakePoolTransaction(publicKey, connection, wallet);

      setState(prev => ({
        ...prev,
        updateMessage: { type: 'success', text: `Stake pool created. Transaction: ${txSignature}` }
      }));
      refreshStakePoolStatus();
    } catch (error) {
      console.error('Stake pool creation failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error during stake pool creation.';
      setState(prev => ({
        ...prev,
        updateMessage: { type: 'error', text: `Failed to create stake pool: ${errorMsg}` }
      }));
    }
  }, [isAdmin, publicKey, wallet, connection, refreshStakePoolStatus]);

  // Delete stake pool
  const deleteStakePool = useCallback(async () => {
    if (!isAdmin || !publicKey || !wallet) {
      setState(prev => ({
        ...prev,
        updateMessage: { type: 'error', text: 'Authorization failed. Ensure an admin wallet is connected.' },
        dialogs: { ...prev.dialogs, deleteStakePool: false }
      }));
      return;
    }

    setState(prev => ({ ...prev, dialogs: { ...prev.dialogs, deleteStakePool: false } }));

    try {
      const txSignature = await sendDeleteStakePoolTransaction(publicKey, connection, wallet);
      setState(prev => ({
        ...prev,
        updateMessage: { type: 'success', text: `Stake pool deleted successfully. Transaction: ${txSignature}` }
      }));
      refreshStakePoolStatus();
    } catch (error) {
      console.error('Stake pool deletion failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error during stake pool deletion.';
      setState(prev => ({
        ...prev,
        updateMessage: { type: 'error', text: `Failed to delete stake pool: ${errorMsg}` }
      }));
    }
  }, [isAdmin, publicKey, wallet, connection, refreshStakePoolStatus]);

  // Dialog management functions
  const openDialog = useCallback((dialogType: keyof AdminPanelState['dialogs']) => {
    setState(prev => ({
      ...prev,
      dialogs: { ...prev.dialogs, [dialogType]: true }
    }));
  }, []);

  const closeDialog = useCallback((dialogType: keyof AdminPanelState['dialogs']) => {
    setState(prev => ({
      ...prev,
      dialogs: { ...prev.dialogs, [dialogType]: false }
    }));
  }, []);

  const setApy = useCallback((apy: string) => {
    setState(prev => ({ ...prev, apy }));
  }, []);

  const setUpdateMessage = useCallback((message: { type: 'success' | 'error', text: string } | null) => {
    setState(prev => ({ ...prev, updateMessage: message }));
  }, []);

  // Auto-populate APY input from on-chain value
  useEffect(() => {
    if (state.stakePoolStatus.currentOnChainApy &&
      state.stakePoolStatus.currentOnChainApy !== "Not Set" &&
      state.stakePoolStatus.currentOnChainApy !== "Config not created" &&
      state.apy === "") {
      const numericApy = state.stakePoolStatus.currentOnChainApy.replace('%', '');
      setState(prev => ({ ...prev, apy: numericApy }));
    }
  }, [state.stakePoolStatus.currentOnChainApy, state.apy]);

  // Handle notification visibility
  useEffect(() => {
    if (state.updateMessage) {
      setState(prev => ({ ...prev, isNotificationVisible: true }));
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, isNotificationVisible: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.updateMessage]);

  // Auto-refresh status on successful APY update
  useEffect(() => {
    if (state.updateMessage?.type === 'success' && state.updateMessage.text.includes('APY updated')) {
      refreshStakePoolStatus();
    }
  }, [state.updateMessage, refreshStakePoolStatus]);

  // Initial load and periodic refresh
  useEffect(() => {
    refreshStakePoolStatus();
    const interval = setInterval(refreshStakePoolStatus, 30000);
    return () => clearInterval(interval);
  }, [refreshStakePoolStatus]);

  return {
    // State
    apy: state.apy,
    stakePoolStatus: state.stakePoolStatus,
    isRefreshing: state.isRefreshing,
    updateMessage: state.updateMessage,
    isNotificationVisible: state.isNotificationVisible,
    dialogs: state.dialogs,
    isAdmin,

    // Actions
    setApy,
    setUpdateMessage,
    refreshStakePoolStatus,
    updateApy,
    createStakePoolConfig,
    deleteStakePoolConfig,
    createXLabsMint,
    createStakePool,
    deleteStakePool,
    openDialog,
    closeDialog,
  };
}

// TODO (pen): Implement these admin Solana interaction functions
async function sendFetchStakePoolStatusRequest(connection: Connection, programId: PublicKey, labsTokenAddress: string): Promise<StakePoolStatus> {
  let stakePoolAddress = "";
  let configAddress = "";
  let vaultAddress = "";
  let currentOnChainApy = "Not Set";
  let xLabsTokenAddress = "";
  let totalStaked = "0";
  let claimedRewards = "0";
  let unclaimedRewards = "0";
  let tvlStaked = "$0.00";

  try {
    stakePoolAddress = findPda([Buffer.from("stake_pool")], programId).toBase58();
    const configPda = findPda([Buffer.from("config")], programId);
    configAddress = configPda.toBase58();
    const stakePoolPda = findPda([Buffer.from("stake_pool")], programId);
    const vaultPda = findPda([Buffer.from("vault"), stakePoolPda.toBuffer()], programId);
    vaultAddress = vaultPda.toBase58();

    // Set up a mock provider for read-only operations
    const mockWallet = {
      publicKey: new PublicKey("11111111111111111111111111111111"),
      signTransaction: async () => { throw new Error("Mock wallet cannot sign"); },
      signAllTransactions: async () => { throw new Error("Mock wallet cannot sign"); }
    };
    const provider = new AnchorProvider(connection, mockWallet, { preflightCommitment: "processed" });
    const program = new Program<StakingProgram>(idl, provider);

    // Fetch and parse config account
    try {
      const configAccount = await program.account.stakePoolConfig.fetch(configPda);
      xLabsTokenAddress = configAccount.rewardMint.toBase58();
      const apyBasisPoints = Number(configAccount.apy);
      currentOnChainApy = `${(apyBasisPoints / 100).toFixed(2)}%`;
    } catch (err) {
      console.warn('Config account not found:', err);
      xLabsTokenAddress = findPda([Buffer.from("xlabs_mint")], programId).toBase58();
      currentOnChainApy = "Config not created";
    }

    // Fetch and parse stake pool account, including aggregated stats
    try {
      await program.account.stakePool.fetch(stakePoolPda);

      const stakeAccounts = await program.account.stakeAccount.all([
        {
          memcmp: {
            offset: 32 + 8, // Offset for stake_pool field
            bytes: stakePoolPda.toBase58()
          }
        }
      ]);

      let totalStakedAmount = 0;
      let totalRewardsClaimed = 0;
      let totalRewardsUnclaimed = 0;

      stakeAccounts.forEach(account => {
        const { stakedAmount, rewardsEarned, pendingRewards } = account.account;
        totalStakedAmount += Number(stakedAmount);
        totalRewardsClaimed += Number(rewardsEarned);
        totalRewardsUnclaimed += Number(pendingRewards);
      });

      totalStaked = (totalStakedAmount / 1e9).toFixed(2);
      claimedRewards = (totalRewardsClaimed / 1e9).toFixed(2);
      unclaimedRewards = (totalRewardsUnclaimed / 1e9).toFixed(2);

      // TVL placeholder (integrate real price oracle in production)
      const totalStakedNum = parseFloat(totalStaked) || 0;
      tvlStaked = `$${totalStakedNum.toFixed(2)}`; // Update with actual token price multiplication
    } catch (err) {
      console.warn('Stake pool or accounts not found:', err);
    }
  } catch (err) {
    console.error('Failed to fetch stake pool status:', err);
    xLabsTokenAddress = "11111111111111111111111111111111";
  }

  return {
    programAddress: programId.toBase58(),
    stakePoolAddress,
    configAddress,
    vaultAddress,
    currentOnChainApy,
    labsTokenAddress,
    xLabsTokenAddress,
    unclaimedRewards,
    claimedRewards,
    totalStaked,
    tvlStaked
  };
}

async function sendUpdateApyTransaction(publicKey: PublicKey, apy: string, connection: Connection, wallet: AnchorWallet | undefined): Promise<string> {
  if (!wallet) {
    throw new Error("Wallet not connected!");
  }

  const programId = new PublicKey(idl.address);
  const config = findPda([Buffer.from("config")], programId);

  const provider = new AnchorProvider(connection, wallet, { preflightCommitment: "processed" });
  const program = new Program<StakingProgram>(idl, provider);

  const configAccount = await program.account.stakePoolConfig.fetchNullable(config);
  if (!configAccount) {
    throw new Error("Stake pool config does not exist. Create it first.");
  }

  if (!configAccount.authority.equals(publicKey)) {
    throw new Error("Unauthorized: Current wallet is not the config authority.");
  }

  const newApyBasisPoints = new BN(parseFloat(apy) * 100);
  const txSignature = await program.methods.updateStakePoolConfig(newApyBasisPoints)
    .accounts({ authority: publicKey, config })
    .rpc();

  return txSignature;
}

async function sendCreateStakePoolConfigTransaction(publicKey: PublicKey, connection: Connection, wallet: AnchorWallet | undefined): Promise<string> {
  if (!wallet) {
    throw new Error("Wallet not connected!");
  }

  const programId = new PublicKey(idl.address);
  const config = findPda([Buffer.from("config")], programId);
  const stakingMint = new PublicKey(LABS_TOKEN_MINT);
  const rewardMint = findPda([Buffer.from("xlabs_mint")], programId);

  const provider = new AnchorProvider(connection, wallet, { preflightCommitment: "processed" });
  const program = new Program<StakingProgram>(idl, provider);

  const txSignature = await program.methods.createStakePoolConfig(new BN(1000)) // 10% APY initial
    .accountsPartial({
      signer: publicKey,
      config,
      stakingMint,
      rewardMint,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID
    })
    .rpc();

  return txSignature;
}

async function sendDeleteStakePoolConfigTransaction(publicKey: PublicKey, connection: Connection, wallet: AnchorWallet | undefined): Promise<string> {
  if (!wallet) {
    throw new Error("Wallet not connected!");
  }

  const programId = new PublicKey(idl.address);
  const config = findPda([Buffer.from("config")], programId);

  const provider = new AnchorProvider(connection, wallet, { preflightCommitment: "processed" });
  const program = new Program<StakingProgram>(idl, provider);

  const txSignature = await program.methods.deleteStakePoolConfig()
    .accountsPartial({ config, authority: publicKey })
    .rpc();

  return txSignature;
}

async function sendCreateXLabsMintTransaction(publicKey: PublicKey, connection: Connection, wallet: AnchorWallet | undefined): Promise<string> {
  if (!wallet) {
    throw new Error("Wallet not connected!");
  }

  const programId = new PublicKey(idl.address);
  const xLabsMint = findPda([Buffer.from("xlabs_mint")], programId);

  const provider = new AnchorProvider(connection, wallet, { preflightCommitment: "processed" });
  const program = new Program<StakingProgram>(idl, provider);

  const txSignature = await program.methods.createXLabsMint(9)
    .accountsPartial({
      signer: publicKey,
      mint: xLabsMint,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID
    })
    .rpc();

  return txSignature;
}

async function sendCreateStakePoolTransaction(publicKey: PublicKey, connection: Connection, wallet: AnchorWallet | undefined): Promise<string> {
  if (!wallet) {
    throw new Error("Wallet not connected!");
  }

  const programId = new PublicKey(idl.address);
  const stakePool = findPda([Buffer.from("stake_pool")], programId);
  const config = findPda([Buffer.from("config")], programId);
  const tokenMint = new PublicKey(LABS_TOKEN_MINT);
  const vault = findPda([Buffer.from("vault"), stakePool.toBuffer()], programId);
  const vaultAuthority = findPda([Buffer.from("vault_authority"), stakePool.toBuffer()], programId);

  const provider = new AnchorProvider(connection, wallet, { preflightCommitment: "processed" });
  const program = new Program<StakingProgram>(idl, provider);

  const txSignature = await program.methods.createStakePool()
    .accountsPartial({
      authority: publicKey,
      stakePool,
      tokenMint,
      vault,
      config,
      vaultAuthority,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID
    })
    .rpc();

  return txSignature;
}

async function sendDeleteStakePoolTransaction(publicKey: PublicKey, connection: Connection, wallet: AnchorWallet | undefined): Promise<string> {
  if (!wallet) {
    throw new Error("Wallet not connected!");
  }
  const provider = new AnchorProvider(connection, wallet)
  setProvider(provider)
  const program = new Program<StakingProgram>(idl as StakingProgram, provider)
  program.methods
    .deleteStakePoolConfig()
    .signers([])
    .rpc()
  return 'success'
}

