import { createSolanaClient, getMinimumBalanceForRentExemption } from "gill";
import { generateKeyPairSigner } from "gill";
import { createTransaction } from "gill";
import {
  getTokenMetadataAddress, 
  getCreateAccountInstruction, 
  getInitializeMintInstruction, 
  getCreateMetadataAccountV3Instruction, 
} from "gill/programs";
import { getMintSize } from "gill/programs/token";
import { type KeyPairSigner } from "gill";
import { loadKeypairSignerFromFile } from "gill/node";

import { TOKEN_2022_PROGRAM_ADDRESS } from "gill/programs/token";

const tokenProgram = TOKEN_2022_PROGRAM_ADDRESS; // get the token program address

const { rpc, sendAndConfirmTransaction } = createSolanaClient({
    urlOrMoniker: process.env.NEXT_PUBLIC_TRITON_DEVNET_RPC_URL as any, // `mainnet`, `localnet`, etc
  });

// This defaults to the file path used by the Solana CLI: `~/.config/solana/id.json`
const signer: KeyPairSigner = await loadKeypairSignerFromFile();
console.log("signer:", signer.address); // get the signer address

const mint = await generateKeyPairSigner(); // generate a new mint account
const metadataAddress = await getTokenMetadataAddress(mint);

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send(); // get latest blockhash

const space = getMintSize(); // get the mint size

// Create a transaction to create a token with metadata
const transaction = createTransaction({
  feePayer: signer,
  version: "legacy",
  instructions: [
    getCreateAccountInstruction({
      space,
      lamports: getMinimumBalanceForRentExemption(space),
      newAccount: mint,
      payer: signer,
      programAddress: tokenProgram,
    }),
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
      isMutable: true,
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
        name: "",
        symbol: "",
        uri: "",
      },
    }),
  ],
  latestBlockhash,
});

const signature = await sendAndConfirmTransaction(transaction);
console.log("signature:", signature);