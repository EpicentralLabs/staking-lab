
import { createSolanaClient } from "gill";

// Network Configuration
type SolanaCluster = "localnet" | "devnet" | "mainnet-beta"

// Read cluster from environment variable with validation
const getValidCluster = (cluster?: string): SolanaCluster => {
  if (cluster === "localnet" || cluster === "devnet" || cluster === "mainnet-beta") {
    return cluster;
  }
  return "devnet"; // default fallback
};
const CLUSTER = getValidCluster(process.env.NEXT_PUBLIC_SOLANA_CLUSTER);

// RPC URLs
export const LOCALHOST_RPC_URL = "http://127.0.0.1:8899";
export const DEVNET_RPC_URL = process.env.NEXT_PUBLIC_TRITON_DEVNET_RPC_URL || "https://api.devnet.solana.com";
export const MAINNET_RPC_URL = "https://api.mainnet-beta.solana.com";

// Token configurations by network
const NETWORK_CONFIG = {
  localnet: {
    LABS_TOKEN_MINT: "2edbfZ4FdrkSrxYDsZEwVHP2QfFpbuXpgtfHgJA1G2pg", // Test token for local
    XLABS_TOKEN_MINT: "11111111111111111111111111111111",
    rpcUrl: LOCALHOST_RPC_URL
  },
  devnet: {
    // LABS_TOKEN_MINT: "2edbfZ4FdrkSrxYDsZEwVHP2QfFpbuXpgtfHgJA1G2pg", // Test token for devnet
    LABS_TOKEN_MINT: "5xMz2PeLhC3t2dm5FBDq5GRAaA46PPQvTPBKEdRyppct", // i just created this for myself for ease
    XLABS_TOKEN_MINT: "11111111111111111111111111111111",
    rpcUrl: DEVNET_RPC_URL
  },
  "mainnet-beta": {
    LABS_TOKEN_MINT: "LABSh5DTebUcUbEoLzXKCiXFJLecDFiDWiBGUU1GpxR", // Real LABS token on mainnet
    XLABS_TOKEN_MINT: "11111111111111111111111111111111",
    rpcUrl: MAINNET_RPC_URL
  }
} as const;

// Get current network configuration with fallback
const currentConfig = NETWORK_CONFIG[CLUSTER] || NETWORK_CONFIG.devnet;

// Export current network values
export const LABS_TOKEN_MINT = currentConfig.LABS_TOKEN_MINT;
export const rpcUrl = currentConfig.rpcUrl;

// Staking program ID from IDL
export const STAKING_PROGRAM_ID = "D3fVZKwQaTjyTZNzUTSdJtcHnp1qM4VdYeQt4HUZdAWD";

// Admin panel access addresses
export const ADMIN_PANEL_ACCESS_ADDRESS = ["3zxtSkehQA7Dtknwkt95FMnp4h4MDWYHM1epj9xeRsof", "3sNBfwUbxx7LAibq2CpN8zSQsvocnuGCJ9ivACRH6Vkg", "8C9yaHEhc348upam4mJuY554ZvjrnmBsftcYTuRGZ4bT", "2R5FHfQPPpc14HQai13UWKjqz3GDJ4cG1wYAafaGysqi"]

// Export current cluster for debugging
export const CURRENT_CLUSTER = CLUSTER;

export const solanaClient = createSolanaClient({
  urlOrMoniker: rpcUrl,
});

export const { rpc, rpcSubscriptions, sendAndConfirmTransaction } = solanaClient;
