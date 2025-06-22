import { createSolanaClient } from "gill";

export const LABS_TOKEN_MINT = "LABSh5DTebUcUbEoLzXKCiXFJLecDFiDWiBGUU1GpxR";
export const XLABS_TOKEN_MINT = "";

export const MAINNET_RPC_URL = "https://api.mainnet-beta.solana.com ";

export const TEST_TOKEN_MINT = "2edbfZ4FdrkSrxYDsZEwVHP2QfFpbuXpgtfHgJA1G2pg";
export const xTEST_TOKEN_MINT = "11111111111111111111111111111111";

export const DEVNET_RPC_URL = "https://api.devnet.solana.com";

export const ADMIN_PANEL_ACCESS_ADDRESS = "3zxtSkehQA7Dtknwkt95FMnp4h4MDWYHM1epj9xeRsof"
// APY configuration (in percentage)
export const STAKE_APY = 15; // 15% APY

export const solanaClient = createSolanaClient({
  urlOrMoniker: DEVNET_RPC_URL, // Triton Devnet
});

export const { rpc, rpcSubscriptions, sendAndConfirmTransaction } = solanaClient;
