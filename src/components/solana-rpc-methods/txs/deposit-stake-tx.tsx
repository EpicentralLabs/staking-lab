import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  getSignatureFromTransaction,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
  signTransactionMessageWithSigners
} from "@solana/kit";
import {
  findAssociatedTokenPda,
  getTransferInstruction,
  TOKEN_2022_PROGRAM_ADDRESS
} from "gill/programs/token";
import { DEVNET_RPC_URL, TEST_TOKEN_MINT } from "@/lib/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { address } from "gill";

// Function to convert string amount to BigInt (handling decimals)
const convertToBigInt = (amount: string): bigint => {
  // Convert to smallest unit (assuming 9 decimals like most Solana tokens)
  const DECIMALS = 9;
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(DECIMALS, '0').slice(0, DECIMALS);
  return BigInt(whole + paddedFraction);
};

export const transferTokens = async (stakeAmount: string) => {
  // Create connection to RPC
  const rpc = createSolanaRpc(DEVNET_RPC_URL);
  const rpcSubscriptions = createSolanaRpcSubscriptions(DEVNET_RPC_URL.replace('http', 'ws'));

  // Get the connected wallet
  const { publicKey, signTransaction } = useWallet();
  if (!publicKey || !signTransaction) {
    throw new Error("Wallet not connected");
  }

  // Define token mint and recipient address
  const mint = address(TEST_TOKEN_MINT);
  const recipientAddress = address("11111111111111111111111111111111"); // Test recipient address

  // Get the latest blockhash
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  // Derive the ATAs for sender and recipient
  const [senderAssociatedTokenAddress] = await findAssociatedTokenPda({
    mint,
    owner: address(publicKey.toBase58()),
    tokenProgram: TOKEN_2022_PROGRAM_ADDRESS
  });

  const [recipientAssociatedTokenAddress] = await findAssociatedTokenPda({
    mint,
    owner: recipientAddress,
    tokenProgram: TOKEN_2022_PROGRAM_ADDRESS
  });

  // Convert stake amount to BigInt
  const amountBigInt = convertToBigInt(stakeAmount);

  // Create instruction to transfer tokens
  const transferInstruction = getTransferInstruction({
    source: senderAssociatedTokenAddress,
    destination: recipientAssociatedTokenAddress,
    authority: address(publicKey.toBase58()),
    amount: amountBigInt
  });

  // Create transaction message for token transfer
  const transferTxMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(signTransaction as any, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstructions([transferInstruction], tx)
  );

  // Sign transaction message with all required signers
  const signedTransferTx = await signTransactionMessageWithSigners(transferTxMessage);

  // Send and confirm transaction
  await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(signedTransferTx, {
    commitment: "confirmed"
  });

  // Get transaction signature
  const transferTxSignature = getSignatureFromTransaction(signedTransferTx);

  console.log("Transaction Signature:", transferTxSignature);
  console.log("Successfully transferred tokens from sender to recipient");
  
  return transferTxSignature;
}; 