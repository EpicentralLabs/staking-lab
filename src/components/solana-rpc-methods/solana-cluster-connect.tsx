import { DEVNET_RPC_URL } from "@/lib/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { rpc, rpcSubscriptions, sendAndConfirmTransaction } from "@/lib/constants";

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
