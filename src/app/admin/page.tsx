"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { ADMIN_PANEL_ACCESS_ADDRESS, rpcUrl, LABS_TOKEN_MINT } from "@/lib/constants"
import { StakingProgram } from "@/programs/staking_program/staking_program"
import { Connection, PublicKey, SystemProgram, Transaction, VersionedTransaction } from "@solana/web3.js"
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { ConnectWalletScreen } from './ConnectWalletScreen'
import { AccessDeniedScreen } from './AccessDeniedScreen'
import { AdminPanel } from './AdminPanel'

// Helper function to derive Program Derived Addresses (PDAs)
const findPda = (seeds: (Buffer | Uint8Array)[], programId: PublicKey) =>
  PublicKey.findProgramAddressSync(seeds, programId)[0];

// Helper function to fetch and compute stake pool status from on-chain data
async function fetchStakePoolStatus(connection: Connection, programId: PublicKey, labsTokenAddress: string) {
  let stakePoolAddress = "";
  let configAddress = "";
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

    // Set up a mock provider for read-only operations
    const mockWallet = {
      publicKey: new PublicKey("11111111111111111111111111111111"),
      signTransaction: async () => { throw new Error("Mock wallet cannot sign"); },
      signAllTransactions: async () => { throw new Error("Mock wallet cannot sign"); }
    };
    const provider = new AnchorProvider(connection, mockWallet, { preflightCommitment: "processed" });
    const program = new Program<StakingProgram>(IDL, provider);

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
    currentOnChainApy,
    labsTokenAddress,
    xLabsTokenAddress,
    unclaimedRewards,
    claimedRewards,
    totalStaked,
    tvlStaked
  };
}

export default function AdminPanelPage() {
  const { publicKey, signTransaction } = useWallet(); // Removed signMessage as it's unused
  const [isMounted, setIsMounted] = useState(false);
  const [apy, setApy] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateStakePoolConfigDialogOpen, setIsCreateStakePoolConfigDialogOpen] = useState(false);
  const [isDeleteStakePoolConfigDialogOpen, setIsDeleteStakePoolConfigDialogOpen] = useState(false);
  const [isCreateXLabsMintDialogOpen, setIsCreateXLabsMintDialogOpen] = useState(false);
  const [isCreateStakePoolDialogOpen, setIsCreateStakePoolDialogOpen] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [stakePoolStatus, setStakePoolStatus] = useState({
    programAddress: IDL.address,
    stakePoolAddress: "",
    configAddress: "",
    currentOnChainApy: "Not Set",
    labsTokenAddress: LABS_TOKEN_MINT as string,
    xLabsTokenAddress: "",
    unclaimedRewards: "0",
    claimedRewards: "0",
    totalStaked: "0",
    tvlStaked: "$0.00"
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to refresh stake pool status
  const refreshStakePoolStatus = async () => {
    setIsRefreshing(true);
    try {
      const connection = new Connection(rpcUrl);
      const programId = new PublicKey(IDL.address);
      const status = await fetchStakePoolStatus(connection, programId, LABS_TOKEN_MINT);
      setStakePoolStatus(status);
    } catch (error) {
      console.error('Error during status refresh:', error);
      setUpdateMessage({ type: 'error', text: 'Failed to refresh stake pool status. Please try again.' });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    refreshStakePoolStatus();
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshStakePoolStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (updateMessage) {
      setIsNotificationVisible(true);
      const timer = setTimeout(() => setIsNotificationVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [updateMessage]);

  useEffect(() => {
    if (updateMessage?.type === 'success' && updateMessage.text.includes('APY updated')) {
      refreshStakePoolStatus();
    }
  }, [updateMessage]);

  // Auto-populate APY input from on-chain value
  useEffect(() => {
    if (stakePoolStatus.currentOnChainApy &&
      stakePoolStatus.currentOnChainApy !== "Not Set" &&
      stakePoolStatus.currentOnChainApy !== "Config not created" &&
      apy === "") {
      const numericApy = stakePoolStatus.currentOnChainApy.replace('%', '');
      setApy(numericApy);
    }
  }, [stakePoolStatus.currentOnChainApy, apy]);

  const isAdmin = publicKey ? ADMIN_PANEL_ACCESS_ADDRESS.includes(publicKey.toBase58()) : false;

  // Handler for updating APY
  const handleSetApy = async () => {
    if (!isAdmin || !publicKey || !signTransaction) {
      setUpdateMessage({ type: 'error', text: 'Authorization failed. Ensure an admin wallet is connected.' });
      setIsDialogOpen(false);
      return;
    }
    setIsDialogOpen(false);
    try {
      const programId = new PublicKey(IDL.address);
      const config = findPda([Buffer.from("config")], programId);

      const connection = new Connection(rpcUrl);
      const wallet = {
        publicKey,
        signTransaction,
        signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => Promise.all(txs.map(signTransaction!))
      };
      const provider = new AnchorProvider(connection, wallet, { preflightCommitment: "processed" });
      const program = new Program<StakingProgram>(IDL, provider);

      const configAccount = await program.account.stakePoolConfig.fetchNullable(config);
      if (!configAccount) {
        throw new Error('Stake pool config does not exist. Create it first.');
      }

      if (!configAccount.authority.equals(publicKey)) {
        throw new Error(`Unauthorized: Current wallet is not the config authority.`);
      }

      const newApyBasisPoints = new BN(parseFloat(apy) * 100);
      const txSignature = await program.methods.updateStakePoolConfig(newApyBasisPoints)
        .accounts({ authority: publicKey, config })
        .rpc();

      setUpdateMessage({ type: 'success', text: `APY updated on-chain to ${apy}%. Transaction: ${txSignature}` });
    } catch (error) {
      console.error('APY update failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error during APY update.';
      setUpdateMessage({ type: 'error', text: `Failed to update APY: ${errorMsg}` });
    }
  };

  // Handler for creating stake pool config
  const handleCreateStakePoolConfig = async () => {
    if (!isAdmin || !publicKey || !signTransaction) {
      setUpdateMessage({ type: 'error', text: 'Authorization failed. Ensure an admin wallet is connected.' });
      setIsCreateStakePoolConfigDialogOpen(false);
      return;
    }
    setIsCreateStakePoolConfigDialogOpen(false);
    try {
      const programId = new PublicKey(IDL.address);
      const config = findPda([Buffer.from("config")], programId);
      const stakingMint = new PublicKey(LABS_TOKEN_MINT);
      const rewardMint = findPda([Buffer.from("xlabs_mint")], programId);

      const connection = new Connection(rpcUrl);
      const wallet = {
        publicKey,
        signTransaction,
        signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => Promise.all(txs.map(signTransaction!))
      };
      const provider = new AnchorProvider(connection, wallet, { preflightCommitment: "processed" });
      const program = new Program<StakingProgram>(IDL, provider);

      const txSignature = await program.methods.createStakePoolConfig(new BN(10000)) // 100% APY initial
        .accountsPartial({
          signer: publicKey,
          config,
          stakingMint,
          rewardMint,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID
        })
        .rpc();

      setUpdateMessage({ type: 'success', text: `Stake pool config created. Transaction: ${txSignature}` });
      refreshStakePoolStatus();
    } catch (error) {
      console.error('Config creation failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error during config creation.';
      setUpdateMessage({ type: 'error', text: `Failed to create config: ${errorMsg}` });
    }
  };

  // Handler for deleting stake pool config
  const handleDeleteStakePoolConfig = async () => {
    if (!isAdmin || !publicKey || !signTransaction) {
      setUpdateMessage({ type: 'error', text: 'Authorization failed. Ensure an admin wallet is connected.' });
      setIsDeleteStakePoolConfigDialogOpen(false);
      return;
    }
    setIsDeleteStakePoolConfigDialogOpen(false);
    try {
      const programId = new PublicKey(IDL.address);
      const config = findPda([Buffer.from("config")], programId);

      const connection = new Connection(rpcUrl);
      const wallet = {
        publicKey,
        signTransaction,
        signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => Promise.all(txs.map(signTransaction!))
      };
      const provider = new AnchorProvider(connection, wallet, { preflightCommitment: "processed" });
      const program = new Program<StakingProgram>(IDL, provider);

      const txSignature = await program.methods.deleteStakePoolConfig()
        .accountsPartial({ config, authority: publicKey })
        .rpc();

      setUpdateMessage({ type: 'success', text: `Stake pool config deleted. Transaction: ${txSignature}` });
      refreshStakePoolStatus();
    } catch (error) {
      console.error('Config deletion failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error during config deletion.';
      setUpdateMessage({ type: 'error', text: `Failed to delete config: ${errorMsg}` });
    }
  };

  // Handler for creating xLABS mint
  const handleCreateXLabsMint = async () => {
    if (!isAdmin || !publicKey || !signTransaction) {
      setUpdateMessage({ type: 'error', text: 'Authorization failed. Ensure an admin wallet is connected.' });
      setIsCreateXLabsMintDialogOpen(false);
      return;
    }
    setIsCreateXLabsMintDialogOpen(false);
    try {
      const programId = new PublicKey(IDL.address);
      const xLabsMint = findPda([Buffer.from("xlabs_mint")], programId);

      const connection = new Connection(rpcUrl);
      const wallet = {
        publicKey,
        signTransaction,
        signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => Promise.all(txs.map(signTransaction!))
      };
      const provider = new AnchorProvider(connection, wallet, { preflightCommitment: "processed" });
      const program = new Program<StakingProgram>(IDL, provider);

      const txSignature = await program.methods.createXLabsMint(9)
        .accountsPartial({
          signer: publicKey,
          mint: xLabsMint,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID
        })
        .rpc();

      setUpdateMessage({ type: 'success', text: `xLABS mint created. Transaction: ${txSignature}` });
      refreshStakePoolStatus();
    } catch (error) {
      console.error('Mint creation failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error during mint creation.';
      setUpdateMessage({ type: 'error', text: `Failed to create xLABS mint: ${errorMsg}` });
    }
  };

  // Handler for creating stake pool
  const handleCreateStakePool = async () => {
    if (!isAdmin || !publicKey || !signTransaction) {
      setUpdateMessage({ type: 'error', text: 'Authorization failed. Ensure an admin wallet is connected.' });
      setIsCreateStakePoolDialogOpen(false);
      return;
    }
    setIsCreateStakePoolDialogOpen(false);
    try {
      const programId = new PublicKey(IDL.address);
      const stakePool = findPda([Buffer.from("stake_pool")], programId);
      const config = findPda([Buffer.from("config")], programId);
      const tokenMint = new PublicKey(LABS_TOKEN_MINT);
      const vault = findPda([Buffer.from("vault"), stakePool.toBuffer()], programId);
      const vaultAuthority = findPda([Buffer.from("vault_authority"), stakePool.toBuffer()], programId);

      const connection = new Connection(rpcUrl);
      const wallet = {
        publicKey,
        signTransaction,
        signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => Promise.all(txs.map(signTransaction!))
      };
      const provider = new AnchorProvider(connection, wallet, { preflightCommitment: "processed" });
      const program = new Program<StakingProgram>(IDL, provider);

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

      setUpdateMessage({ type: 'success', text: `Stake pool created. Transaction: ${txSignature}` });
      refreshStakePoolStatus();
    } catch (error) {
      console.error('Stake pool creation failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error during stake pool creation.';
      setUpdateMessage({ type: 'error', text: `Failed to create stake pool: ${errorMsg}` });
    }
  };

  if (!isMounted) return null;
  if (!publicKey) return <ConnectWalletScreen />;
  if (!isAdmin) return <AccessDeniedScreen />;

  return (
    <AdminPanel
      apy={apy}
      setApy={setApy}
      isNotificationVisible={isNotificationVisible}
      updateMessage={updateMessage}
      setUpdateMessage={setUpdateMessage}
      handleSetApy={handleSetApy}
      handleCreateStakePoolConfig={handleCreateStakePoolConfig}
      handleDeleteStakePoolConfig={handleDeleteStakePoolConfig}
      handleCreateXLabsMint={handleCreateXLabsMint}
      handleCreateStakePool={handleCreateStakePool}
      isDialogOpen={isDialogOpen}
      setIsDialogOpen={setIsDialogOpen}
      isCreateStakePoolConfigDialogOpen={isCreateStakePoolConfigDialogOpen}
      setICreateStakePoolConfigDialogOpen={setIsCreateStakePoolConfigDialogOpen}
      isDeleteStakePoolConfigDialogOpen={isDeleteStakePoolConfigDialogOpen}
      setIsDeleteStakePoolConfigDialogOpen={setIsDeleteStakePoolConfigDialogOpen}
      isCreateXLabsMintDialogOpen={isCreateXLabsMintDialogOpen}
      setIsCreateXLabsMintDialogOpen={setIsCreateXLabsMintDialogOpen}
      isCreateStakePoolDialogOpen={isCreateStakePoolDialogOpen}
      setIsCreateStakePoolDialogOpen={setIsCreateStakePoolDialogOpen}
      stakePoolStatus={stakePoolStatus}
      refreshStakePoolStatus={refreshStakePoolStatus}
      isRefreshing={isRefreshing}
    />
  );
}