import { createSolanaClient } from "gill";

export const LABS_TOKEN_MINT = "LABSh5DTebUcUbEoLzXKCiXFJLecDFiDWiBGUU1GpxR";
export const XLABS_TOKEN_MINT = "";
export const MAINNET_RPC_URL = "https://epicentr-solanam-cb95.mainnet.rpcpool.com/bd0b551c-d1af-44bb-9a7e-1e88171a721c";

export const TEST_TOKEN_MINT = "2edbfZ4FdrkSrxYDsZEwVHP2QfFpbuXpgtfHgJA1G2pg";
export const xTEST_TOKEN_MINT = "11111111111111111111111111111111";

export const DEVNET_RPC_URL = "https://epicentr-solanad-4efb.devnet.rpcpool.com/c598cabe-b1dc-4ef9-bdc1-1a2981c9bf5f";

// APY configuration (in percentage)
export const STAKE_APY = 12.5; // 12.5% APY

export const solanaClient = createSolanaClient({
  urlOrMoniker: DEVNET_RPC_URL, // Triton Devnet
});

export const { rpc, rpcSubscriptions, sendAndConfirmTransaction } = solanaClient;
