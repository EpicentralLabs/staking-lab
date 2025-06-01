import {
  address,
  createTransaction,
  createSolanaClient,
  signTransactionMessageWithSigners,
  generateKeyPairSigner,
  createSolanaRpc,
  getSignatureFromTransaction,
} from "gill";
import {
  getAssociatedTokenAccountAddress,
  getCreateAssociatedTokenIdempotentInstruction,
  TOKEN_2022_PROGRAM_ADDRESS
} from "gill/programs/token";
import { DEVNET_RPC_URL, TEST_TOKEN_MINT } from "@/lib/constants";
import { useWallet } from "@solana/wallet-adapter-react";

// Create connection to RPC
const rpc = createSolanaRpc(DEVNET_RPC_URL);

// Define feePayer and ensure wallet is connected
const { publicKey } = useWallet();
if (!publicKey) {
  throw new Error("Wallet not connected");
}

// Define token mint
const mint = address(TEST_TOKEN_MINT);

// Get the latest blockhash
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

// Generate a signer for the transaction
const signer = await generateKeyPairSigner();

// Get the associated token account address
const destinationAta = await getAssociatedTokenAccountAddress(
  mint,
  address(publicKey.toBase58()),
  TOKEN_2022_PROGRAM_ADDRESS
);

// Create the transaction
const transaction = createTransaction({
  feePayer: signer,
  version: "legacy",
  instructions: [
    getCreateAssociatedTokenIdempotentInstruction({
      mint,
      payer: signer,
      tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
      owner: address(publicKey.toBase58()),
      ata: destinationAta
    })
  ],
  latestBlockhash
});

// Sign and send the transaction
const signedTransaction = await signTransactionMessageWithSigners(transaction);
console.log(signedTransaction);

// Get the signature from the transaction
const signature: string = getSignatureFromTransaction(signedTransaction);
console.log(signature);