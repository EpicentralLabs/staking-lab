// Here we export some useful types and functions for interacting with the Anchor program.
import { Account, address, getBase58Decoder, SolanaClient } from 'gill'
import { SolanaClusterId } from '@wallet-ui/react'
import { getProgramAccountsDecoded } from './helpers/get-program-accounts-decoded'
import { Stakingfrontend, STAKINGFRONTEND_DISCRIMINATOR, STAKINGFRONTEND_PROGRAM_ADDRESS, getStakingfrontendDecoder } from './client/js'
import StakingfrontendIDL from '../target/idl/stakingfrontend.json'

export type StakingfrontendAccount = Account<Stakingfrontend, string>

// Re-export the generated IDL and type
export { StakingfrontendIDL }

// This is a helper function to get the program ID for the Stakingfrontend program depending on the cluster.
export function getStakingfrontendProgramId(cluster: SolanaClusterId) {
  switch (cluster) {
    case 'solana:devnet':
    case 'solana:testnet':
      // This is the program ID for the Stakingfrontend program on devnet and testnet.
      return address('6z68wfurCMYkZG51s1Et9BJEd9nJGUusjHXNt4dGbNNF')
    case 'solana:mainnet':
    default:
      return STAKINGFRONTEND_PROGRAM_ADDRESS
  }
}

export * from './client/js'

export function getStakingfrontendProgramAccounts(rpc: SolanaClient['rpc']) {
  return getProgramAccountsDecoded(rpc, {
    decoder: getStakingfrontendDecoder(),
    filter: getBase58Decoder().decode(STAKINGFRONTEND_DISCRIMINATOR),
    programAddress: STAKINGFRONTEND_PROGRAM_ADDRESS,
  })
}
