import { createSolanaClient } from "gill";
import { DEVNET_RPC_URL } from "@/lib/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";

const { rpc, rpcSubscriptions, sendAndConfirmTransaction } = createSolanaClient({
  urlOrMoniker: DEVNET_RPC_URL, // Triton Devnet
});

export function SolanaClusterConnect() {
  const { connected } = useWallet();
  
  useEffect(() => {
    console.log("Wallet connection status:", connected);
    console.log("Current RPC URL:", DEVNET_RPC_URL);
    
    if (connected) {
      console.log("Connected to RPC URL:", DEVNET_RPC_URL);
    } else {
      console.log("Not connected to wallet");
    }
  }, [connected]);

  return null;
}

export { rpc, rpcSubscriptions, sendAndConfirmTransaction };
