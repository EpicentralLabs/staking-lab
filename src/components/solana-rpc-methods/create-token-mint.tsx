import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { 
  Transaction, 
  PublicKey, 
  Keypair, 
  SystemProgram,
  Connection
} from "@solana/web3.js";
import { 
  createInitializeMintInstruction, 
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { 
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as METADATA_PROGRAM_ID 
} from "@metaplex-foundation/mpl-token-metadata";

/**
 * Creates a new xLABS token mint on Solana, including its metadata.
 * 
 * @param walletPublicKey - The public key of the wallet creating the mint (payer, mint authority, update authority)
 * @param sendTransaction - Function to send a transaction, typically from wallet adapter
 * @param connection - Solana connection object
 * @returns An object containing the transaction signature, mint address, and Solscan explorer URL
 */
export async function createXLabsTokenMint(
  walletPublicKey: PublicKey,
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>,
  connection: Connection
) {
  // Generate a new keypair for the mint account (this will be the new token mint)
  const mintKeypair = Keypair.generate();
  
  // Calculate the minimum lamports required for rent exemption for a mint account
  const lamports = await getMinimumBalanceForRentExemptMint(connection);
  
  // Derive the PDA (Program Derived Address) for the token metadata account
  const [metadataAddress] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );

  // Build the transaction to:
  // 1. Create the mint account
  // 2. Initialize the mint
  // 3. Create the metadata account for the mint
  const transaction = new Transaction().add(
    // 1. Create the mint account
    SystemProgram.createAccount({
      fromPubkey: walletPublicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    
    // 2. Initialize the mint with 9 decimals, wallet as mint and freeze authority
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      9, // decimals
      walletPublicKey, // mint authority
      walletPublicKey, // freeze authority
      TOKEN_PROGRAM_ID
    ),
    
    // 3. Create the metadata account for the mint
    createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataAddress,
        mint: mintKeypair.publicKey,
        mintAuthority: walletPublicKey, // TODO: Change to deployed Solana Staking Program for production
        payer: walletPublicKey,
        updateAuthority: walletPublicKey, // TODO: Change to deployed Solana Staking Program for production
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: "xLABS",
            symbol: "xLABS",
            uri: "https://raw.githubusercontent.com/EpicentralLabs/media-kit/refs/heads/master/misc/uri.json", // Off-chain metadata URI
            sellerFeeBasisPoints: 0, // No royalties
            creators: null,
            collection: null,
            uses: null,
          },
          isMutable: false, // Metadata is immutable
          collectionDetails: null,
        },
      }
    )
  );

  // Fetch a recent blockhash for the transaction
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = walletPublicKey;

  // The mint account must be signed by its keypair (as it's being created)
  transaction.partialSign(mintKeypair);

  // Send the transaction (wallet will sign for the fee payer and authorities)
  const signature = await sendTransaction(transaction, connection);

  // Log useful information for debugging and user feedback
  console.log("xLABS Token mint created successfully!");
  console.log("Transaction signature:", signature);
  console.log("Mint address:", mintKeypair.publicKey.toBase58());

  // Return relevant information for UI/UX
  return {
    signature,
    mintAddress: mintKeypair.publicKey.toBase58(),
    explorerUrl: `https://solscan.io/token/${mintKeypair.publicKey.toBase58()}?cluster=devnet`
  };
}

/**
 * React hook to provide a convenient interface for creating the xLABS token mint.
 * Handles wallet and connection context.
 * 
 * @returns { createTokenMint } - Function to call to create the xLABS mint
 */
export function useCreateXLabsTokenMint() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  /**
   * Calls createXLabsTokenMint with the current wallet and connection context.
   * Throws if wallet is not connected.
   */
  const createTokenMint = async () => {
    if (!publicKey || !sendTransaction) {
      throw new Error("Wallet not connected");
    }

    return await createXLabsTokenMint(
      publicKey,
      sendTransaction,
      connection
    );
  };

  return { createTokenMint };
}