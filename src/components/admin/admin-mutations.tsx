import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useWalletUi, useWalletUiSigner } from "@wallet-ui/react"
import { useWalletTransactionSignAndSend } from "../solana/use-wallet-transaction-sign-and-send"
import { generateKeyPairSigner } from "gill"
import { ProgressiveTransactionToast } from "../ui/transaction-toast"
import { getDeleteStakePoolConfigInstruction, getDeleteStakePoolInstruction, getInitializeStakePoolConfigInstruction, getInitializeStakePoolInstruction, getInitializeXlabsMintInstruction, getUpdateStakePoolConfigInstruction } from "@program-client"
import { useLabsMintAddress, useStakePoolAddress, useStakePoolConfigAddress, useVaultAddress, useXLabsMintAddress } from "../shared/data-access"
import { TOKEN_PROGRAM_ADDRESS } from "gill/programs"

export function useEnhancedInitializeXLabsMutation() {
    const { cluster } = useWalletUi()
    const queryClient = useQueryClient()
    const signer = useWalletUiSigner()
    const signAndSend = useWalletTransactionSignAndSend()
    const xlabsMintAddress = useXLabsMintAddress()

    return useMutation({
        onMutate: async () => {
            const toast = new ProgressiveTransactionToast('Initializing xLABS Mint')
            toast.start()
            return { toast }
        },
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
        onSuccess: async (tx, variables, context) => {
            if (context?.toast) {
                context.toast.success(tx, 'Successfully initialized xLABS mint')
            }
            // Invalidate relevant queries
            await queryClient.invalidateQueries({ queryKey: ['xlabs-mint-address'] })
        },
        onError: (error, variables, context) => {
            if (context?.toast) {
                context.toast.error(`Failed to initialize xLABS mint: ${error.message}`)
            }
        },
    })
}

export function useEnhancedInitializeStakePoolConfigMutation() {
    const signer = useWalletUiSigner()
    const signAndSend = useWalletTransactionSignAndSend()
    const queryClient = useQueryClient()
    const xlabsMintAddress = useXLabsMintAddress()
    const labsMintAddress = useLabsMintAddress()
    const configAddressQuery = useStakePoolConfigAddress()

    return useMutation({
        onMutate: async (aprBps: number | bigint) => {
            const toast = new ProgressiveTransactionToast('Initializing Stake Pool Config')
            toast.start()
            return { toast }
        },
        mutationFn: async (aprBps: number | bigint) => {
            if (xlabsMintAddress.isLoading || !xlabsMintAddress.data
                || configAddressQuery.isLoading || !configAddressQuery.data) {
                throw new Error('Required addresses not found')
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
        onSuccess: async (tx, variables, context) => {
            if (context?.toast) {
                context.toast.success(tx, `Successfully initialized stake pool config with APY: ${Number(variables) / 100}%`)
            }
            // Invalidate relevant queries to refresh admin UI
            await queryClient.invalidateQueries({ queryKey: ['xlabs-mint-address'] })
            await queryClient.invalidateQueries({ queryKey: ['stake-pool-config-data'] })
            await queryClient.invalidateQueries({ queryKey: ['vault-account'] })
        },
        onError: (error, variables, context) => {
            if (context?.toast) {
                context.toast.error(`Failed to initialize stake pool config: ${error.message}`)
            }
        },
    })
}

export function useEnhancedDeleteStakePoolConfigMutation() {
    const signer = useWalletUiSigner()
    const signAndSend = useWalletTransactionSignAndSend()
    const queryClient = useQueryClient()
    const configAddressQuery = useStakePoolConfigAddress()
    const stakePoolAddressQuery = useStakePoolAddress()

    return useMutation({
        onMutate: async () => {
            const toast = new ProgressiveTransactionToast('Deleting Stake Pool Config')
            toast.start()
            return { toast }
        },
        mutationFn: async () => {
            if (configAddressQuery.isLoading || !configAddressQuery.data) {
                throw new Error('Stake pool config address not found')
            }
            if (stakePoolAddressQuery.isLoading || !stakePoolAddressQuery.data) {
                throw new Error('Stake pool address not found')
            }
            return await signAndSend(getDeleteStakePoolConfigInstruction(
                {
                    stakePool: stakePoolAddressQuery.data[0],
                    signer: signer,
                    config: configAddressQuery.data[0],
                }),
                signer)
        },
        onSuccess: async (tx, variables, context) => {
            if (context?.toast) {
                context.toast.success(tx, 'Successfully deleted stake pool config')
            }
            // Invalidate relevant queries to refresh admin UI
            await queryClient.invalidateQueries({ queryKey: ['xlabs-mint-address'] })
            await queryClient.invalidateQueries({ queryKey: ['stake-pool-config-data'] })
            await queryClient.invalidateQueries({ queryKey: ['vault-account'] })
        },
        onError: (error, variables, context) => {
            if (context?.toast) {
                context.toast.error(`Failed to delete stake pool config: ${error.message}`)
            }
        },
    })
}

export function useEnhancedInitializeStakePoolMutation() {
    const signer = useWalletUiSigner()
    const signAndSend = useWalletTransactionSignAndSend()
    const queryClient = useQueryClient()
    const xlabsMintAddress = useXLabsMintAddress()
    const labsMintAddress = useLabsMintAddress()
    const configAddressQuery = useStakePoolConfigAddress()
    const stakePoolAddressQuery = useStakePoolAddress()
    const vaultAddressQuery = useVaultAddress()

    return useMutation({
        onMutate: async () => {
            const toast = new ProgressiveTransactionToast('Initializing Stake Pool')
            toast.start()
            return { toast }
        },
        mutationFn: async () => {
            if (xlabsMintAddress.isLoading || !xlabsMintAddress.data
                || configAddressQuery.isLoading || !configAddressQuery.data
                || stakePoolAddressQuery.isLoading || !stakePoolAddressQuery.data
                || vaultAddressQuery.isLoading || !vaultAddressQuery.data) {
                throw new Error('Required addresses not found')
            }
            return await signAndSend(getInitializeStakePoolInstruction(
                {
                    signer: signer,
                    config: configAddressQuery.data[0],
                    stakePool: stakePoolAddressQuery.data[0],
                    vault: vaultAddressQuery.data,
                    stakeMint: labsMintAddress,
                }),
                signer)
        },
        onSuccess: async (tx, variables, context) => {
            if (context?.toast) {
                context.toast.success(tx, 'Successfully initialized stake pool')
            }
            // Invalidate relevant queries to refresh admin UI
            await queryClient.invalidateQueries({ queryKey: ['xlabs-mint-address'] })
            await queryClient.invalidateQueries({ queryKey: ['stake-pool-config-data'] })
            await queryClient.invalidateQueries({ queryKey: ['vault-account'] })
        },
        onError: (error, variables, context) => {
            if (context?.toast) {
                context.toast.error(`Failed to initialize stake pool: ${error.message}`)
            }
        },
    })
}

export function useEnhancedDeleteStakePoolMutation() {
    const signer = useWalletUiSigner()
    const signAndSend = useWalletTransactionSignAndSend()
    const queryClient = useQueryClient()
    const xlabsMintAddress = useXLabsMintAddress()
    const labsMintAddress = useLabsMintAddress()
    const configAddressQuery = useStakePoolConfigAddress()
    const stakePoolAddressQuery = useStakePoolAddress()
    const vaultAddressQuery = useVaultAddress()

    return useMutation({
        onMutate: async () => {
            const toast = new ProgressiveTransactionToast('Deleting Stake Pool')
            toast.start()
            return { toast }
        },
        mutationFn: async () => {
            if (xlabsMintAddress.isLoading || !xlabsMintAddress.data
                || configAddressQuery.isLoading || !configAddressQuery.data
                || stakePoolAddressQuery.isLoading || !stakePoolAddressQuery.data
                || vaultAddressQuery.isLoading || !vaultAddressQuery.data) {
                throw new Error('Required addresses not found')
            }
            return await signAndSend(getDeleteStakePoolInstruction(
                {
                    signer: signer,
                    stakePool: stakePoolAddressQuery.data[0],
                    vault: vaultAddressQuery.data,
                    stakeMint: labsMintAddress,
                }),
                signer)
        },
        onSuccess: async (tx, variables, context) => {
            if (context?.toast) {
                context.toast.success(tx, 'Successfully deleted stake pool')
            }
            // Invalidate relevant queries to refresh admin UI
            await queryClient.invalidateQueries({ queryKey: ['xlabs-mint-address'] })
            await queryClient.invalidateQueries({ queryKey: ['stake-pool-config-data'] })
            await queryClient.invalidateQueries({ queryKey: ['vault-account'] })
        },
        onError: (error, variables, context) => {
            if (context?.toast) {
                context.toast.error(`Failed to delete stake pool: ${error.message}`)
            }
        },
    })
}

export function useEnhancedUpdateStakePoolConfigMutation() {
    const signer = useWalletUiSigner()
    const signAndSend = useWalletTransactionSignAndSend()
    const configAddressQuery = useStakePoolConfigAddress()
    const queryClient = useQueryClient()
    const stakePoolAddressQuery = useStakePoolAddress()

    return useMutation({
        onMutate: async (aprBps: number | bigint) => {
            const toast = new ProgressiveTransactionToast('Updating Stake Pool Configuration')
            toast.start()
            return { toast }
        },
        mutationFn: async (aprBps: number | bigint) => {
            if (configAddressQuery.isLoading || !configAddressQuery.data) {
                throw new Error('Stake pool config address not found')
            }
            if (stakePoolAddressQuery.isLoading || !stakePoolAddressQuery.data) {
                throw new Error('Stake pool address not found')
            }
            return await signAndSend(getUpdateStakePoolConfigInstruction(
                {
                    signer: signer,
                    stakePool: stakePoolAddressQuery.data[0],
                    config: configAddressQuery.data[0],
                    aprBps: aprBps,
                }),
                signer)
        },
        onSuccess: async (tx, variables, context) => {
            if (context?.toast) {
                context.toast.success(tx, `Successfully updated APY to ${Number(variables) / 100}%`)
            }
            // Invalidate stake pool config queries to refresh the data
            await queryClient.invalidateQueries({ queryKey: ['stake-pool-config-data'] })
        },
        onError: (error, variables, context) => {
            if (context?.toast) {
                context.toast.error(`Failed to update stake pool config: ${error.message}`)
            }
        },
    })
}