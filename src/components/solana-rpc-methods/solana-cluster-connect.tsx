import { DEVNET_RPC_URL } from "@/lib/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { createSolanaRpc, createSolanaRpcSubscriptions, sendAndConfirmTransactionFactory } from "@solana/kit";

// Create and export RPC connection
export const rpc = createSolanaRpc(DEVNET_RPC_URL);
export const rpcSubscriptions = createSolanaRpcSubscriptions(DEVNET_RPC_URL.replace('http', 'ws'));
export const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });

export function SolanaClusterConnect() {
  const { connected } = useWallet();
  const { publicKey } = useWallet();

  useEffect(() => {
    console.log("Wallet connection status:", connected);
    console.log("Current RPC URL:", DEVNET_RPC_URL);
    console.log("Current Public Key:", publicKey?.toString());
  }, [connected, publicKey]);

  return null;
}
