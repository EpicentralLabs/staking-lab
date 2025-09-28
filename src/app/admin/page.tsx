"use client"

import { useState } from "react"
import { Card, CardBody, Button, Input, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, cn } from "@heroui/react"
import { motion } from "framer-motion"
import { useMouseGlow } from "@/hooks/useMouseGlow"
import { Settings, Server } from "lucide-react"
import { useEnhancedInitializeStakePoolConfigMutation, useEnhancedInitializeXLabsMutation, useEnhancedInitializeStakePoolMutation, useEnhancedDeleteStakePoolConfigMutation, useEnhancedDeleteStakePoolMutation, useEnhancedUpdateStakePoolConfigMutation } from "@/components/admin/admin-mutations"
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

  // Mouse glow effects for cards
  const mainCardRef = useMouseGlow()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  }

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
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto sm:px-2 px-1 py-6 sm:py-8 md:py-12 flex-1"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div variants={itemVariants}>
            <Card
              ref={mainCardRef}
              className="bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-700/20 border border-slate-600/20 backdrop-blur-sm relative overflow-hidden transition-all duration-300 ease-out"
              style={{
                background: `
                  radial-gradient(var(--glow-size, 600px) circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
                    rgba(74, 133, 255, calc(0.15 * var(--glow-opacity, 0) * var(--glow-intensity, 1))), 
                    rgba(88, 80, 236, calc(0.08 * var(--glow-opacity, 0) * var(--glow-intensity, 1))) 25%,
                    rgba(74, 133, 255, calc(0.03 * var(--glow-opacity, 0) * var(--glow-intensity, 1))) 50%,
                    transparent 75%
                  ),
                  linear-gradient(to bottom right, 
                    rgb(15 23 42 / 0.4), 
                    rgb(30 41 59 / 0.3), 
                    rgb(51 65 85 / 0.2)
                  )
                `,
                transition: 'var(--glow-transition, all 200ms cubic-bezier(0.4, 0, 0.2, 1))'
              }}
            >
              <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-[#4a85ff]/20 flex items-center justify-center">
                    <Settings className="w-3 h-3 text-[#4a85ff]" />
                  </div>
                  <div>
                    <h1 className="text-lg font-medium text-white">Admin Panel</h1>
                    <p className="text-gray-400 text-xs font-light">
                      Manage staking contract settings
                    </p>
                  </div>
                </div>
                {/* APY Settings */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-[#4a85ff]/20 flex items-center justify-center">
                      <Settings className="w-3 h-3 text-[#4a85ff]" />
                    </div>
                    <h3 className="text-sm font-medium text-white">Staking APY</h3>
                  </div>

                  {/* Current APY Display */}
                  {stakePoolConfigDataQuery.data && (
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-600/40">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-base">Current APY:</span>
                        <Chip color="primary" variant="flat" size="lg">
                          <span className="text-[#4a85ff] font-semibold text-lg">
                            {(Number(stakePoolConfigDataQuery.data.data.aprBps) / 100).toFixed(2)}%
                          </span>
                        </Chip>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-400 text-sm">Basis Points:</span>
                        <Chip variant="flat" size="sm" className="bg-slate-700/50">
                          <span className="text-gray-300 text-sm">
                            {stakePoolConfigDataQuery.data.data.aprBps.toString()}
                          </span>
                        </Chip>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-white">Set Annual Percentage Yield (APY)</span>
                      </div>
                      <Input
                        id="apy-input"
                        type="number"
                        placeholder="e.g., 10"
                        value={apy}
                        onChange={(e) => setApy(e.target.value)}
                        endContent={
                          <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">%</span>
                          </div>
                        }
                        classNames={{
                          input: "text-white",
                          inputWrapper: "bg-slate-800/50 border-slate-600/40 backdrop-blur-sm"
                        }}
                        size="lg"
                      />
                    </div>
                    <Button
                      color="primary"
                      size="lg"
                      className="w-full md:w-auto font-medium"
                      onClick={() => setIsDialogOpen(true)}
                      isLoading={updateStakePoolConfigMutation.isPending}
                    >
                      {updateStakePoolConfigMutation.isPending ? 'Updating...' : 'Update APY'}
                    </Button>
                  </div>
                </div>

                {/* Staking Vault Management */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-[#4a85ff]/20 flex items-center justify-center">
                      <Server className="w-3 h-3 text-[#4a85ff]" />
                    </div>
                    <h3 className="text-sm font-medium text-white">Stake Program</h3>
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-600/40">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-white">Initialize Stake Program</h4>
                      <p className="text-gray-400 text-xs">Initialize the on-chain staking program.</p>
                    </div>
                        <div className="space-y-3">
                          <Button
                            variant="solid"
                            size="md"
                            className="w-full bg-zinc-700 text-zinc-50 hover:bg-zinc-600"
                            onClick={() => setIsInitializeStakePoolConfigDialogOpen(true)}
                            isLoading={initializeStakePoolConfigMutation.isPending}
                          >
                            Initialize Stake Pool Config
                          </Button>
                          <Button
                            color="danger"
                            variant="solid"
                            size="md"
                            className="w-full"
                            onClick={() => setIsDeleteStakePoolConfigDialogOpen(true)}
                            isLoading={deleteStakePoolConfigMutation.isPending}
                          >
                            Delete Stake Pool Config
                          </Button>
                          <Button
                            color="primary"
                            variant="solid"
                            size="md"
                            className="w-full"
                            onClick={() => setIsInitializeStakePoolDialogOpen(true)}
                            isLoading={initializeStakePoolMutation.isPending}
                          >
                            Initialize Stake Pool
                          </Button>
                          <Button
                            color="danger"
                            variant="solid"
                            size="md"
                            className="w-full"
                            onClick={() => setIsDeleteStakePoolDialogOpen(true)}
                            isLoading={deleteStakePoolMutation.isPending}
                          >
                            Delete Stake Pool
                          </Button>
                          <Button
                            variant="solid"
                            size="md"
                            className="w-full bg-zinc-700 text-zinc-50 hover:bg-zinc-600"
                            onClick={() => setIsInitializeXLabsMintDialogOpen(true)}
                            isLoading={initializeXLabsMutation.isPending}
                          >
                            Initialize X Labs Mint
                          </Button>
                        </div>
                        </div>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-600/40">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-white">Stake Pool Status</h4>
                      <p className="text-gray-400 text-xs">Current state of the stake pool.</p>
                    </div>
                    <div className="space-y-3 text-sm">
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
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* APY Confirmation Modal */}
      <Modal isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h4 className="text-white">Confirm APY Change</h4>
              </ModalHeader>
              <ModalBody>
                <p className="text-gray-400">
                  Are you sure you want to change the staking APY to {apy}%?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button 
                  variant="bordered" 
                  onPress={onClose}
                  isDisabled={updateStakePoolConfigMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleSetApy}
                  isLoading={updateStakePoolConfigMutation.isPending}
                >
                  {updateStakePoolConfigMutation.isPending ? 'Updating...' : 'Confirm'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Initialize Stake Pool Config Modal */}
      <Modal isOpen={isInitializeStakePoolConfigDialogOpen} onOpenChange={setIsInitializeStakePoolConfigDialogOpen} backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h4 className="text-white">Confirm Initialize Stake Pool Config</h4>
              </ModalHeader>
              <ModalBody>
                <p className="text-gray-400">
                  Are you sure you want to initialize the stake pool config with APY: <span className="font-semibold text-white">{apy}%</span> ({Math.round(parseFloat(apy) * 100)} <span className="font-semibold text-white">basis points</span>)?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="bordered" onPress={onClose} isDisabled={initializeStakePoolConfigMutation.isPending}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleInitializeStakePoolConfig} isLoading={initializeStakePoolConfigMutation.isPending}>
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Additional modals can be added here following the same pattern */}
    </>
  )
}