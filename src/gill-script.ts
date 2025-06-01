import { createTransaction, getSignatureFromTransaction, signTransactionMessageWithSigners } from "gill";
import { getAddMemoInstruction } from "gill/programs";
import { loadKeypairSignerFromFile } from "gill/node";
import { rpc, sendAndConfirmTransaction } from "./components/solana-rpc-methods/solana-cluster-connect";

const signer = await loadKeypairSignerFromFile();
console.log("signer:", signer.address);

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
const { value: balance } = await rpc.getBalance(signer.address).send();
console.log("balance:", balance);

const memoIx = getAddMemoInstruction({
    memo: "Hello, Solana!",
})

const tx = createTransaction({
    version: "legacy",
    feePayer: signer,
    computeUnitLimit: 10000,
    computeUnitPrice: 1000, // 0.001 SOL
    instructions: [memoIx],
    latestBlockhash,

});
console.log("transaction:");
console.log("tx:", tx);

const signedTransaction = await signTransactionMessageWithSigners(tx)
console.log("Signed transaction:", signedTransaction);

const sig = getSignatureFromTransaction(signedTransaction);
console.log("signature:", sig);

await sendAndConfirmTransaction(signedTransaction);