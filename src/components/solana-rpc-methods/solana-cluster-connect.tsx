import { rpc, rpcSubscriptions, rpcUrl, CURRENT_CLUSTER, LABS_TOKEN_MINT } from "@/lib/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { sendAndConfirmTransactionFactory } from "@solana/kit";

// Create and export RPC connection
// Use the shared rpc and rpcSubscriptions from constants
export const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });

export function SolanaClusterConnect() {
  const { connected } = useWallet();
  const { publicKey } = useWallet();

  useEffect(() => {
    console.log("=== Solana Network Configuration ===");
    console.log("Current Cluster:", CURRENT_CLUSTER);
    console.log("RPC URL:", rpcUrl);
    console.log("LABS Token Mint:", LABS_TOKEN_MINT);
    console.log("Wallet Connected:", connected);
    console.log("Public Key:", publicKey?.toString());
    console.log("=====================================");
  }, [connected, publicKey]);

  return null;
}
