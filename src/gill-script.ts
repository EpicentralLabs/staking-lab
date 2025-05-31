import { loadKeypairSignerFromFile } from "gill/node";

const signer = await loadKeypairSignerFromFile();
console.log("signer:", signer.address);