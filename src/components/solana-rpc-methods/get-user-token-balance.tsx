import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { address, createSolanaRpc } from "@solana/kit";
import { rpcUrl, LABS_TOKEN_MINT } from "@/lib/constants";


export function TokenBalance() {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!publicKey) {
        setBalance(0);
        return;
      }
      
      try {
        const rpc = createSolanaRpc(rpcUrl);
        const owner = address(publicKey.toString());
        const tokenProgram = address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

        // Get all token accounts for the owner
        const tokenAccounts = await rpc
          .getTokenAccountsByOwner(
            owner,
            { programId: tokenProgram },
            { encoding: "jsonParsed" }
          )
          .send();

        // Filter accounts for our specific mint and sum up balances
        const totalBalance = tokenAccounts.value.reduce((acc, account) => {
          const accountInfo = account.account.data.parsed.info;
          if (accountInfo.mint === LABS_TOKEN_MINT) {
            return acc + (Number(accountInfo.tokenAmount.amount) / Math.pow(10, accountInfo.tokenAmount.decimals) || 0); // Raw number of tokens divuded by decimals to get actual token count.
          }
          return acc;
        }, 0);

        console.log("Token Balance:", totalBalance);
        setBalance(totalBalance);
      } catch (error) {
        console.error("Error fetching token balance:", error);
        setBalance(0);
      }
    };

    fetchTokenBalance();
    // Set up an interval to refresh the balance every 10 seconds
    const intervalId = setInterval(fetchTokenBalance, 10000);

    return () => clearInterval(intervalId);
  }, [publicKey]);

  return balance;
}