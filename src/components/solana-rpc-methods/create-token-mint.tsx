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

export async function createXLabsTokenMint(
  walletPublicKey: PublicKey,
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>,
  connection: Connection
) {
  // Generate a new keypair for the mint
  const mintKeypair = Keypair.generate();
  
  // Calculate rent exemption
  const lamports = await getMinimumBalanceForRentExemptMint(connection);
  
  // Create metadata account address
  const [metadataAddress] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );

  // Create the transaction
  const transaction = new Transaction().add(
    // Create mint account
    SystemProgram.createAccount({
      fromPubkey: walletPublicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    
    // Initialize mint
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      9, // decimals
      walletPublicKey, // mint authority
      walletPublicKey, // freeze authority
      TOKEN_PROGRAM_ID
    ),
    
    // Create metadata account
    createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataAddress,
        mint: mintKeypair.publicKey,
        mintAuthority: walletPublicKey,
        payer: walletPublicKey,
        updateAuthority: walletPublicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: "xLABS",
            symbol: "xLABS",
            uri: "https://raw.githubusercontent.com/EpicentralLabs/media-kit/refs/heads/master/misc/uri.json",
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null,
          },
          isMutable: false,
          collectionDetails: null,
        },
      }
    )
  );

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = walletPublicKey;

  // Partially sign with the mint keypair
  transaction.partialSign(mintKeypair);

  // Send transaction (wallet will sign with user's key)
  const signature = await sendTransaction(transaction, connection);

  console.log("xLABS Token mint created successfully!");
  console.log("Transaction signature:", signature);
  console.log("Mint address:", mintKeypair.publicKey.toBase58());
  console.log("View on Solscan:", `https://solscan.io/token/${mintKeypair.publicKey.toBase58()}?cluster=devnet`);

  return {
    signature,
    mintAddress: mintKeypair.publicKey.toBase58(),
    explorerUrl: `https://solscan.io/token/${mintKeypair.publicKey.toBase58()}?cluster=devnet`
  };
}

// React hook for using the create token mint function
export function useCreateXLabsTokenMint() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

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