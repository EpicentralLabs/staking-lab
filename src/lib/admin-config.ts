// Whitelisted admin wallet addresses
export const ADMIN_WALLETS: string[] = [
  "8C9yaHEhc348upam4mJuY554ZvjrnmBsftcYTuRGZ4bT"
  // Add admin wallet public keys here
  // Example: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
]

/**
 * Check if a wallet address is whitelisted for admin access
 * @param address - The wallet's address as a string
 * @returns boolean - true if the wallet is whitelisted
 */
export function isAdminWallet(address: string | null | undefined): boolean {
  if (!address) return false
  return ADMIN_WALLETS.includes(address)
}