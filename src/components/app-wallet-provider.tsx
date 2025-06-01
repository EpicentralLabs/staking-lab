"use client";

import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { DEVNET_RPC_URL } from "@/lib/constants";
// import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

export default function AppWalletProvider({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const endpoint = useMemo(() => DEVNET_RPC_URL, []);
    const wallets = useMemo(
      () => [
        // manually add any legacy wallet adapters here
        // new UnsafeBurnerWalletAdapter(),
      ],
      [],
    );
  
    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  }