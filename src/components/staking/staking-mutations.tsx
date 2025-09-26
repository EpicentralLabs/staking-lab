import { useWalletUiSigner } from "@wallet-ui/react"
import { useWalletTransactionSignAndSend } from "../solana/use-wallet-transaction-sign-and-send"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getClaimRewardsInstruction, getStakeToStakePoolInstruction, getUnstakeFromStakePoolInstruction } from "@program-client"
import { useLabsMintAddress, useLabsUserAssociatedTokenAccount, useStakeAccountAddress, useStakePoolAddress, useStakePoolConfigAddress, useUserXLabsAccount, useVaultAddress, useXLabsMintAddress, useXLabsUserAssociatedTokenAccount } from "../shared/data-access"
import { ProgressiveTransactionToast } from "../ui/transaction-toast"
import { getCreateAssociatedTokenInstruction, getAssociatedTokenAccountAddress, TOKEN_PROGRAM_ADDRESS } from "gill/programs"
import { useWalletUi } from "@wallet-ui/react"
import { address } from "gill"
import type { 
  UserLabsAccountQueryData, 
  UserStakeAccountQueryData, 
  VaultAccountQueryData, 
  UserXLabsAccountQueryData, 
  StakePoolConfigQueryData, 
  MutationContext 
} from "../../types/staking"

export function useEnhancedStakeToStakePoolMutation(refetchStakingQueries?: (expectedStakedAmount?: bigint) => Promise<void>) {
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
            // Create progressive toast
            const toast = new ProgressiveTransactionToast('Staking LABS Tokens')
            toast.start()

            // Cancel any outgoing refetches to avoid overwriting optimistic update
            await queryClient.cancelQueries({ queryKey: ['user-labs-account'] })
            await queryClient.cancelQueries({ queryKey: ['user-stake-account'] })
            await queryClient.cancelQueries({ queryKey: ['vault-account'] })

            // Snapshot the previous values for rollback
            const previousLabsAccount = queryClient.getQueryData(['user-labs-account'])
            const previousStakeAccount = queryClient.getQueryData(['user-stake-account'])
            const previousVaultAccount = queryClient.getQueryData(['vault-account'])

            // Optimistically update user LABS balance (decrease)
            queryClient.setQueryData(['user-labs-account'], (old: UserLabsAccountQueryData | undefined) => {
                if (!old?.data?.amount) return old
                const currentAmount = Number(old.data.amount)
                const newAmount = currentAmount - Number(amount)
                return {
                    ...old,
                    data: {
                        ...old.data,
                        amount: BigInt(Math.max(0, newAmount))
                    }
                }
            })

            // Optimistically update user stake account (increase staked amount)
            queryClient.setQueryData(['user-stake-account'], (old: UserStakeAccountQueryData | undefined) => {
                if (!old) return old
                if (!old.exists) {
                    return {
                        exists: true,
                        data: {
                            stakedAmount: BigInt(amount),
                            rewardsEarned: BigInt(0),
                            lastUpdateSlot: BigInt(0)
                        }
                    }
                }
                const currentStaked = Number(old.data?.stakedAmount || 0)
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
            queryClient.setQueryData(['vault-account'], (old: VaultAccountQueryData | undefined) => {
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

            return {
                previousLabsAccount,
                previousStakeAccount,
                previousVaultAccount,
                toast
            } as MutationContext
        },
        mutationFn: async (amount: number | bigint) => {

            // Check dependencies
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
        onSuccess: async (tx, variables, context) => {
            if (context?.toast) {
                context.toast.success(tx, `Successfully staked ${Number(variables) / 1e9} LABS tokens`)
            }

            // Use coordinated refetch if provided, but without retry logic for normal operations
            if (refetchStakingQueries) {
                // Use refetchAll instead of refetchStakingQueries to avoid unnecessary retry logic
                await queryClient.refetchQueries({ queryKey: ['user-labs-account'] })
                await queryClient.refetchQueries({ queryKey: ['user-stake-account'] })
                await queryClient.refetchQueries({ queryKey: ['vault-account'] })
                await queryClient.refetchQueries({ queryKey: ['stake-pool-data'] })
            } else {
                await Promise.all([
                    queryClient.refetchQueries({ queryKey: ['user-labs-account'] }),
                    queryClient.refetchQueries({ queryKey: ['user-stake-account'] }),
                    queryClient.refetchQueries({ queryKey: ['vault-account'] }),
                    queryClient.refetchQueries({ queryKey: ['stake-pool-data'] }),
                ])
            }
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

            if (context?.toast) {
                context.toast.error(error.message)
            }
        },
    })
}

export function useEnhancedUnstakeFromStakePoolMutation(refetchUnstakingQueries?: (expectedRemainingAmount?: bigint) => Promise<void>) {
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
    const userXLabsAccountQuery = useUserXLabsAccount()

    return useMutation({
        onMutate: async (amount: number | bigint) => {
            const toast = new ProgressiveTransactionToast('Unstaking LABS Tokens')
            toast.start()

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
            queryClient.setQueryData(['user-labs-account'], (old: UserLabsAccountQueryData | undefined) => {
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
            queryClient.setQueryData(['user-stake-account'], (old: UserStakeAccountQueryData | undefined) => {
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
            queryClient.setQueryData(['vault-account'], (old: VaultAccountQueryData | undefined) => {
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

            return {
                previousLabsAccount,
                previousStakeAccount,
                previousVaultAccount,
                previousXLabsAccount,
                toast
            } as MutationContext
        },
        mutationFn: async (amount: number | bigint) => {

            // Validation checks
            if (stakeAccountQuery.isLoading || !stakeAccountQuery.data) {
                throw new Error('Stake account address is not available')
            }
            if (stakePoolAddress.isLoading || !stakePoolAddress.data) {
                throw new Error('Stake pool address is not available')
            }
            if (stakePoolConfig.isLoading || !stakePoolConfig.data) {
                throw new Error('Stake pool config address is not available')
            }
            if (vaultAddressQuery.isLoading || !vaultAddressQuery.data) {
                throw new Error('Vault address is not available')
            }
            if (labsUserAtaQuery.isLoading || !labsUserAtaQuery.data) {
                throw new Error('User LABS token account is not available')
            }
            if (xLabsUserAtaQuery.isLoading || !xLabsUserAtaQuery.data) {
                throw new Error('User xLABS token account is not available')
            }
            if (xlabsAddress.isLoading || !xlabsAddress.data) {
                throw new Error('xLABS mint address is not available')
            }

            const ixs = []

            // Create xLABS ATA if needed
            if (userXLabsAccountQuery.data === null) {
                const derivedAta = await getAssociatedTokenAccountAddress(
                    xlabsAddress.data![0],
                    signer.address,
                    TOKEN_PROGRAM_ADDRESS
                )
                ixs.push(getCreateAssociatedTokenInstruction({
                    payer: signer,
                    mint: xlabsAddress.data![0],
                    owner: signer.address,
                    ata: derivedAta,
                    tokenProgram: TOKEN_PROGRAM_ADDRESS,
                }))
            }

            ixs.push(getUnstakeFromStakePoolInstruction({
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
        onSuccess: async (tx, variables, context) => {
            if (context?.toast) {
                context.toast.success(tx, `Successfully unstaked ${Number(variables) / 1e9} LABS tokens`)
            }

            // Use coordinated refetch if provided, but without retry logic for normal operations
            if (refetchUnstakingQueries) {
                // Use direct refetch instead of retry logic to avoid unnecessary "Retrying..." UI
                await Promise.all([
                    queryClient.refetchQueries({ queryKey: ['user-labs-account'] }),
                    queryClient.refetchQueries({ queryKey: ['user-stake-account'] }),
                    queryClient.refetchQueries({ queryKey: ['user-xlabs-account'] }),
                    queryClient.refetchQueries({ queryKey: ['vault-account'] }),
                    queryClient.refetchQueries({ queryKey: ['stake-pool-data'] }),
                ])
            } else {
                await Promise.all([
                    queryClient.refetchQueries({ queryKey: ['user-labs-account'] }),
                    queryClient.refetchQueries({ queryKey: ['user-stake-account'] }),
                    queryClient.refetchQueries({ queryKey: ['user-xlabs-account'] }),
                    queryClient.refetchQueries({ queryKey: ['vault-account'] }),
                    queryClient.refetchQueries({ queryKey: ['stake-pool-data'] }),
                ])
            }
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

            if (context?.toast) {
                context.toast.error(error.message)
            }
        },
    })
}

export function useEnhancedClaimFromStakePoolMutation(refetchClaimingQueries?: () => Promise<void>) {
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
    const userXLabsAccountQuery = useUserXLabsAccount()

    return useMutation({
        onMutate: async () => {
            const toast = new ProgressiveTransactionToast('Claiming Rewards')
            toast.start()

            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['user-xlabs-account'] })
            await queryClient.cancelQueries({ queryKey: ['user-stake-account'] })

            // Snapshot previous values
            const previousXLabsAccount = queryClient.getQueryData(['user-xlabs-account'])
            const previousStakeAccount = queryClient.getQueryData(['user-stake-account'])

            // Estimate pending rewards for optimistic update
            const stakeAccountData = queryClient.getQueryData(['user-stake-account']) as UserStakeAccountQueryData | undefined
            let pendingRewards = BigInt(1000000) // Default fallback

            if (stakeAccountData?.exists && stakeAccountData?.data) {
                const timeStaked = Date.now() - Number(stakeAccountData.data.lastUpdateSlot) * 400
                const stakePoolConfig = queryClient.getQueryData(['stake-pool-config-data']) as StakePoolConfigQueryData | undefined
                if (stakePoolConfig?.data?.aprBps && stakeAccountData.data.stakedAmount) {
                    const apr = Number(stakePoolConfig.data.aprBps) / 10000
                    const stakedAmount = Number(stakeAccountData.data.stakedAmount)
                    const annualRewards = (stakedAmount * apr)
                    const timeRewards = annualRewards * (timeStaked / (365 * 24 * 60 * 60 * 1000))
                    pendingRewards = BigInt(Math.floor(timeRewards))
                }
            }

            // Optimistically update xLABS balance
            queryClient.setQueryData(['user-xlabs-account'], (old: UserXLabsAccountQueryData | undefined) => {
                if (!old) {
                    return {
                        data: { amount: pendingRewards }
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

            // Optimistically update stake account
            queryClient.setQueryData(['user-stake-account'], (old: UserStakeAccountQueryData | undefined) => {
                if (!old?.exists || !old?.data) return old
                return {
                    ...old,
                    data: {
                        ...old.data,
                        rewardsEarned: BigInt(Number(old.data.rewardsEarned) + Number(pendingRewards)),
                        lastUpdateSlot: BigInt(Date.now() / 400)
                    }
                }
            })

            return {
                previousXLabsAccount,
                previousStakeAccount,
                claimedAmount: pendingRewards,
                toast
            } as MutationContext
        },
        mutationFn: async () => {

            // Validation checks
            if (!stakeAccountQuery.data || !stakePoolAddress.data || !stakePoolConfig.data ||
                !vaultAddressQuery.data || !labsUserAtaQuery.data || !xLabsUserAtaQuery.data ||
                !xlabsAddress.data) {
                throw new Error('Required account data not available')
            }

            const ixs = []

            // Create xLABS ATA if needed
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

            ixs.push(getClaimRewardsInstruction({
                signer: signer,
                rewardMint: xlabsAddress.data![0],
                stakeAccount: stakeAccountQuery.data[0],
                stakePool: stakePoolAddress.data[0],
                stakePoolConfig: stakePoolConfig.data[0],
                userRewardAssociatedTokenAccount: xLabsUserAtaQuery.data,
            }))

            return await signAndSend(ixs, signer)
        },
        onSuccess: async (tx, variables, context) => {
            if (context?.toast) {
                const rewardAmount = Number(context.claimedAmount) / 1e9
                context.toast.success(tx, `Successfully claimed ${rewardAmount.toFixed(4)} xLABS rewards`)
            }

            // Use coordinated refetch if provided, otherwise fallback to individual refetches
            if (refetchClaimingQueries) {
                await refetchClaimingQueries()
            } else {
                await Promise.all([
                    queryClient.refetchQueries({ queryKey: ['user-labs-account'] }),
                    queryClient.refetchQueries({ queryKey: ['user-stake-account'] }),
                    queryClient.refetchQueries({ queryKey: ['user-xlabs-account'] }),
                    queryClient.refetchQueries({ queryKey: ['vault-account'] }),
                    queryClient.refetchQueries({ queryKey: ['stake-pool-data'] }),
                ])
            }
        },
        onError: (error, variables, context) => {
            // Rollback optimistic updates on error
            if (context?.previousXLabsAccount) {
                queryClient.setQueryData(['user-xlabs-account'], context.previousXLabsAccount)
            }
            if (context?.previousStakeAccount) {
                queryClient.setQueryData(['user-stake-account'], context.previousStakeAccount)
            }

            if (context?.toast) {
                context.toast.error(error.message)
            }
        },
    })
}