import { createSolanaClient, getMinimumBalanceForRentExemption } from "gill";
import { generateKeyPairSigner } from "gill";
import { createTransaction } from "gill";
import {
  getCreateAccountInstruction, 
  getCreateMetadataAccountV3Instruction, 
  getInitializeMintInstruction,
  getTokenMetadataAddress, 
} from "gill/programs";
import { getMintSize } from "gill/programs/token";
import { type KeyPairSigner } from "gill";
import { loadKeypairSignerFromFile } from "gill/node";
import { TOKEN_PROGRAM_ADDRESS } from "gill/programs/token";
import { DEVNET_RPC_URL } from "@/lib/constants";

const tokenProgram = TOKEN_PROGRAM_ADDRESS; // Token-2022 program

const { rpc, sendAndConfirmTransaction } = createSolanaClient({
    urlOrMoniker: DEVNET_RPC_URL as any,
  });

// Load the signer from the default Solana CLI keypair file
const signer: KeyPairSigner = await loadKeypairSignerFromFile();
console.log("signer:", signer.address);

const mint = await generateKeyPairSigner(); // generate a new mint account
const metadataAddress = await getTokenMetadataAddress(mint);

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

const space = getMintSize(); // get the basic mint size

// Create a simple Token-2022 mint without metadata
const transaction = createTransaction({
  feePayer: signer,
  version: "legacy",
  instructions: [
    // 1. Create the mint account
    getCreateAccountInstruction({
      space,
      lamports: getMinimumBalanceForRentExemption(space),
      newAccount: mint,
      payer: signer,
      programAddress: tokenProgram,
    }),
    
    // 2. Initialize the mint
    getInitializeMintInstruction(
      {
        mint: mint.address,
        mintAuthority: signer.address,
        freezeAuthority: signer.address,
        decimals: 9,
      },
      {
        programAddress: tokenProgram,
      },
    ),
    getCreateMetadataAccountV3Instruction({
      collectionDetails: null,
      isMutable: false,
      updateAuthority: signer,
      mint: mint.address,
      metadata: metadataAddress,
      mintAuthority: signer,
      payer: signer,
      data: {
        sellerFeeBasisPoints: 0,
        collection: null,
        creators: null,
        uses: null,
        name: "xTEST",
        symbol: "xTEST",
        uri: "https://raw.githubusercontent.com/EpicentralLabs/media-kit/refs/heads/master/misc/uri.json",
      },
    }),
  ],
  latestBlockhash,
});

const signature = await sendAndConfirmTransaction(transaction);
console.log("Token mint created successfully!");
console.log("Transaction signature:", signature);
console.log("Mint address:", mint.address);
console.log("View on Solscan:", `https://solscan.io/token/${mint.address}?cluster=devnet`);