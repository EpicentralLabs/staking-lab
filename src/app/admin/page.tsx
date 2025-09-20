"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { CheckCircleIcon, XCircleIcon } from "lucide-react"
import { useInitializeStakePoolConfigMutation, useInitializeXLabsMutation, useInitializeStakePoolMutation, useDeleteStakePoolConfigMutation, useDeleteStakePoolMutation, useUpdateStakePoolConfigMutation } from "@/components/admin/admin-data-access"
import { useWalletUi, WalletUiDropdown } from "@wallet-ui/react"
import { useXLabsMintAddress, useLabsMintAddress, useVaultAddress, useStakePoolAddress, useStakingProgramProgramId, useStakePoolConfigAddress, useStakePoolConfigData } from "@/components/shared/data-access"
import { isAdminWallet } from "@/lib/admin-config"
import { ellipsify } from "@/lib/utils"

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
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isNotificationVisible, setIsNotificationVisible] = useState(false)
  const initializeXLabsMutation = useInitializeXLabsMutation()
  const xLabsMintAddressQuery = useXLabsMintAddress()
  const labsMintAddress = useLabsMintAddress()
  const vaultAddressQuery = useVaultAddress()
  const stakePoolAddressQuery = useStakePoolAddress()
  const stakePoolConfigAddressQuery = useStakePoolConfigAddress()
  const stakePoolConfigDataQuery = useStakePoolConfigData()
  const programId = useStakingProgramProgramId();
  const initializeStakePoolConfigMutation = useInitializeStakePoolConfigMutation()
  const initializeStakePoolMutation = useInitializeStakePoolMutation()
  const deleteStakePoolConfigMutation = useDeleteStakePoolConfigMutation()
  const deleteStakePoolMutation = useDeleteStakePoolMutation()
  const updateStakePoolConfigMutation = useUpdateStakePoolConfigMutation()

  const handleSetApy = async () => {
    setIsDialogOpen(false)

    // Convert percentage to basis points (1% = 100 basis points)
    const aprBps = Math.round(parseFloat(apy) * 100)

    try {
      await updateStakePoolConfigMutation.mutateAsync(aprBps)
      setUpdateMessage({
        type: 'success',
        text: `APY successfully updated to ${apy}% (${aprBps} basis points)`
      })
    } catch (error) {
      setUpdateMessage({
        type: 'error',
        text: 'Failed to update APY'
      })
    }

    setIsNotificationVisible(true)
    setTimeout(() => {
      setIsNotificationVisible(false)
      setTimeout(() => setUpdateMessage(null), 300)
    }, 3000)
  }

  const handleInitializeStakePoolConfig = async () => {
    setIsInitializeStakePoolConfigDialogOpen(false)

    // Convert percentage to basis points (1% = 100 basis points)
    const aprBps = Math.round(parseFloat(apy) * 100)

    try {
      await initializeStakePoolConfigMutation.mutateAsync(aprBps)
      setUpdateMessage({
        type: 'success',
        text: `Stake pool config initialized successfully with APY: ${apy}% (${aprBps} basis points)`
      })
    } catch (error) {
      setUpdateMessage({
        type: 'error',
        text: 'Failed to initialize stake pool config'
      })
    }

    setIsNotificationVisible(true)
    setTimeout(() => {
      setIsNotificationVisible(false)
      setTimeout(() => setUpdateMessage(null), 300)
    }, 3000)
  }

  const handleDeleteStakePoolConfig = async () => {
    setIsDeleteStakePoolConfigDialogOpen(false)

    try {
      await deleteStakePoolConfigMutation.mutateAsync()
      setUpdateMessage({
        type: 'success',
        text: 'Stake pool config deleted successfully'
      })
    } catch (error) {
      setUpdateMessage({
        type: 'error',
        text: 'Failed to delete stake pool config'
      })
    }

    setIsNotificationVisible(true)
    setTimeout(() => {
      setIsNotificationVisible(false)
      setTimeout(() => setUpdateMessage(null), 300)
    }, 3000)
  }

  const handleInitializeXLabsMint = async () => {
    setIsInitializeXLabsMintDialogOpen(false)

    try {
      await initializeXLabsMutation.mutateAsync()
      setUpdateMessage({
        type: 'success',
        text: 'xLABS mint initialized successfully'
      })
    } catch (error) {
      setUpdateMessage({
        type: 'error',
        text: 'Failed to initialize xLABS mint'
      })
    }

    setIsNotificationVisible(true)
    setTimeout(() => {
      setIsNotificationVisible(false)
      setTimeout(() => setUpdateMessage(null), 300)
    }, 3000)
  }

  const handleInitializeStakePool = async () => {
    setIsInitializeStakePoolDialogOpen(false)

    try {
      await initializeStakePoolMutation.mutateAsync()
      setUpdateMessage({
        type: 'success',
        text: 'Stake pool initialized successfully'
      })
    } catch (error) {
      setUpdateMessage({
        type: 'error',
        text: 'Failed to initialize stake pool'
      })
    }

    setIsNotificationVisible(true)
    setTimeout(() => {
      setIsNotificationVisible(false)
      setTimeout(() => setUpdateMessage(null), 300)
    }, 3000)
  }

  const handleDeleteStakePool = async () => {
    setIsDeleteStakePoolDialogOpen(false)

    try {
      await deleteStakePoolMutation.mutateAsync()
      setUpdateMessage({
        type: 'success',
        text: 'Stake pool deleted successfully'
      })
    } catch (error) {
      setUpdateMessage({
        type: 'error',
        text: 'Failed to delete stake pool'
      })
    }

    setIsNotificationVisible(true)
    setTimeout(() => {
      setIsNotificationVisible(false)
      setTimeout(() => setUpdateMessage(null), 300)
    }, 3000)
  }

  return (
    <>
      <div className="container mx-auto sm:px-2 px-1 py-6 sm:py-8 md:py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Notification */}
          <div
            className={`mb-4 transition-all duration-300 ease-out overflow-hidden ${isNotificationVisible ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            {updateMessage && (
              <div
                className={`p-4 rounded-lg flex items-center space-x-3 text-white border ${updateMessage.type === 'success'
                  ? 'bg-green-900/50 border-green-500/50'
                  : 'bg-red-900/50 border-red-500/50'
                  }`}
              >
                {updateMessage.type === 'success' ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-red-400" />
                )}
                <span>{updateMessage.text}</span>
              </div>
            )}
          </div>
        </div>
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
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    disabled={updateStakePoolConfigMutation.isPending}
                    className="w-full md:w-auto bg-[#4a85ff] hover:bg-[#3a75ef] text-white py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] disabled:opacity-50 font-medium"
                  >
                    {updateStakePoolConfigMutation.isPending ? 'Updating...' : 'Update Stake Pool Config (Change APY %)'}
                  </Button>
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
                      <Button
                        onClick={() => setIsInitializeStakePoolConfigDialogOpen(true)}
                        className="w-full bg-zinc-800 text-zinc-50 hover:bg-zinc-700"
                      >
                        Initialize Stake Pool Config
                      </Button>
                      <Button
                        onClick={() => setIsDeleteStakePoolConfigDialogOpen(true)}
                        className="w-full bg-red-900/70 text-red-100 hover:bg-red-800/70"
                      >
                        Delete Stake Pool Config
                      </Button>
                      <Button
                        onClick={() => setIsInitializeStakePoolDialogOpen(true)}
                        disabled={initializeStakePoolMutation.isPending}
                        className="w-full bg-blue-800 text-blue-50 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {initializeStakePoolMutation.isPending ? 'Initializing...' : 'Initialize Stake Pool'}
                      </Button>
                      <Button
                        onClick={() => setIsDeleteStakePoolDialogOpen(true)}
                        className="w-full bg-red-900/70 text-red-100 hover:bg-red-800/70"
                      >
                        Delete Stake Pool
                      </Button>
                      <Button
                        onClick={() => setIsInitializeXLabsMintDialogOpen(true)}
                        disabled={initializeXLabsMutation.isPending}
                        className="w-full bg-zinc-800 text-zinc-50 hover:bg-zinc-700 disabled:opacity-50"
                      >
                        {initializeXLabsMutation.isPending ? 'Initializing...' : 'Initialize X Labs Mint'}
                      </Button>
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
                        ) : vaultAddressQuery.data?.[0] ? (
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
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Unclaimed Rewards (xLABS Pending):</span>
                        <span className="font-mono text-xs text-gray-500">1,234.56</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Claimed Rewards (xLABS Minted):</span>
                        <span className="font-mono text-xs text-gray-500">5,678.90</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total LABS Staked:</span>
                        <span className="font-mono text-xs text-gray-500">50,000.00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">TVL Staked (USDC Value):</span>
                        <span className="font-mono text-xs text-gray-500">$75,000.00</span>
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
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSetApy}
              className="bg-[#4a85ff] hover:bg-[#3a75ef] text-white shadow-md transition-all hover:shadow-[0_0_20px_rgba(74,133,255,0.3)]"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initialize Staking Program Confirmation Dialog */}
      <Dialog open={isInitializeStakePoolConfigDialogOpen} onOpenChange={setIsInitializeStakePoolConfigDialogOpen}>
        <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Initialize Stake Pool Config</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to initialize the stake pool config with APY: <span className="font-semibold text-white">{apy}%</span> ({Math.round(parseFloat(apy) * 100)} <span className="font-semibold text-white">basis points</span>)?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsInitializeStakePoolConfigDialogOpen(false)}
              className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInitializeStakePoolConfig}
              className="bg-[#4a85ff] hover:bg-[#3a75ef] text-white shadow-md transition-all hover:shadow-[0_0_20px_rgba(74,133,255,0.3)]"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Stake Pool Confirmation Dialog */}
      <Dialog open={isDeleteStakePoolConfigDialogOpen} onOpenChange={setIsDeleteStakePoolConfigDialogOpen}>
        <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Delete Stake Pool Config</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete the stake pool config? This action is destructive and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteStakePoolConfigDialogOpen(false)}
              className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteStakePoolConfig}
              className="bg-red-600 hover:bg-red-500 text-white shadow-md transition-all"
            >
              Confirm Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initialize xLABS Mint Confirmation Dialog */}
      <Dialog open={isInitializeXLabsMintDialogOpen} onOpenChange={setIsInitializeXLabsMintDialogOpen}>
        <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Initialize xLABS Mint</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to initialize the xLABS mint?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsInitializeXLabsMintDialogOpen(false)}
              disabled={initializeXLabsMutation.isPending}
              className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white disabled:opacity-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInitializeXLabsMint}
              disabled={initializeXLabsMutation.isPending}
              className="bg-[#4a85ff] hover:bg-[#3a75ef] text-white shadow-md transition-all hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] disabled:opacity-50"
            >
              {initializeXLabsMutation.isPending ? 'Initializing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initialize Stake Pool Confirmation Dialog */}
      <Dialog open={isInitializeStakePoolDialogOpen} onOpenChange={setIsInitializeStakePoolDialogOpen}>
        <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Initialize Stake Pool</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to initialize the stake pool?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsInitializeStakePoolDialogOpen(false)}
              disabled={initializeStakePoolMutation.isPending}
              className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white disabled:opacity-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInitializeStakePool}
              disabled={initializeStakePoolMutation.isPending}
              className="bg-[#4a85ff] hover:bg-[#3a75ef] text-white shadow-md transition-all hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] disabled:opacity-50"
            >
              {initializeStakePoolMutation.isPending ? 'Initializing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Stake Pool Confirmation Dialog */}
      <Dialog open={isDeleteStakePoolDialogOpen} onOpenChange={setIsDeleteStakePoolDialogOpen}>
        <DialogContent className="bg-gray-900/80 border-gray-700/40 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Delete Stake Pool</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete the stake pool? This action is destructive and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteStakePoolDialogOpen(false)}
              className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteStakePool}
              className="bg-red-600 hover:bg-red-500 text-white shadow-md transition-all"
            >
              Confirm Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}