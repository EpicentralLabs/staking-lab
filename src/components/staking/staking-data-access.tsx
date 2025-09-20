import { useWalletUiSigner } from "@wallet-ui/react"
import { useWalletTransactionSignAndSend } from "../solana/use-wallet-transaction-sign-and-send"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getClaimRewardsInstruction, getStakeToStakePoolInstruction, getUnstakeFromStakePoolInstruction } from "@program-client"
import { useLabsMintAddress, useLabsUserAssociatedTokenAccount, useStakeAccountAddress, useStakePoolAddress, useStakePoolConfigAddress, useUserXLabsAccount, useVaultAddress, useXLabsMintAddress, useXLabsUserAssociatedTokenAccount } from "../shared/data-access"
import { toastTx } from "../toast-tx"
import { toast } from "sonner"
import { getCreateAssociatedTokenInstruction, getAssociatedTokenAccountAddress, TOKEN_PROGRAM_ADDRESS } from "gill/programs"
import { useWalletUi } from "@wallet-ui/react"
import { address } from "gill"

export function useStakeToStakePoolMutation() {
    const signer = useWalletUiSigner()
    const signAndSend = useWalletTransactionSignAndSend()
    const queryClient = useQueryClient()
    const stakeAccountQuery = useStakeAccountAddress()
    const stakePoolAddress = useStakePoolAddress()
    const stakePoolConfig = useStakePoolConfigAddress()
    const labsAddress = useLabsMintAddress()
    const vaultAddressQuery = useVaultAddress()
    const labsUserAtaQuery = useLabsUserAssociatedTokenAccount()


    return useMutation({
        onMutate: async (amount: number | bigint) => {
            // Cancel any outgoing refetches to avoid overwriting optimistic update
            await queryClient.cancelQueries({ queryKey: ['user-labs-account'] })
            await queryClient.cancelQueries({ queryKey: ['user-stake-account'] })
            await queryClient.cancelQueries({ queryKey: ['vault-account'] })

            // Snapshot the previous values for rollback
            const previousLabsAccount = queryClient.getQueryData(['user-labs-account'])
            const previousStakeAccount = queryClient.getQueryData(['user-stake-account'])
            const previousVaultAccount = queryClient.getQueryData(['vault-account'])

            // Optimistically update user LABS balance (decrease)
            queryClient.setQueryData(['user-labs-account'], (old: any) => {
                if (!old?.data?.amount) return old
                const currentAmount = Number(old.data.amount)
                const newAmount = currentAmount - Number(amount)
                return {
                    ...old,
                    data: {
                        ...old.data,
                        amount: BigInt(Math.max(0, newAmount)) // Prevent negative balance
                    }
                }
            })

            // Optimistically update user stake account (increase staked amount)
            queryClient.setQueryData(['user-stake-account'], (old: any) => {
                if (!old) return old
                if (!old.exists) {
                    // If stake account doesn't exist, create optimistic initial state
                    return {
                        exists: true,
                        data: {
                            stakedAmount: BigInt(amount),
                            rewardsEarned: BigInt(0),
                            lastUpdateSlot: BigInt(0)
                        }
                    }
                }
                // Update existing stake account
                const currentStaked = Number(old.data.stakedAmount)
                const newStaked = currentStaked + Number(amount)
                return {
                    ...old,
                    data: {
                        ...old.data,
                        stakedAmount: BigInt(newStaked)
                    }
                }
            })

            // Optimistically update vault account (increase TVL)
            queryClient.setQueryData(['vault-account'], (old: any) => {
                if (!old?.data?.amount) return old
                const currentAmount = Number(old.data.amount)
                const newAmount = currentAmount + Number(amount)
                return {
                    ...old,
                    data: {
                        ...old.data,
                        amount: BigInt(newAmount)
                    }
                }
            })

            // Return context for rollback
            return { previousLabsAccount, previousStakeAccount, previousVaultAccount }
        },
        mutationFn: async (amount: number | bigint) => {
            // Check each dependency individually for better error messages
            if (stakeAccountQuery.isLoading) {
                throw new Error('Stake account address is still loading')
            }
            if (!stakeAccountQuery.data) {
                throw new Error('Stake account address is not available')
            }
            if (stakePoolAddress.isLoading) {
                throw new Error('Stake pool address is still loading')
            }
            if (!stakePoolAddress.data) {
                throw new Error('Stake pool address is not available')
            }
            if (stakePoolConfig.isLoading) {
                throw new Error('Stake pool config address is still loading')
            }
            if (!stakePoolConfig.data) {
                throw new Error('Stake pool config address is not available')
            }
            if (vaultAddressQuery.isLoading) {
                throw new Error('Vault address is still loading')
            }
            if (!vaultAddressQuery.data) {
                throw new Error('Vault address is not available')
            }
            if (labsUserAtaQuery.isLoading) {
                throw new Error('User LABS token account is still loading')
            }
            if (!labsUserAtaQuery.data) {
                throw new Error('User LABS token account is not available')
            }

            return await signAndSend(getStakeToStakePoolInstruction(
                {
                    amount: amount,
                    stakeAccount: stakeAccountQuery.data[0],
                    stakePool: stakePoolAddress.data[0],
                    stakePoolConfig: stakePoolConfig.data[0],
                    user: signer,
                    stakingTokenMint: labsAddress,
                    vault: vaultAddressQuery.data,
                    userAssociatedTokenAccount: labsUserAtaQuery.data,
                }),
                signer)
        },
        onSuccess: async (tx) => {
            toastTx(tx)
            // Invalidate relevant queries to refresh UI after staking
            await queryClient.invalidateQueries({ queryKey: ['user-labs-account'] })
            await queryClient.invalidateQueries({ queryKey: ['user-stake-account'] })
            await queryClient.invalidateQueries({ queryKey: ['vault-account'] })
        },
        onError: (error, variables, context) => {
            // Rollback optimistic updates on error
            if (context?.previousLabsAccount) {
                queryClient.setQueryData(['user-labs-account'], context.previousLabsAccount)
            }
            if (context?.previousStakeAccount) {
                queryClient.setQueryData(['user-stake-account'], context.previousStakeAccount)
            }
            if (context?.previousVaultAccount) {
                queryClient.setQueryData(['vault-account'], context.previousVaultAccount)
            }
            toast.error(`Staking failed: ${error.message}`)
        },
    })
}

export function useUnstakeFromStakePoolMutation() {
    const signer = useWalletUiSigner()
    const { account } = useWalletUi()
    const signAndSend = useWalletTransactionSignAndSend()
    const queryClient = useQueryClient()
    const stakeAccountQuery = useStakeAccountAddress()
    const stakePoolAddress = useStakePoolAddress()
    const stakePoolConfig = useStakePoolConfigAddress()
    const labsAddress = useLabsMintAddress()
    const xlabsAddress = useXLabsMintAddress()
    const vaultAddressQuery = useVaultAddress()
    const labsUserAtaQuery = useLabsUserAssociatedTokenAccount()
    const xLabsUserAtaQuery = useXLabsUserAssociatedTokenAccount()
    const userXLabsAccountQuery = useUserXLabsAccount();
    return useMutation({
        onMutate: async (amount: number | bigint) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['user-labs-account'] })
            await queryClient.cancelQueries({ queryKey: ['user-stake-account'] })
            await queryClient.cancelQueries({ queryKey: ['vault-account'] })
            await queryClient.cancelQueries({ queryKey: ['user-xlabs-account'] })

            // Snapshot previous values
            const previousLabsAccount = queryClient.getQueryData(['user-labs-account'])
            const previousStakeAccount = queryClient.getQueryData(['user-stake-account'])
            const previousVaultAccount = queryClient.getQueryData(['vault-account'])
            const previousXLabsAccount = queryClient.getQueryData(['user-xlabs-account'])

            // Optimistically update user LABS balance (increase)
            queryClient.setQueryData(['user-labs-account'], (old: any) => {
                if (!old?.data?.amount) return old
                const currentAmount = Number(old.data.amount)
                const newAmount = currentAmount + Number(amount)
                return {
                    ...old,
                    data: {
                        ...old.data,
                        amount: BigInt(newAmount)
                    }
                }
            })

            // Optimistically update user stake account (decrease staked amount)
            queryClient.setQueryData(['user-stake-account'], (old: any) => {
                if (!old?.exists || !old?.data) return old
                const currentStaked = Number(old.data.stakedAmount)
                const newStaked = Math.max(0, currentStaked - Number(amount))
                
                return {
                    ...old,
                    data: {
                        ...old.data,
                        stakedAmount: BigInt(newStaked)
                    }
                }
            })

            // Optimistically update vault account (decrease TVL)
            queryClient.setQueryData(['vault-account'], (old: any) => {
                if (!old?.data?.amount) return old
                const currentAmount = Number(old.data.amount)
                const newAmount = Math.max(0, currentAmount - Number(amount))
                return {
                    ...old,
                    data: {
                        ...old.data,
                        amount: BigInt(newAmount)
                    }
                }
            })

            return { previousLabsAccount, previousStakeAccount, previousVaultAccount, previousXLabsAccount }
        },
        mutationFn: async (amount: number | bigint) => {
            // Check each dependency individually for better error messages
            if (stakeAccountQuery.isLoading) {
                throw new Error('Stake account address is still loading')
            }
            if (!stakeAccountQuery.data) {
                throw new Error('Stake account address is not available')
            }
            if (stakePoolAddress.isLoading) {
                throw new Error('Stake pool address is still loading')
            }
            if (!stakePoolAddress.data) {
                throw new Error('Stake pool address is not available')
            }
            if (stakePoolConfig.isLoading) {
                throw new Error('Stake pool config address is still loading')
            }
            if (!stakePoolConfig.data) {
                throw new Error('Stake pool config address is not available')
            }
            if (vaultAddressQuery.isLoading) {
                throw new Error('Vault address is still loading')
            }
            if (!vaultAddressQuery.data) {
                throw new Error('Vault address is not available')
            }
            if (labsUserAtaQuery.isLoading) {
                throw new Error('User LABS token account is still loading')
            }
            if (!labsUserAtaQuery.data) {
                throw new Error('User LABS token account is not available')
            }
            if (xLabsUserAtaQuery.isLoading) {
                throw new Error('User xLABS token account is still loading')
            }
            if (!xLabsUserAtaQuery.data) {
                throw new Error('User xLABS token account is not available')
            }
            if (xlabsAddress.isLoading) {
                throw new Error('xLABS mint address is still loading')
            }
            if (!xlabsAddress.data) {
                throw new Error('xLABS mint address is not available')
            }
            if (userXLabsAccountQuery.isLoading) {
                throw new Error('User xLABS account data is still loading')
            }

            let ixs = []
            // If the xLabsUserAtaQuery.data is not initialized, we need to create it first
            if (userXLabsAccountQuery.data === null) {
                const derivedAta = await getAssociatedTokenAccountAddress(
                    xlabsAddress.data![0],
                    signer.address,
                    TOKEN_PROGRAM_ADDRESS
                );
                ixs.push(getCreateAssociatedTokenInstruction({
                    payer: signer,
                    mint: xlabsAddress.data![0],
                    owner: signer.address,
                    ata: derivedAta,
                    tokenProgram: TOKEN_PROGRAM_ADDRESS,
                }))
            }
            ixs.push(getUnstakeFromStakePoolInstruction(
                {
                    amount: amount,
                    rewardMint: xlabsAddress.data![0],
                    stakeAccount: stakeAccountQuery.data[0],
                    stakePool: stakePoolAddress.data[0],
                    stakePoolConfig: stakePoolConfig.data[0],
                    user: signer,
                    stakingTokenMint: labsAddress,
                    vault: vaultAddressQuery.data,
                    userAssociatedTokenAccount: labsUserAtaQuery.data,
                    userRewardAssociatedTokenAccount: xLabsUserAtaQuery.data,
                }))
            return await signAndSend(ixs, signer)
        },
        onSuccess: async (tx) => {
            toastTx(tx)
            // Invalidate relevant queries to refresh UI
            await queryClient.invalidateQueries({ queryKey: ['user-labs-account'] })
            await queryClient.invalidateQueries({ queryKey: ['user-stake-account'] })
            await queryClient.invalidateQueries({ queryKey: ['user-xlabs-account'] })
            await queryClient.invalidateQueries({ queryKey: ['vault-account'] })
        },
        onError: (error, variables, context) => {
            // Rollback optimistic updates on error
            if (context?.previousLabsAccount) {
                queryClient.setQueryData(['user-labs-account'], context.previousLabsAccount)
            }
            if (context?.previousStakeAccount) {
                queryClient.setQueryData(['user-stake-account'], context.previousStakeAccount)
            }
            if (context?.previousVaultAccount) {
                queryClient.setQueryData(['vault-account'], context.previousVaultAccount)
            }
            if (context?.previousXLabsAccount) {
                queryClient.setQueryData(['user-xlabs-account'], context.previousXLabsAccount)
            }
            toast.error(`Unstaking failed: ${error.message}`)
        },
    })
}

export function useClaimFromStakePoolMutation() {
    const signer = useWalletUiSigner()
    const { account } = useWalletUi()
    const signAndSend = useWalletTransactionSignAndSend()
    const queryClient = useQueryClient()
    const stakeAccountQuery = useStakeAccountAddress()
    const stakePoolAddress = useStakePoolAddress()
    const stakePoolConfig = useStakePoolConfigAddress()
    const xlabsAddress = useXLabsMintAddress()
    const vaultAddressQuery = useVaultAddress()
    const labsUserAtaQuery = useLabsUserAssociatedTokenAccount()
    const xLabsUserAtaQuery = useXLabsUserAssociatedTokenAccount()
    const userXLabsAccountQuery = useUserXLabsAccount();
    return useMutation({
        onMutate: async (amount: number | bigint) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['user-xlabs-account'] })
            await queryClient.cancelQueries({ queryKey: ['user-stake-account'] })

            // Snapshot previous values
            const previousXLabsAccount = queryClient.getQueryData(['user-xlabs-account'])
            const previousStakeAccount = queryClient.getQueryData(['user-stake-account'])

            // Get current pending rewards from real-time calculation
            const stakeAccountData = queryClient.getQueryData(['user-stake-account']) as any
            let pendingRewards = BigInt(0)
            
            if (stakeAccountData?.exists && stakeAccountData?.data) {
                // We need to estimate pending rewards - in a real app this would come from the component
                // For now, let's assume we're claiming all available rewards
                // The real calculation happens in useRealtimePendingRewards hook
                const timeStaked = Date.now() - Number(stakeAccountData.data.lastUpdateSlot) * 400 // rough estimate
                const stakePoolConfig = queryClient.getQueryData(['stake-pool-config-data']) as any
                if (stakePoolConfig?.data?.aprBps && stakeAccountData.data.stakedAmount) {
                    const apr = Number(stakePoolConfig.data.aprBps) / 10000 // Convert basis points to decimal
                    const stakedAmount = Number(stakeAccountData.data.stakedAmount)
                    const annualRewards = (stakedAmount * apr)
                    const timeRewards = annualRewards * (timeStaked / (365 * 24 * 60 * 60 * 1000))
                    pendingRewards = BigInt(Math.floor(timeRewards))
                }
            }

            // If we don't have a good estimate, assume we're claiming some amount
            if (pendingRewards === BigInt(0)) {
                pendingRewards = BigInt(1000000) // 0.001 xLABS as fallback
            }

            // Optimistically update xLABS balance (increase with claimed rewards)
            queryClient.setQueryData(['user-xlabs-account'], (old: any) => {
                if (!old) {
                    // Create new xLABS account if it doesn't exist
                    return {
                        data: {
                            amount: pendingRewards
                        }
                    }
                }
                const currentAmount = old.data?.amount ? Number(old.data.amount) : 0
                const newAmount = currentAmount + Number(pendingRewards)
                return {
                    ...old,
                    data: {
                        ...old.data,
                        amount: BigInt(newAmount)
                    }
                }
            })

            // Optimistically update stake account to reset pending rewards
            queryClient.setQueryData(['user-stake-account'], (old: any) => {
                if (!old?.exists || !old?.data) return old
                return {
                    ...old,
                    data: {
                        ...old.data,
                        rewardsEarned: BigInt(Number(old.data.rewardsEarned) + Number(pendingRewards)),
                        lastUpdateSlot: BigInt(Date.now() / 400) // Update last claim time
                    }
                }
            })

            return { previousXLabsAccount, previousStakeAccount, claimedAmount: pendingRewards }
        },
        mutationFn: async (amount: number | bigint) => {
            // Check each dependency individually for better error messages
            if (stakeAccountQuery.isLoading) {
                throw new Error('Stake account address is still loading')
            }
            if (!stakeAccountQuery.data) {
                throw new Error('Stake account address is not available')
            }
            if (stakePoolAddress.isLoading) {
                throw new Error('Stake pool address is still loading')
            }
            if (!stakePoolAddress.data) {
                throw new Error('Stake pool address is not available')
            }
            if (stakePoolConfig.isLoading) {
                throw new Error('Stake pool config address is still loading')
            }
            if (!stakePoolConfig.data) {
                throw new Error('Stake pool config address is not available')
            }
            if (vaultAddressQuery.isLoading) {
                throw new Error('Vault address is still loading')
            }
            if (!vaultAddressQuery.data) {
                throw new Error('Vault address is not available')
            }
            if (labsUserAtaQuery.isLoading) {
                throw new Error('User LABS token account is still loading')
            }
            if (!labsUserAtaQuery.data) {
                throw new Error('User LABS token account is not available')
            }
            if (xLabsUserAtaQuery.isLoading) {
                throw new Error('User xLABS token account is still loading')
            }
            if (!xLabsUserAtaQuery.data) {
                throw new Error('User xLABS token account is not available')
            }
            if (xlabsAddress.isLoading) {
                throw new Error('xLABS mint address is still loading')
            }
            if (!xlabsAddress.data) {
                throw new Error('xLABS mint address is not available')
            }
            if (userXLabsAccountQuery.isLoading) {
                throw new Error('User xLABS account data is still loading')
            }
            let ixs = []
            // If the xLabsUserAtaQuery.data is not initialized, we need to create it first
            if (userXLabsAccountQuery.data === null) {
                const derivedAta = await getAssociatedTokenAccountAddress(
                    xlabsAddress.data![0],
                    address(account!.address.toString())
                )
                ixs.push(getCreateAssociatedTokenInstruction({
                    payer: signer,
                    ata: derivedAta,
                    mint: xlabsAddress.data![0],
                    owner: address(account!.address.toString())
                }))
            }
            ixs.push(getClaimRewardsInstruction(
                {
                    signer: signer,
                    rewardMint: xlabsAddress.data![0],
                    stakeAccount: stakeAccountQuery.data[0],
                    stakePool: stakePoolAddress.data[0],
                    stakePoolConfig: stakePoolConfig.data[0],
                    userRewardAssociatedTokenAccount: xLabsUserAtaQuery.data,
                }))
            return await signAndSend(ixs, signer)
        },
        onSuccess: async (tx) => {
            toastTx(tx)
            // Invalidate relevant queries to refresh UI
            await queryClient.invalidateQueries({ queryKey: ['user-labs-account'] })
            await queryClient.invalidateQueries({ queryKey: ['user-stake-account'] })
            await queryClient.invalidateQueries({ queryKey: ['user-xlabs-account'] })
            await queryClient.invalidateQueries({ queryKey: ['vault-account'] })
        },
        onError: (error, variables, context) => {
            // Rollback optimistic updates on error
            if (context?.previousXLabsAccount) {
                queryClient.setQueryData(['user-xlabs-account'], context.previousXLabsAccount)
            }
            if (context?.previousStakeAccount) {
                queryClient.setQueryData(['user-stake-account'], context.previousStakeAccount)
            }
            toast.error(`Claiming failed: ${error.message}`)
        },
    })
}