import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useWalletUi, useWalletUiSigner } from "@wallet-ui/react"
import { useWalletTransactionSignAndSend } from "../solana/use-wallet-transaction-sign-and-send"
import { generateKeyPairSigner } from "gill"
import { toastTx } from "../toast-tx"
import { toast } from 'sonner'
import { getDeleteStakePoolConfigInstruction, getDeleteStakePoolInstruction, getInitializeStakePoolConfigInstruction, getInitializeStakePoolInstruction, getInitializeXlabsMintInstruction, getUpdateStakePoolConfigInstruction } from "@program-client"
import { useLabsMintAddress, useStakePoolAddress, useStakePoolConfigAddress, useVaultAddress, useXLabsMintAddress } from "../shared/data-access"
import { TOKEN_PROGRAM_ADDRESS } from "gill/programs"

export function useInitializeXLabsMutation() {
    const { cluster } = useWalletUi()
    const queryClient = useQueryClient()
    const signer = useWalletUiSigner()
    const signAndSend = useWalletTransactionSignAndSend()
    const xlabsMintAddress = useXLabsMintAddress()
    return useMutation({
        mutationFn: async () => {
            if (xlabsMintAddress.isLoading || !xlabsMintAddress.data) {
                throw new Error('XLabs mint address not found')
            }
            return await signAndSend(getInitializeXlabsMintInstruction(
                {
                    signer: signer,
                    mint: xlabsMintAddress.data[0],
                    decimals: 9
                }),
                signer)
        },
        onSuccess: async (tx) => {
            toastTx(tx)
        },
        onError: (error, variables, context) => {
            console.error('Mutation failed:', error)
            toast.error(`Failed to run program: ${error.message}`)
        },
    })
}
export function useInitializeStakePoolConfigMutation() {
    const signer = useWalletUiSigner()
    const signAndSend = useWalletTransactionSignAndSend()
    const xlabsMintAddress = useXLabsMintAddress()
    const labsMintAddress = useLabsMintAddress()
    const configAddressQuery = useStakePoolConfigAddress()
    return useMutation({
        mutationFn: async (aprBps: number | bigint) => {
            if (xlabsMintAddress.isLoading || !xlabsMintAddress.data
                || configAddressQuery.isLoading || !configAddressQuery.data) {
                throw new Error('XLabs mint address not found')
            }
            return await signAndSend(getInitializeStakePoolConfigInstruction(
                {
                    signer: signer,
                    config: configAddressQuery.data[0],
                    stakeMint: labsMintAddress,
                    rewardMint: xlabsMintAddress.data[0],
                    aprBps: aprBps
                }),
                signer)
        },
        onSuccess: async (tx) => {
            toastTx(tx)
            // Invalidate relevant queries to refresh admin UI
            await queryClient.invalidateQueries({ queryKey: ['xlabs-mint-address'] })
            await queryClient.invalidateQueries({ queryKey: ['stake-pool-config-data'] })
            await queryClient.invalidateQueries({ queryKey: ['vault-account'] })
        },
        onError: (error, variables, context) => {
            console.error('Mutation failed:', error)
            toast.error(`Failed to run program: ${error.message}`)
        },
    })
}

export function useDeleteStakePoolConfigMutation() {
    const signer = useWalletUiSigner()
    const signAndSend = useWalletTransactionSignAndSend()
    const configAddressQuery = useStakePoolConfigAddress()
    return useMutation({
        mutationFn: async () => {
            if (configAddressQuery.isLoading || !configAddressQuery.data) {
                throw new Error('Stake pool config address not found')
            }
            return await signAndSend(getDeleteStakePoolConfigInstruction(
                {
                    authority: signer,
                    config: configAddressQuery.data[0],
                }),
                signer)
        },
        onSuccess: async (tx) => {
            toastTx(tx)
            // Invalidate relevant queries to refresh admin UI
            await queryClient.invalidateQueries({ queryKey: ['xlabs-mint-address'] })
            await queryClient.invalidateQueries({ queryKey: ['stake-pool-config-data'] })
            await queryClient.invalidateQueries({ queryKey: ['vault-account'] })
        },
        onError: (error, variables, context) => {
            console.error('Mutation failed:', error)
            toast.error(`Failed to run program: ${error.message}`)
        },
    })
}
export function useInitializeStakePoolMutation() {
    const signer = useWalletUiSigner()
    const signAndSend = useWalletTransactionSignAndSend()
    const xlabsMintAddress = useXLabsMintAddress()
    const labsMintAddress = useLabsMintAddress()
    const configAddressQuery = useStakePoolConfigAddress()
    const stakePoolAddressQuery = useStakePoolAddress()
    const vaultAddressQuery = useVaultAddress()
    return useMutation({
        mutationFn: async () => {
            if (xlabsMintAddress.isLoading || !xlabsMintAddress.data
                || configAddressQuery.isLoading || !configAddressQuery.data
                || stakePoolAddressQuery.isLoading || !stakePoolAddressQuery.data
                || vaultAddressQuery.isLoading || !vaultAddressQuery.data) {
                throw new Error('XLabs mint address not found')
            }
            return await signAndSend(getInitializeStakePoolInstruction(
                {
                    authority: signer,
                    config: configAddressQuery.data[0],
                    stakePool: stakePoolAddressQuery.data[0],
                    vault: vaultAddressQuery.data,
                    stakeMint: labsMintAddress,
                }),
                signer)
        },
        onSuccess: async (tx) => {
            toastTx(tx)
            // Invalidate relevant queries to refresh admin UI
            await queryClient.invalidateQueries({ queryKey: ['xlabs-mint-address'] })
            await queryClient.invalidateQueries({ queryKey: ['stake-pool-config-data'] })
            await queryClient.invalidateQueries({ queryKey: ['vault-account'] })
        },
        onError: (error, variables, context) => {
            console.error('Mutation failed:', error)
            toast.error(`Failed to run program: ${error.message}`)
        },
    })
}

export function useDeleteStakePoolMutation() {
    const signer = useWalletUiSigner()
    const signAndSend = useWalletTransactionSignAndSend()
    const xlabsMintAddress = useXLabsMintAddress()
    const labsMintAddress = useLabsMintAddress()
    const configAddressQuery = useStakePoolConfigAddress()
    const stakePoolAddressQuery = useStakePoolAddress()
    const vaultAddressQuery = useVaultAddress()
    return useMutation({
        mutationFn: async () => {
            if (xlabsMintAddress.isLoading || !xlabsMintAddress.data
                || configAddressQuery.isLoading || !configAddressQuery.data
                || stakePoolAddressQuery.isLoading || !stakePoolAddressQuery.data
                || vaultAddressQuery.isLoading || !vaultAddressQuery.data) {
                throw new Error('XLabs mint address not found')
            }
            return await signAndSend(getDeleteStakePoolInstruction(
                {
                    authority: signer,
                    config: configAddressQuery.data[0],
                    stakePool: stakePoolAddressQuery.data[0],
                    vault: vaultAddressQuery.data,
                    stakeMint: labsMintAddress,
                }),
                signer)
        },
        onSuccess: async (tx) => {
            toastTx(tx)
            // Invalidate relevant queries to refresh admin UI
            await queryClient.invalidateQueries({ queryKey: ['xlabs-mint-address'] })
            await queryClient.invalidateQueries({ queryKey: ['stake-pool-config-data'] })
            await queryClient.invalidateQueries({ queryKey: ['vault-account'] })
        },
        onError: (error, variables, context) => {
            console.error('Mutation failed:', error)
            toast.error(`Failed to run program: ${error.message}`)
        },
    })
}

export function useUpdateStakePoolConfigMutation() {
    const signer = useWalletUiSigner()
    const signAndSend = useWalletTransactionSignAndSend()
    const configAddressQuery = useStakePoolConfigAddress()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (aprBps: number | bigint) => {
            if (configAddressQuery.isLoading || !configAddressQuery.data) {
                throw new Error('Stake pool config address not found')
            }
            return await signAndSend(getUpdateStakePoolConfigInstruction(
                {
                    authority: signer,
                    config: configAddressQuery.data[0],
                    aprBps: aprBps
                }),
                signer)
        },
        onSuccess: async (tx) => {
            toastTx(tx)
            // Invalidate stake pool config queries to refresh the data
            await queryClient.invalidateQueries({ queryKey: ['stake-pool-config-data'] })
        },
        onError: (error, variables, context) => {
            console.error('Mutation failed:', error)
            toast.error(`Failed to update stake pool config: ${error.message}`)
        },
    })
}