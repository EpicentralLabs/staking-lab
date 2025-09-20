import { getStakingProgramProgramId } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { address, generateKeyPairSigner, getProgramDerivedAddress } from 'gill'
import { useWalletUi } from '@wallet-ui/react'
import { useWalletTransactionSignAndSend } from '../solana/use-wallet-transaction-sign-and-send'
import { useClusterVersion } from '@/components/cluster/use-cluster-version'
import { toastTx } from '@/components/toast-tx'
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer'
import { fetchToken, getAssociatedTokenAccountAddress } from 'gill/programs'
import { getAddressEncoder } from 'gill'
import { fetchMaybeStakeAccount, fetchStakeAccount, getStakeAccountCodec, fetchStakePool, fetchStakePoolConfig } from '@program-client'

export function useStakingProgramProgramId() {
    const { cluster } = useWalletUi()
    return useMemo(() => getStakingProgramProgramId(cluster.id), [cluster])
}

export function useStakingProgram() {
    const { client, cluster } = useWalletUi()
    const programId = useStakingProgramProgramId()
    const query = useClusterVersion()

    return useQuery({
        retry: false,
        queryKey: ['get-program-account', { cluster, clusterVersion: query.data }],
        queryFn: () => client.rpc.getAccountInfo(programId).send(),
        enabled: !!query.data, // Only run when cluster version is available
    })
}
export function useLabsMintAddress() {
    // this is just the test mint address
    return useMemo(() => { return address("5xMz2PeLhC3t2dm5FBDq5GRAaA46PPQvTPBKEdRyppct") }, [])
}
export function useXLabsMintAddress() {
    const { cluster } = useWalletUi()
    const programId = useStakingProgramProgramId()
    const query = useClusterVersion()

    return useQuery({
        retry: false,
        queryKey: ['xlabs-mint-address', { cluster, clusterVersion: query.data }],
        queryFn: () => getProgramDerivedAddress({ programAddress: programId, seeds: ["xlabs_mint"] }),
        enabled: !!query.data, // Only run when cluster version is available
    })
}
export function useStakePoolConfigAddress() {
    const { cluster } = useWalletUi()
    const programId = useStakingProgramProgramId()
    const query = useClusterVersion()

    return useQuery({
        retry: false,
        queryKey: ['stake-pool-config-address', { cluster, clusterVersion: query.data }],
        queryFn: () => getProgramDerivedAddress({ programAddress: programId, seeds: ["config"] }),
        enabled: !!query.data, // Only run when cluster version is available
    })
}
export function useStakePoolAddress() {
    const { cluster } = useWalletUi()
    const programId = useStakingProgramProgramId()
    const query = useClusterVersion()

    return useQuery({
        retry: false,
        queryKey: ['stake-pool-address', { cluster, clusterVersion: query.data }],
        queryFn: () => getProgramDerivedAddress({ programAddress: programId, seeds: ["stake_pool"] }),
        enabled: !!query.data, // Only run when cluster version is available
    })
}
export function useVaultAddress() {
    const { cluster } = useWalletUi()
    const query = useClusterVersion()
    const labsMint = useLabsMintAddress()
    const stakePoolAddress = useStakePoolAddress()

    return useQuery({
        retry: false,
        queryKey: ['vault-address', { cluster, clusterVersion: query.data, stakePoolAddress: stakePoolAddress.data?.[0] }],
        queryFn: () => getAssociatedTokenAccountAddress(labsMint, stakePoolAddress.data![0]),
        enabled: !!stakePoolAddress.data?.[0] && !!query.data, // Only run when dependencies are ready
    })
}
export function useVaultAccount() {
    const { cluster, client } = useWalletUi()
    const query = useClusterVersion()
    const labsMint = useLabsMintAddress()
    const stakePoolAddress = useStakePoolAddress()
    const vaultAddressQuery = useVaultAddress()
    return useQuery({
        retry: false,
        queryKey: ['vault-account', { cluster, clusterVersion: query.data, stakePoolAddress: stakePoolAddress.data?.[0] }],
        queryFn: async () => {
            try {
                return await fetchToken(client.rpc, vaultAddressQuery.data!)
            } catch (error) {
                // Token account doesn't exist, return null or a default state
                return null
            }
        },
        enabled: !!vaultAddressQuery.data && !!stakePoolAddress.data?.[0] && !!query.data, // Only run when dependencies are ready
    })
}
export function useStakeAccountAddress() {
    const { cluster, account } = useWalletUi()
    const programId = useStakingProgramProgramId()
    const query = useClusterVersion()
    const stakePoolAddress = useStakePoolAddress()
    const addressEncoder = getAddressEncoder();

    return useQuery({
        retry: false,
        queryKey: ['stake-account', { cluster, clusterVersion: query.data, accountPublicKey: account?.publicKey }],
        queryFn: () => getProgramDerivedAddress(
            {
                programAddress: programId,
                seeds:
                    [
                        Buffer.from("stake_account"),
                        addressEncoder.encode(stakePoolAddress.data![0]),
                        account!.publicKey
                    ]
            }
        ),
        enabled: !!stakePoolAddress.data?.[0] && !!query.data && !!account?.publicKey,
    })
}
export function useLabsUserAssociatedTokenAccount() {
    const { cluster, account } = useWalletUi()
    const query = useClusterVersion()
    const labsMint = useLabsMintAddress()
    return useQuery({
        retry: false,
        queryKey: ['labs-user-associated-token-account', { cluster, clusterVersion: query.data, accountPublicKey: account?.publicKey }],
        queryFn: () => getAssociatedTokenAccountAddress(labsMint, address(account!.address.toString())),
        enabled: !!query.data && !!account?.publicKey, // Only run when dependencies are ready
    })
}
export function useXLabsUserAssociatedTokenAccount() {
    const { cluster, account } = useWalletUi()
    const query = useClusterVersion()
    const xLabsMintAddress = useXLabsMintAddress()
    return useQuery({
        retry: false,
        queryKey: ['xlabs-user-associated-token-account', { cluster, clusterVersion: query.data, accountPublicKey: account?.publicKey }],
        queryFn: () => getAssociatedTokenAccountAddress(xLabsMintAddress.data![0], address(account!.address.toString())),
        enabled: !!query.data && !!account?.publicKey && !!xLabsMintAddress.data?.[0], // Only run when dependencies are ready
    })
}
export function useUserLabsAccount() {
    const { cluster, account, client } = useWalletUi()
    const query = useClusterVersion()
    const labsMintAddressQuery = useLabsUserAssociatedTokenAccount()
    return useQuery({
        retry: false,
        queryKey: ['user-labs-account', { cluster, clusterVersion: query.data, accountPublicKey: account?.publicKey }],
        queryFn: async () => {
            try {
                return await fetchToken(client.rpc, labsMintAddressQuery.data!)
            } catch (error) {
                // Token account doesn't exist, return null or a default state
                return null
            }
        },
        enabled: !!query.data && !!account?.publicKey && !!labsMintAddressQuery.data, // Only run when dependencies are ready
    })
}
export function useUserXLabsAccount() {
    const { cluster, account, client } = useWalletUi()
    const query = useClusterVersion()
    const xLabsMintAddressQuery = useXLabsUserAssociatedTokenAccount()
    return useQuery({
        retry: false,
        queryKey: ['user-xlabs-account', { cluster, clusterVersion: query.data, accountPublicKey: account?.publicKey }],
        queryFn: async () => {
            try {
                return await fetchToken(client.rpc, xLabsMintAddressQuery.data!)
            } catch (error) {
                // Token account doesn't exist, return null or a default state
                return null
            }
        },
        enabled: !!query.data && !!account?.publicKey && !!xLabsMintAddressQuery.data, // Only run when dependencies are ready
    })
}

export function useUserStakeAccount() {
    const { cluster, account, client } = useWalletUi()
    const query = useClusterVersion()
    const stakeAccountAddressQuery = useStakeAccountAddress()

    return useQuery({
        retry: false,
        queryKey: ['user-stake-account', { cluster, clusterVersion: query.data, accountPublicKey: account?.publicKey }],
        queryFn: async () => fetchMaybeStakeAccount(client.rpc, stakeAccountAddressQuery.data![0]),
        enabled: !!query.data && !!account?.publicKey && !!stakeAccountAddressQuery.data?.[0], // Only run when dependencies are ready
    })
}

export function useStakePoolData() {
    const { cluster, client } = useWalletUi()
    const query = useClusterVersion()
    const stakePoolAddressQuery = useStakePoolAddress()

    return useQuery({
        retry: false,
        queryKey: ['stake-pool-data', { cluster, clusterVersion: query.data, stakePoolAddress: stakePoolAddressQuery.data?.[0] }],
        queryFn: async () => fetchStakePool(client.rpc, stakePoolAddressQuery.data![0]),
        enabled: !!query.data && !!stakePoolAddressQuery.data?.[0], // Only run when dependencies are ready
    })
}

export function useStakePoolConfigData() {
    const { cluster, client } = useWalletUi()
    const query = useClusterVersion()
    const stakePoolConfigAddressQuery = useStakePoolConfigAddress()

    return useQuery({
        retry: false,
        queryKey: ['stake-pool-config-data', { cluster, clusterVersion: query.data, stakePoolConfigAddress: stakePoolConfigAddressQuery.data?.[0] }],
        queryFn: async () => fetchStakePoolConfig(client.rpc, stakePoolConfigAddressQuery.data![0]),
        enabled: !!query.data && !!stakePoolConfigAddressQuery.data?.[0], // Only run when dependencies are ready
    })
}