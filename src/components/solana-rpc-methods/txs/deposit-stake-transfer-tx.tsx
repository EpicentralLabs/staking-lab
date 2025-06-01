import {
    getExplorerLink,
    createTransaction,
    createSolanaClient,
    getSignatureFromTransaction,
    signTransactionMessageWithSigners,
  } from "gill";
import { rpc } from "@/lib/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { address } from "@solana/kit";
import { getAddMemoInstruction } from "gill/programs";

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

const { publicKey } = useWallet();

const owner = address(publicKey!.toString());

const StakeDepositMemoIx = getAddMemoInstruction({
  memo: "Staking Deposit...",
});

const tx = createTransaction({
  version: "legacy",
  instructions: [StakeDepositMemoIx],
  latestBlockhash,
  feePayer: address(publicKey!.toString()),
  computeUnitLimit: 1000000,
  computeUnitPrice: 10000, // 0.00001 SOL
});