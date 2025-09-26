"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { useEnhancedInitializeStakePoolConfigMutation, useEnhancedInitializeXLabsMutation, useEnhancedInitializeStakePoolMutation, useEnhancedDeleteStakePoolConfigMutation, useEnhancedDeleteStakePoolMutation, useEnhancedUpdateStakePoolConfigMutation } from "@/components/admin/admin-mutations"
import { TransactionButton } from "@/components/ui/transaction-button"
import { useWalletUi, WalletUiDropdown } from "@wallet-ui/react"
import { useXLabsMintAddress, useLabsMintAddress, useVaultAddress, useStakePoolAddress, useStakingProgramProgramId, useStakePoolConfigAddress, useStakePoolConfigData } from "@/components/shared/data-access"
import { isAdminWallet } from "@/lib/admin-config"
import { ellipsify } from "@/lib/utils"
import { REFETCH_DELAY } from "@/components/constants"

export default function AdminPanelPage() {
  const { account } = useWalletUi()

  if (!account) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access</h1>
          <p className="mb-4">Connect your wallet to access the admin panel</p>
          <WalletUiDropdown />
        </div>
      </div>
    )
  }

  if (!isAdminWallet(account.address)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-2">You are not authorized to view this page.</p>
          <p className="text-sm text-gray-400">Connected wallet: {account.publicKey}</p>
        </div>
      </div>
    )
  }

  return (
    <AdminPanelPageConnected />
  );
}

function AdminPanelPageConnected() {
  const [apy, setApy] = useState("12.5")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isInitializeStakePoolConfigDialogOpen, setIsInitializeStakePoolConfigDialogOpen] = useState(false)
  const [isDeleteStakePoolConfigDialogOpen, setIsDeleteStakePoolConfigDialogOpen] = useState(false)
  const [isInitializeXLabsMintDialogOpen, setIsInitializeXLabsMintDialogOpen] = useState(false)
  const [isInitializeStakePoolDialogOpen, setIsInitializeStakePoolDialogOpen] = useState(false)
  const [isDeleteStakePoolDialogOpen, setIsDeleteStakePoolDialogOpen] = useState(false)

  // Enhanced mutations
  const initializeXLabsMutation = useEnhancedInitializeXLabsMutation()
  const initializeStakePoolConfigMutation = useEnhancedInitializeStakePoolConfigMutation()
  const initializeStakePoolMutation = useEnhancedInitializeStakePoolMutation()
  const deleteStakePoolConfigMutation = useEnhancedDeleteStakePoolConfigMutation()
  const deleteStakePoolMutation = useEnhancedDeleteStakePoolMutation()
  const updateStakePoolConfigMutation = useEnhancedUpdateStakePoolConfigMutation()

  // Query hooks
  const xLabsMintAddressQuery = useXLabsMintAddress()
  const labsMintAddress = useLabsMintAddress()
  const vaultAddressQuery = useVaultAddress()
  const stakePoolAddressQuery = useStakePoolAddress()
  const stakePoolConfigAddressQuery = useStakePoolConfigAddress()
  const stakePoolConfigDataQuery = useStakePoolConfigData()
  const programId = useStakingProgramProgramId()

  // Transaction state helpers
  const getTransactionState = (mutation: { isPending: boolean; isSuccess: boolean; isError: boolean }) => {
    if (mutation.isPending) return mutation.isSuccess ? 'success' : 'submitting'
    if (mutation.isError) return 'error'
    return 'idle'
  }

  // Manual refetch helper
  const forceRefreshAllQueries = async () => {
    // Force refresh all admin panel queries to ensure UI updates
    await Promise.all([
      stakePoolConfigDataQuery.refetch(),
      xLabsMintAddressQuery.refetch(),
      vaultAddressQuery.refetch(),
      stakePoolAddressQuery.refetch(),
      stakePoolConfigAddressQuery.refetch(),
    ]);
  };

  // Enhanced handlers with delayed refresh
  const handleSetApy = async () => {
    setIsDialogOpen(false)
    const aprBps = Math.round(parseFloat(apy) * 100)
    try {
      await updateStakePoolConfigMutation.mutateAsync(aprBps)
      // Wait for blockchain data to propagate, then refetch
      setTimeout(async () => {
        await forceRefreshAllQueries()
      }, REFETCH_DELAY);
    } catch {
      // Error handled by enhanced mutation
    }
  }

  const handleInitializeStakePoolConfig = async () => {
    setIsInitializeStakePoolConfigDialogOpen(false)
    const aprBps = Math.round(parseFloat(apy) * 100)
    try {
      await initializeStakePoolConfigMutation.mutateAsync(aprBps)
      // Wait for blockchain data to propagate, then refetch
      setTimeout(async () => {
        await forceRefreshAllQueries()
      }, REFETCH_DELAY);
    } catch {
      // Error handled by enhanced mutation
    }
  }

  const handleDeleteStakePoolConfig = async () => {
    setIsDeleteStakePoolConfigDialogOpen(false)
    try {
      await deleteStakePoolConfigMutation.mutateAsync()
      // Wait for blockchain data to propagate, then refetch
      setTimeout(async () => {
        await forceRefreshAllQueries()
      }, REFETCH_DELAY);
    } catch {
      // Error handled by enhanced mutation
    }
  }

  const handleInitializeXLabsMint = async () => {
    setIsInitializeXLabsMintDialogOpen(false)
    try {
      await initializeXLabsMutation.mutateAsync()
      // Wait for blockchain data to propagate, then refetch
      setTimeout(async () => {
        await forceRefreshAllQueries()
      }, REFETCH_DELAY);
    } catch {
      // Error handled by enhanced mutation
    }
  }

  const handleInitializeStakePool = async () => {
    setIsInitializeStakePoolDialogOpen(false)
    try {
      await initializeStakePoolMutation.mutateAsync()
      // Wait for blockchain data to propagate, then refetch
      setTimeout(async () => {
        await forceRefreshAllQueries()
      }, REFETCH_DELAY);
    } catch {
      // Error handled by enhanced mutation
    }
  }

  const handleDeleteStakePool = async () => {
    setIsDeleteStakePoolDialogOpen(false)
    try {
      await deleteStakePoolMutation.mutateAsync()
      // Wait for blockchain data to propagate, then refetch
      setTimeout(async () => {
        await forceRefreshAllQueries()
      }, REFETCH_DELAY);
    } catch {
      // Error handled by enhanced mutation
    }
  }

  return (
    <>
      <div className="container mx-auto sm:px-2 px-1 py-6 sm:py-8 md:py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-900/20 border border-gray-700/40 shadow-lg shadow-black/40 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#4a85ff]/60 hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] hover:bg-gray-900/30">
            <CardHeader>
              <CardTitle className="text-lg sm:text-2xl md:text-3xl font-bold text-white">Admin Panel</CardTitle>
              <CardDescription className="text-gray-400 text-sm sm:text-lg font-light">
                Manage staking contract settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* APY Settings */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-xl font-medium text-white">Staking APY</h3>

                {/* Current APY Display */}
                {stakePoolConfigDataQuery.data && (
                  <div className="p-3 sm:p-4 bg-gray-800/30 rounded-lg border border-gray-700/40">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm sm:text-base">Current APY:</span>
                      <span className="text-[#4a85ff] font-semibold text-lg sm:text-xl">
                        {(Number(stakePoolConfigDataQuery.data.data.aprBps) / 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-400 text-xs sm:text-sm">Basis Points:</span>
                      <span className="text-gray-400 text-xs sm:text-sm">
                        {stakePoolConfigDataQuery.data.data.aprBps.toString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="apy-input" className="text-gray-300 font-medium text-xs sm:text-base">
                      Set Annual Percentage Yield (APY)
                    </Label>
                    <div className="relative">
                      <Input
                        id="apy-input"
                        type="number"
                        placeholder="e.g., 10"
                        value={apy}
                        onChange={(e) => setApy(e.target.value)}
                        className="bg-gray-800/30 border-gray-600/40 text-white placeholder-gray-500 pr-12 py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl backdrop-blur-xl w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm font-medium">%</span>
                    </div>
                  </div>
                  <TransactionButton
                    transactionState={getTransactionState(updateStakePoolConfigMutation)}
                    idleText="Update APY"
                    submittingText="Updating..."
                    confirmingText="Confirming..."
                    successText="Updated!"
                    errorText="Update Failed - Retry"
                    onClick={() => setIsDialogOpen(true)}
                    onRetry={() => updateStakePoolConfigMutation.reset()}
                    className="w-full md:w-auto bg-[#4a85ff] hover:bg-[#3a75ef] text-white py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] disabled:opacity-50 font-medium"
                  />
                </div>
              </div>

              {/* Staking Vault Management */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-xl font-medium text-white">Stake Program</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gray-800/30 border-gray-700/60 p-4 rounded-lg">
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-lg font-semibold text-white">Initialize Stake Program</CardTitle>
                      <CardDescription className="text-gray-400 text-sm">Initialize the on-chain staking program.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                      <TransactionButton
                        transactionState={getTransactionState(initializeStakePoolConfigMutation)}
                        idleText="Initialize Stake Pool Config"
                        submittingText="Initializing..."
                        confirmingText="Confirming..."
                        successText="Initialized!"
                        errorText="Failed - Retry"
                        onClick={() => setIsInitializeStakePoolConfigDialogOpen(true)}
                        onRetry={() => initializeStakePoolConfigMutation.reset()}
                        className="w-full bg-zinc-800 text-zinc-50 hover:bg-zinc-700"
                      />
                      <TransactionButton
                        transactionState={getTransactionState(deleteStakePoolConfigMutation)}
                        idleText="Delete Stake Pool Config"
                        submittingText="Deleting..."
                        confirmingText="Confirming..."
                        successText="Deleted!"
                        errorText="Failed - Retry"
                        onClick={() => setIsDeleteStakePoolConfigDialogOpen(true)}
                        onRetry={() => deleteStakePoolConfigMutation.reset()}
                        className="w-full bg-red-900/70 text-red-100 hover:bg-red-800/70"
                      />
                      <TransactionButton
                        transactionState={getTransactionState(initializeStakePoolMutation)}
                        idleText="Initialize Stake Pool"
                        submittingText="Initializing..."
                        confirmingText="Confirming..."
                        successText="Initialized!"
                        errorText="Failed - Retry"
                        onClick={() => setIsInitializeStakePoolDialogOpen(true)}
                        onRetry={() => initializeStakePoolMutation.reset()}
                        className="w-full bg-blue-800 text-blue-50 hover:bg-blue-700"
                      />
                      <TransactionButton
                        transactionState={getTransactionState(deleteStakePoolMutation)}
                        idleText="Delete Stake Pool"
                        submittingText="Deleting..."
                        confirmingText="Confirming..."
                        successText="Deleted!"
                        errorText="Failed - Retry"
                        onClick={() => setIsDeleteStakePoolDialogOpen(true)}
                        onRetry={() => deleteStakePoolMutation.reset()}
                        className="w-full bg-red-900/70 text-red-100 hover:bg-red-800/70"
                      />
                      <TransactionButton
                        transactionState={getTransactionState(initializeXLabsMutation)}
                        idleText="Initialize X Labs Mint"
                        submittingText="Initializing..."
                        confirmingText="Confirming..."
                        successText="Initialized!"
                        errorText="Failed - Retry"
                        onClick={() => setIsInitializeXLabsMintDialogOpen(true)}
                        onRetry={() => initializeXLabsMutation.reset()}
                        className="w-full bg-zinc-800 text-zinc-50 hover:bg-zinc-700"
                      />
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/30 border-gray-700/60 p-4 rounded-lg">
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-lg font-semibold text-white">Stake Pool Status</CardTitle>
                      <CardDescription className="text-gray-400 text-sm">Current state of the stake pool.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Program Address:</span>
                        <a
                          href={`https://solscan.io/account/${programId}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                          title={programId}
                        >
                          {ellipsify(programId, 6)}
                        </a>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Stake Pool Address:</span>
                        {stakePoolAddressQuery.isLoading ? (
                          <span className="font-mono text-xs text-gray-500">Loading...</span>
                        ) : stakePoolAddressQuery.data?.[0] ? (
                          <a
                            href={`https://solscan.io/account/${stakePoolAddressQuery.data[0]}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                            title={stakePoolAddressQuery.data[0]}
                          >
                            {ellipsify(stakePoolAddressQuery.data[0], 6)}
                          </a>
                        ) : (
                          <span className="font-mono text-xs text-gray-500">Not found</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Stake Pool Config Address:</span>
                        {stakePoolConfigAddressQuery.isLoading ? (
                          <span className="font-mono text-xs text-gray-500">Loading...</span>
                        ) : stakePoolConfigAddressQuery.data?.[0] ? (
                          <a
                            href={`https://solscan.io/account/${stakePoolConfigAddressQuery.data[0]}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                            title={stakePoolConfigAddressQuery.data[0]}
                          >
                            {ellipsify(stakePoolConfigAddressQuery.data[0], 6)}
                          </a>
                        ) : (
                          <span className="font-mono text-xs text-gray-500">Not found</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">LABS Token Address:</span>
                        <a
                          href={`https://solscan.io/token/${labsMintAddress}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                          title={labsMintAddress}
                        >
                          {ellipsify(labsMintAddress, 6)}
                        </a>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">xLABS Token Address:</span>
                        {xLabsMintAddressQuery.isLoading ? (
                          <span className="font-mono text-xs text-gray-500">Loading...</span>
                        ) : xLabsMintAddressQuery.data?.[0] ? (
                          <a
                            href={`https://solscan.io/token/${xLabsMintAddressQuery.data[0]}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                            title={xLabsMintAddressQuery.data[0]}
                          >
                            {ellipsify(xLabsMintAddressQuery.data[0], 6)}
                          </a>
                        ) : (
                          <span className="font-mono text-xs text-gray-500">Not found</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Vault Address:</span>
                        {vaultAddressQuery.isLoading ? (
                          <span className="font-mono text-xs text-gray-500">Loading...</span>
                        ) : vaultAddressQuery.data ? (
                          <a
                            href={`https://solscan.io/account/${vaultAddressQuery.data}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                            title={vaultAddressQuery.data}
                          >
                            {ellipsify(vaultAddressQuery.data, 6)}
                          </a>
                        ) : (
                          <span className="font-mono text-xs text-gray-500">Not found</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* APY Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
          <DialogHeader>
            <DialogTitle>Confirm APY Change</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to change the staking APY to {apy}%?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <TransactionButton
              transactionState="idle"
              idleText="Cancel"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={updateStakePoolConfigMutation.isPending}
              className="bg-gray-800 border border-gray-600 text-white hover:bg-gray-700"
            />
            <TransactionButton
              transactionState={getTransactionState(updateStakePoolConfigMutation)}
              idleText="Confirm"
              submittingText="Updating..."
              confirmingText="Confirming..."
              successText="Updated!"
              onClick={handleSetApy}
              disabled={updateStakePoolConfigMutation.isPending}
              className="bg-[#4a85ff] hover:bg-[#3a75ef] text-white shadow-md transition-all hover:shadow-[0_0_20px_rgba(74,133,255,0.3)]"
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initialize Stake Pool Config Dialog */}
      <Dialog open={isInitializeStakePoolConfigDialogOpen} onOpenChange={setIsInitializeStakePoolConfigDialogOpen}>
        <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Initialize Stake Pool Config</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to initialize the stake pool config with APY: <span className="font-semibold text-white">{apy}%</span> ({Math.round(parseFloat(apy) * 100)} <span className="font-semibold text-white">basis points</span>)?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <TransactionButton
              transactionState="idle"
              idleText="Cancel"
              variant="outline"
              onClick={() => setIsInitializeStakePoolConfigDialogOpen(false)}
              disabled={initializeStakePoolConfigMutation.isPending}
              className="bg-gray-800 border border-gray-600 text-white hover:bg-gray-700"
            />
            <TransactionButton
              transactionState={getTransactionState(initializeStakePoolConfigMutation)}
              idleText="Confirm"
              submittingText="Initializing..."
              confirmingText="Confirming..."
              successText="Initialized!"
              onClick={handleInitializeStakePoolConfig}
              disabled={initializeStakePoolConfigMutation.isPending}
              className="bg-[#4a85ff] hover:bg-[#3a75ef] text-white shadow-md transition-all hover:shadow-[0_0_20px_rgba(74,133,255,0.3)]"
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Other dialogs would follow the same pattern... */}
      {/* For brevity, I'll include just the key dialogs. The rest follow the same enhanced pattern */}

      {/* Delete Stake Pool Config Dialog */}
      <Dialog open={isDeleteStakePoolConfigDialogOpen} onOpenChange={setIsDeleteStakePoolConfigDialogOpen}>
        <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Delete Stake Pool Config</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete the stake pool config? This action is destructive and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <TransactionButton
              transactionState="idle"
              idleText="Cancel"
              variant="outline"
              onClick={() => setIsDeleteStakePoolConfigDialogOpen(false)}
              disabled={deleteStakePoolConfigMutation.isPending}
              className="bg-gray-800 border border-gray-600 text-white hover:bg-gray-700"
            />
            <TransactionButton
              transactionState={getTransactionState(deleteStakePoolConfigMutation)}
              idleText="Confirm Deletion"
              submittingText="Deleting..."
              confirmingText="Confirming..."
              successText="Deleted!"
              onClick={handleDeleteStakePoolConfig}
              disabled={deleteStakePoolConfigMutation.isPending}
              className="bg-red-600 hover:bg-red-500 text-white shadow-md transition-all"
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initialize xLABS Mint Dialog */}
      <Dialog open={isInitializeXLabsMintDialogOpen} onOpenChange={setIsInitializeXLabsMintDialogOpen}>
        <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Initialize xLABS Mint</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to initialize the xLABS mint?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <TransactionButton
              transactionState="idle"
              idleText="Cancel"
              variant="outline"
              onClick={() => setIsInitializeXLabsMintDialogOpen(false)}
              disabled={initializeXLabsMutation.isPending}
              className="bg-gray-800 border border-gray-600 text-white hover:bg-gray-700"
            />
            <TransactionButton
              transactionState={getTransactionState(initializeXLabsMutation)}
              idleText="Confirm"
              submittingText="Initializing..."
              confirmingText="Confirming..."
              successText="Initialized!"
              onClick={handleInitializeXLabsMint}
              disabled={initializeXLabsMutation.isPending}
              className="bg-[#4a85ff] hover:bg-[#3a75ef] text-white shadow-md transition-all hover:shadow-[0_0_20px_rgba(74,133,255,0.3)]"
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initialize Stake Pool Dialog */}
      <Dialog open={isInitializeStakePoolDialogOpen} onOpenChange={setIsInitializeStakePoolDialogOpen}>
        <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Initialize Stake Pool</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to initialize the stake pool?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <TransactionButton
              transactionState="idle"
              idleText="Cancel"
              variant="outline"
              onClick={() => setIsInitializeStakePoolDialogOpen(false)}
              disabled={initializeStakePoolMutation.isPending}
              className="bg-gray-800 border border-gray-600 text-white hover:bg-gray-700"
            />
            <TransactionButton
              transactionState={getTransactionState(initializeStakePoolMutation)}
              idleText="Confirm"
              submittingText="Initializing..."
              confirmingText="Confirming..."
              successText="Initialized!"
              onClick={handleInitializeStakePool}
              disabled={initializeStakePoolMutation.isPending}
              className="bg-[#4a85ff] hover:bg-[#3a75ef] text-white shadow-md transition-all hover:shadow-[0_0_20px_rgba(74,133,255,0.3)]"
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Stake Pool Dialog */}
      <Dialog open={isDeleteStakePoolDialogOpen} onOpenChange={setIsDeleteStakePoolDialogOpen}>
        <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Delete Stake Pool</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete the stake pool? This action is destructive and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <TransactionButton
              transactionState="idle"
              idleText="Cancel"
              variant="outline"
              onClick={() => setIsDeleteStakePoolDialogOpen(false)}
              disabled={deleteStakePoolMutation.isPending}
              className="bg-gray-800 border border-gray-600 text-white hover:bg-gray-700"
            />
            <TransactionButton
              transactionState={getTransactionState(deleteStakePoolMutation)}
              idleText="Confirm Deletion"
              submittingText="Deleting..."
              confirmingText="Confirming..."
              successText="Deleted!"
              onClick={handleDeleteStakePool}
              disabled={deleteStakePoolMutation.isPending}
              className="bg-red-600 hover:bg-red-500 text-white shadow-md transition-all"
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}