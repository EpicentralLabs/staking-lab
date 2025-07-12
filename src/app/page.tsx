"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { FlowingBackground } from "../components/flowing-background"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TokenBalance } from "@/components/solana-rpc-methods/get-user-token-balance"
import { useWallet } from "@solana/wallet-adapter-react"
import { calculateXLABSAccumulation } from "@/lib/utils"
import { Connection, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js"
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor"
import { StakingProgram, IDL } from "@/programs/staking_program/staking_program"
import { rpcUrl, LABS_TOKEN_MINT } from "@/lib/constants"
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction } from "@solana/spl-token"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function SolanaStakingDApp() {
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [isStakeDialogOpen, setIsStakeDialogOpen] = useState(false)
  const [isUnstakeDialogOpen, setIsUnstakeDialogOpen] = useState(false)
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false)
  const { publicKey, signTransaction } = useWallet()
  const { toast } = useToast()

  const walletBalance = TokenBalance() || 0
  const [stakedAmount, setStakedAmount] = useState(0)
  const [totalRewardsEarned, setTotalRewardsEarned] = useState(0)
  const [pendingRewards, setPendingRewards] = useState(0)
  const [stakingLastUpdated, setStakingLastUpdated] = useState<Date | null>(null)
  const [totalValueLocked, setTotalValueLocked] = useState(0)
  const [onChainApy, setOnChainApy] = useState<number>(0)
  const [rewardMint, setRewardMint] = useState<PublicKey | null>(null) // New state for reward mint from config

  const programId = new PublicKey(IDL.address)

  // Helper to derive PDAs
  const findPda = (seeds: (Buffer | Uint8Array)[], programId: PublicKey) =>
    PublicKey.findProgramAddressSync(seeds, programId)[0]

  // Fetch on-chain data
  const fetchOnChainData = async () => {
    if (!publicKey) return

    try {
      const connection = new Connection(rpcUrl) // Can replace with solanaClient.rpc if using gill kit
      const stakePool = findPda([Buffer.from("stake_pool")], programId)
      const config = findPda([Buffer.from("config")], programId)
      const stakeAccount = findPda([Buffer.from("stake_account"), stakePool.toBuffer(), publicKey.toBuffer()], programId)

      const mockWallet = {
        publicKey: new PublicKey("11111111111111111111111111111111"),
        signTransaction: async () => { throw new Error("Mock wallet") },
        signAllTransactions: async () => { throw new Error("Mock wallet") }
      }
      const provider = new AnchorProvider(connection, mockWallet, { preflightCommitment: "processed" })
      const program = new Program<StakingProgram>(IDL, program)

      // Fetch config
      try {
        const configAccount = await program.account.stakePoolConfig.fetch(config)
        const apyBasisPoints = Number(configAccount.apy)
        setOnChainApy(apyBasisPoints / 100)
        setRewardMint(configAccount.rewardMint) // Set reward mint from config
      } catch (err) {
        console.warn('Config account not found:', err)
        setOnChainApy(0)
        setRewardMint(null)
        toast({ title: "Pool Not Initialized", description: "Staking config not found. Contact admin.", variant: "destructive" })
      }

      // Fetch user stake account
      try {
        const stakeData = await program.account.stakeAccount.fetch(stakeAccount)
        setStakedAmount(Number(stakeData.stakedAmount) / 1e9)
        setTotalRewardsEarned(Number(stakeData.rewardsEarned) / 1e9)
        setPendingRewards(Number(stakeData.pendingRewards) / 1e9)
        setStakingLastUpdated(new Date(Number(stakeData.lastUpdated) * 1000))
      } catch {
        setStakedAmount(0)
        setTotalRewardsEarned(0)
        setPendingRewards(0)
        setStakingLastUpdated(null)
      }

      // Fetch TVL
      const stakeAccounts = await program.account.stakeAccount.all([
        {
          memcmp: {
            offset: 8 + 8 + 32,
            bytes: stakePool.toBase58()
          }
        }
      ])
      let totalStakedLabs = 0
      stakeAccounts.forEach(acc => {
        totalStakedLabs += Number(acc.account.stakedAmount) / 1e9
      })
      setTotalValueLocked(totalStakedLabs)
    } catch (error) {
      console.error("Error fetching on-chain data:", error)
      setOnChainApy(0)
      setRewardMint(null)
      toast({ title: "Fetch Error", description: "Failed to load on-chain data.", variant: "destructive" })
    }
  }

  // Update current rewards estimate
  useEffect(() => {
    if (stakingLastUpdated && stakedAmount > 0 && onChainApy > 0) {
      const updateRewards = () => {
        const now = new Date()
        const timeStakedSeconds = (now.getTime() - stakingLastUpdated.getTime()) / 1000
        const daysStaked = timeStakedSeconds / (24 * 60 * 60)
        const estimatedNewRewards = calculateXLABSAccumulation(stakedAmount, daysStaked, onChainApy)
        setPendingRewards(estimatedNewRewards)
      }

      updateRewards()
      const interval = setInterval(updateRewards, 1000)
      return () => clearInterval(interval)
    }
  }, [stakingLastUpdated, stakedAmount, onChainApy])

  // Fetch data on mount and wallet change
  useEffect(() => {
    fetchOnChainData()
    const interval = setInterval(fetchOnChainData, 30000)
    return () => clearInterval(interval)
  }, [publicKey])

  // Helper to format input with commas
  const formatWithCommas = (value: string) => {
    const [intPart, decPart] = value.replace(/,/g, '').split('.')
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return decPart ? `${formattedInt}.${decPart}` : formattedInt
  }

  // Build provider for transactions
  const getProvider = () => {
    if (!publicKey || !signTransaction) throw new Error("Wallet not connected")
    const connection = new Connection(rpcUrl)
    const wallet = {
      publicKey,
      signTransaction,
      signAllTransactions: async <T extends VersionedTransaction | Transaction>(txs: T[]) => {
        const signedTxs = []
        for (const tx of txs) {
          signedTxs.push(await signTransaction(tx as VersionedTransaction) as T)
        }
        return signedTxs
      }
    }
    return new AnchorProvider(connection, wallet as any, { preflightCommitment: "processed" })
  }

  // Update pending rewards on-chain
  const updatePendingRewards = async () => {
    const provider = getProvider()
    const program = new Program<StakingProgram>(IDL, provider)
    const stakePool = findPda([Buffer.from("stake_pool")], programId)
    const config = findPda([Buffer.from("config")], programId)
    const stakeAccount = findPda([Buffer.from("stake_account"), stakePool.toBuffer(), publicKey!.toBuffer()], programId)

    const ix = await program.methods.updatePendingRewards()
      .accounts({
        signer: publicKey!, // Fixed: Use PublicKey, not wallet object
        stakePool: stakePool,
        stakeAccount: stakeAccount,
        stakePoolConfig: config,
      })
      .instruction()

    const { blockhash } = await provider.connection.getLatestBlockhash()
    const message = new TransactionMessage({
      payerKey: publicKey!,
      recentBlockhash: blockhash,
      instructions: [ix]
    }).compileToV0Message()

    const tx = new VersionedTransaction(message)
    const signedTx = await signTransaction!(tx)
    const signature = await provider.connection.sendTransaction(signedTx)
    await provider.connection.confirmTransaction(signature, "confirmed")
    return signature
  }

  const handleStake = async () => {
    const cleanAmount = stakeAmount.replace(/,/g, '')
    if (!cleanAmount || isNaN(Number(cleanAmount)) || Number(cleanAmount) <= 0 || onChainApy === 0) return
    setIsStaking(true)
    try {
      const amount = Number(cleanAmount)
      const lamports = new BN(amount * 1e9)

      const provider = getProvider()
      const connection = provider.connection
      const program = new Program<StakingProgram>(IDL, provider)
      const stakePool = findPda([Buffer.from("stake_pool")], programId)
      const config = findPda([Buffer.from("config")], programId)
      const stakeAccount = findPda([Buffer.from("stake_account"), stakePool.toBuffer(), publicKey!.toBuffer()], programId)
      const vault = findPda([Buffer.from("vault"), stakePool.toBuffer()], programId)
      const tokenMint = new PublicKey(LABS_TOKEN_MINT)
      const userTokenAccount = getAssociatedTokenAddressSync(tokenMint, publicKey!)

      // Check and create user ATA if needed
      let extraIxs = []
      const userAtaInfo = await connection.getAccountInfo(userTokenAccount)
      if (!userAtaInfo) {
        extraIxs.push(
          createAssociatedTokenAccountInstruction(
            publicKey!,
            userTokenAccount,
            publicKey!,
            tokenMint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        )
      }

      const stakeIx = await program.methods.stakeToStakePool(lamports)
        .accounts({
          signer: publicKey!,
          stakePool: stakePool,
          stakePoolConfig: config,
          stakeAccount: stakeAccount,
          userTokenAccount: userTokenAccount,
          vault: vault,
          tokenMint: tokenMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .instruction()

      const { blockhash } = await connection.getLatestBlockhash()
      const message = new TransactionMessage({
        payerKey: publicKey!,
        recentBlockhash: blockhash,
        instructions: [...extraIxs, stakeIx]
      }).compileToV0Message()

      const tx = new VersionedTransaction(message)
      const signedTx = await signTransaction!(tx)
      const signature = await connection.sendTransaction(signedTx)
      await connection.confirmTransaction(signature, "confirmed")

      toast({ title: "Stake Successful", description: `Signature: ${signature}` })
      setStakeAmount("")
      await fetchOnChainData()
    } catch (error) {
      console.error("Stake error:", error)
      toast({ title: "Stake Failed", description: error.message || "Transaction error", variant: "destructive" })
    } finally {
      setIsStaking(false)
    }
  }

  const handleUnstake = async () => {
    const cleanAmount = unstakeAmount.replace(/,/g, '')
    if (!cleanAmount || isNaN(Number(cleanAmount)) || Number(cleanAmount) <= 0 || onChainApy === 0) return
    setIsUnstaking(true)
    try {
      await updatePendingRewards()

      const amount = Number(cleanAmount)
      const lamports = new BN(amount * 1e9)

      const provider = getProvider()
      const connection = provider.connection
      const program = new Program<StakingProgram>(IDL, provider)
      const stakePool = findPda([Buffer.from("stake_pool")], programId)
      const config = findPda([Buffer.from("config")], programId)
      const stakeAccount = findPda([Buffer.from("stake_account"), stakePool.toBuffer(), publicKey!.toBuffer()], programId)
      const vault = findPda([Buffer.from("vault"), stakePool.toBuffer()], programId)
      const vaultAuthority = findPda([Buffer.from("vault_authority"), stakePool.toBuffer()], programId)
      const tokenMint = new PublicKey(LABS_TOKEN_MINT)
      const userTokenAccount = getAssociatedTokenAddressSync(tokenMint, publicKey!)

      // Check and create user ATA if needed (rare for unstake, but safe)
      let extraIxs = []
      const userAtaInfo = await connection.getAccountInfo(userTokenAccount)
      if (!userAtaInfo) {
        extraIxs.push(
          createAssociatedTokenAccountInstruction(
            publicKey!,
            userTokenAccount,
            publicKey!,
            tokenMint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        )
      }

      const unstakeIx = await program.methods.unstakeFromStakePool(lamports)
        .accounts({
          signer: publicKey!,
          stakePool: stakePool,
          stakePoolConfig: config,
          stakeAccount: stakeAccount,
          userTokenAccount: userTokenAccount,
          vault: vault,
          vaultAuthority: vaultAuthority,
          tokenMint: tokenMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .instruction()

      const { blockhash } = await connection.getLatestBlockhash()
      const message = new TransactionMessage({
        payerKey: publicKey!,
        recentBlockhash: blockhash,
        instructions: [...extraIxs, unstakeIx]
      }).compileToV0Message()

      const tx = new VersionedTransaction(message)
      const signedTx = await signTransaction!(tx)
      const signature = await connection.sendTransaction(signedTx)
      await connection.confirmTransaction(signature, "confirmed")

      toast({ title: "Unstake Successful", description: `Signature: ${signature}` })
      setUnstakeAmount("")
      await fetchOnChainData()
    } catch (error) {
      console.error("Unstake error:", error)
      toast({ title: "Unstake Failed", description: error.message || "Transaction error", variant: "destructive" })
    } finally {
      setIsUnstaking(false)
    }
  }

  const handleClaimRewards = async () => {
    if (!rewardMint || pendingRewards <= 0) return
    setIsClaiming(true)
    try {
      await updatePendingRewards()

      const provider = getProvider()
      const connection = provider.connection
      const program = new Program<StakingProgram>(IDL, provider)
      const stakePool = findPda([Buffer.from("stake_pool")], programId)
      const config = findPda([Buffer.from("config")], programId)
      const stakeAccount = findPda([Buffer.from("stake_account"), stakePool.toBuffer(), publicKey!.toBuffer()], programId)
      const mintAuthority = findPda([Buffer.from("mint_authority")], programId)
      const userRewardAccount = getAssociatedTokenAddressSync(rewardMint, publicKey!)

      // Check and create user reward ATA if needed
      let extraIxs = []
      const userRewardAtaInfo = await connection.getAccountInfo(userRewardAccount)
      if (!userRewardAtaInfo) {
        extraIxs.push(
          createAssociatedTokenAccountInstruction(
            publicKey!,
            userRewardAccount,
            publicKey!,
            rewardMint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        )
      }

      const claimIx = await program.methods.claimRewards()
        .accounts({
          signer: publicKey!,
          stakePool: stakePool,
          stakePoolConfig: config,
          stakeAccount: stakeAccount,
          mintAuthority: mintAuthority,
          rewardMint: rewardMint,
          userRewardAccount: userRewardAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .instruction()

      const { blockhash } = await connection.getLatestBlockhash()
      const message = new TransactionMessage({
        payerKey: publicKey!,
        recentBlockhash: blockhash,
        instructions: [...extraIxs, claimIx]
      }).compileToV0Message()

      const tx = new VersionedTransaction(message)
      const signedTx = await signTransaction!(tx)
      const signature = await connection.sendTransaction(signedTx)
      await connection.confirmTransaction(signature, "confirmed")

      toast({ title: "Claim Successful", description: `Signature: ${signature}` })
      await fetchOnChainData()
    } catch (error) {
      console.error("Claim error:", error)
      toast({ title: "Claim Failed", description: error.message || "Transaction error", variant: "destructive" })
    } finally {
      setIsClaiming(false)
    }
  }

  // Smooth number component (unchanged)
  const SmoothNumber = ({ value, decimals = 4, align = 'right' }: { value: number, decimals?: number, align?: 'right' | 'center' }) => {
    const [displayValue, setDisplayValue] = useState(value)

    useEffect(() => {
      const startValue = displayValue
      const endValue = value
      const duration = 100
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOutQuad = (t: number) => t * (2 - t)
        const currentValue = startValue + (endValue - startValue) * easeOutQuad(progress)
        setDisplayValue(currentValue)
        if (progress < 1) requestAnimationFrame(animate)
      }

      requestAnimationFrame(animate)
    }, [value])

    const formatNumber = (num: number) => {
      const useGrouping = align !== 'center'
      const formatted = num.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping,
      })

      if (align === 'center') return <span className="tabular-nums">{formatted}</span>

      const [intPart, decPart] = formatted.split('.')
      return (
        <span className="tabular-nums">
          <span className="inline-block min-w-[1.2em] text-right">{intPart}</span>
          <span className="inline-block">.</span>
          <span className="inline-block min-w-[4em] text-left">{decPart}</span>
        </span>
      )
    }

    return formatNumber(displayValue)
  }

  const handleReset = () => {
    setStakeAmount("")
    setUnstakeAmount("")
    setIsStaking(false)
    setIsUnstaking(false)
    fetchOnChainData()
  }

  const availableBalance = Math.max(walletBalance - stakedAmount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050810] via-[#0a0f1a] to-[#050810] text-white relative overflow-x-hidden flex flex-col">
      <div className="absolute inset-0 pointer-events-none z-0 bg-black/40 backdrop-blur-2xl" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(74,133,255,0.03) 0%, transparent 70%)'
      }} />
      <FlowingBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="">
          <Navbar onTitleClick={handleReset} />
        </div>

        <div className="container mx-auto sm:px-2 px-1 py-6 sm:py-8 md:py-12 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-8 md:gap-10">
            {/* Main Staking Interface */}
            <Card className="lg:col-span-3 bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30">
              <CardHeader>
                <CardTitle className="text-base sm:text-xl font-medium text-white">The Staking Lab</CardTitle>
                <CardDescription className="text-gray-400 font-light text-xs sm:text-base">
                  Stake your LABS tokens to earn xLABS revenue sharing tokens!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-10">
                  {/* Stake Section */}
                  <div className="space-y-3 sm:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                      <div className="p-2 bg-[#4a85ff]/20 rounded-lg">
                        <ArrowUpRight className="w-5 h-5 text-[#4a85ff]" />
                      </div>
                      <h3 className="text-base sm:text-xl font-medium text-white">Stake Tokens</h3>
                    </div>

                    <div className="space-y-1 sm:space-y-4">
                      <Label htmlFor="stake-amount" className="text-gray-300 font-medium text-xs sm:text-base">
                        Amount to Stake
                      </Label>
                      <div className="relative">
                        <Input
                          id="stake-amount"
                          type="text"
                          autoComplete="off"
                          inputMode="decimal"
                          pattern="[0-9]*\.?[0-9]*"
                          placeholder="0.00"
                          value={formatWithCommas(stakeAmount)}
                          onChange={e => {
                            const rawValue = e.target.value.replace(/,/g, '')
                            if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
                              setStakeAmount(rawValue)
                            }
                          }}
                          className="bg-gray-800/30 border-gray-600/40 text-white placeholder-gray-500 pr-16 py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl backdrop-blur-xl w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm font-medium">LABS</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span
                          className="text-gray-400 underline-balance hover:text-[#4a85ff] transition-colors cursor-pointer"
                          onClick={() => setStakeAmount(availableBalance.toString())}
                        >
                          Available: {availableBalance.toFixed(2)} LABS
                        </span>
                      </div>
                    </div>

                    <Dialog open={isStakeDialogOpen} onOpenChange={setIsStakeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          disabled={!stakeAmount || Number(stakeAmount) <= 0 || isStaking || onChainApy === 0}
                          className="w-full bg-[#4a85ff] hover:bg-[#3a75ef] text-white py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] disabled:opacity-50 disabled:hover:scale-100 font-medium"
                        >
                          {isStaking ? "Staking..." : "Stake LABS"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
                        <DialogHeader>
                          <DialogTitle>Confirm Stake</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Stake {stakeAmount} LABS?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end space-x-4 pt-4">
                          <Button variant="outline" onClick={() => setIsStakeDialogOpen(false)}>Cancel</Button>
                          <Button onClick={() => {
                            handleStake()
                            setIsStakeDialogOpen(false)
                          }}>Confirm</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Unstake Section */}
                  <div className="space-y-3 sm:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                      <div className="p-2 bg-orange-400/20 rounded-lg">
                        <ArrowDownRight className="w-5 h-5 text-orange-400" />
                      </div>
                      <h3 className="text-base sm:text-xl font-medium text-white">Unstake Tokens</h3>
                    </div>

                    <div className="space-y-1 sm:space-y-4">
                      <Label htmlFor="unstake-amount" className="text-gray-300 font-medium text-xs sm:text-base">
                        Amount to Unstake
                      </Label>
                      <div className="relative">
                        <Input
                          id="unstake-amount"
                          type="text"
                          autoComplete="off"
                          inputMode="decimal"
                          pattern="[0-9]*\.?[0-9]*"
                          placeholder="0.00"
                          value={formatWithCommas(unstakeAmount)}
                          onChange={e => {
                            const rawValue = e.target.value.replace(/,/g, '')
                            if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
                              setUnstakeAmount(rawValue)
                            }
                          }}
                          className="bg-gray-800/30 border-gray-600/40 text-white placeholder-gray-500 pr-16 py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl backdrop-blur-xl w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm font-medium">LABS</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span
                          className="text-gray-400 underline-balance hover:text-[#4a85ff] transition-colors cursor-pointer"
                          onClick={() => setUnstakeAmount(stakedAmount.toString())}
                        >
                          Staked: {stakedAmount.toFixed(2)} LABS
                        </span>
                      </div>
                    </div>

                    <Dialog open={isUnstakeDialogOpen} onOpenChange={setIsUnstakeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          disabled={!unstakeAmount || Number(unstakeAmount) <= 0 || isUnstaking || onChainApy === 0}
                          className="w-full bg-white text-black hover:bg-gray-200 py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 font-medium"
                        >
                          {isUnstaking ? "Unstaking..." : "Unstake LABS"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
                        <DialogHeader>
                          <DialogTitle>Confirm Unstake</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Unstake {unstakeAmount} LABS?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end space-x-4 pt-4">
                          <Button variant="outline" onClick={() => setIsUnstakeDialogOpen(false)}>Cancel</Button>
                          <Button onClick={() => {
                            handleUnstake()
                            setIsUnstakeDialogOpen(false)
                          }}>Confirm</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-8">
              {/* Stake Pool Details */}
              <Card className="bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30">
                <CardHeader>
                  <CardTitle className="text-base sm:text-xl font-medium text-white">Stake Pool Details</CardTitle>
                  <CardDescription className="text-gray-400 font-light text-xs sm:text-base">
                    The current state of the stake pool.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Value Locked (LABS):</span>
                    <span className="font-mono text-white">{totalValueLocked.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Staking APY:</span>
                    <span className="font-mono text-[#4a85ff]">{onChainApy.toFixed(2)}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Account Overview */}
              <Card className="bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30">
                <CardHeader>
                  <CardTitle className="text-base sm:text-xl font-medium text-white">Account Overview</CardTitle>
                  <CardDescription className="text-gray-400 font-light text-xs sm:text-base">
                    Your personal staking details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Available Balance:</span>
                    <span className="font-mono text-white">{availableBalance.toFixed(2)} LABS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Staked Amount:</span>
                    <span className="font-mono text-white">{stakedAmount.toFixed(2)} LABS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Rewards Earned:</span>
                    <span className="font-mono text-[#4a85ff]">{totalRewardsEarned.toFixed(4)} xLABS</span>
                  </div>
                </CardContent>
              </Card>

              {/* Claim Rewards */}
              <Card className="bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30">
                <CardHeader>
                  <CardTitle className="text-base sm:text-xl font-medium text-white">Claim Rewards</CardTitle>
                  <CardDescription className="text-gray-400 font-light text-xs sm:text-base">Your current xLABS tokens to claim</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-6">
                  <div className="text-center py-2 sm:py-6">
                    <p className="text-xl sm:text-4xl font-light text-[#4a85ff] mb-2">
                      <SmoothNumber value={pendingRewards} />
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">xLABS</p>
                  </div>
                  <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        disabled={pendingRewards <= 0 || isClaiming || !rewardMint}
                        className="w-full bg-white text-black hover:bg-gray-100 py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] font-medium disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {isClaiming ? "Claiming..." : pendingRewards > 0 ? "Claim Rewards" : "No Rewards to Claim"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
                      <DialogHeader>
                        <DialogTitle>Confirm Claim</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Claim {pendingRewards.toFixed(4)} xLABS?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end space-x-4 pt-4">
                        <Button variant="outline" onClick={() => setIsClaimDialogOpen(false)}>Cancel</Button>
                        <Button onClick={() => {
                          handleClaimRewards()
                          setIsClaimDialogOpen(false)
                        }}>Confirm</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Footer />
      </div>
      <Toaster />
    </div>
  )
}