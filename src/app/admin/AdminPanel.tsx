import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { AdminNotification } from './AdminNotification'
import { ApySettings } from './ApySettings'
import { StakeProgramActions } from './StakeProgramActions'
import { StakePoolStatus } from './StakePoolStatus'
import { AdminDialog } from './AdminDialog'
import { FlowingBackground } from '@/components/flowing-background'

interface StakePoolStatusType {
  programAddress: string;
  stakePoolAddress: string;
  configAddress: string;
  configAuthority: string;
  currentOnChainApy: string;
  labsTokenAddress: string;
  xLabsTokenAddress: string;
  unclaimedRewards: string;
  claimedRewards: string;
  totalStaked: string;
  tvlStaked: string;
}

interface AdminPanelProps {
  apy: string;
  setApy: (apy: string) => void;
  isNotificationVisible: boolean;
  updateMessage: { type: 'success' | 'error', text: string } | null;
  setUpdateMessage: (message: { type: 'success' | 'error', text: string } | null) => void;
  handleSetApy: () => Promise<void>;
  handleCreateStakePoolConfig: () => Promise<void>;
  handleDeleteStakePoolConfig: () => Promise<void>;
  handleCreateXLabsMint: () => Promise<void>;
  handleCreateStakePool: () => Promise<void>;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  isCreateStakePoolConfigDialogOpen: boolean;
  setICreateStakePoolConfigDialogOpen: (open: boolean) => void;
  isDeleteStakePoolConfigDialogOpen: boolean;
  setIsDeleteStakePoolConfigDialogOpen: (open: boolean) => void;
  isCreateXLabsMintDialogOpen: boolean;
  setIsCreateXLabsMintDialogOpen: (open: boolean) => void;
  isCreateStakePoolDialogOpen: boolean;
  setIsCreateStakePoolDialogOpen: (open: boolean) => void;
  stakePoolStatus: StakePoolStatusType;
  refreshStakePoolStatus: () => Promise<void>;
  isRefreshing: boolean;
}

export function AdminPanel({
  apy,
  setApy,
  isNotificationVisible,
  updateMessage,
  setUpdateMessage,
  handleSetApy,
  handleCreateStakePoolConfig,
  handleDeleteStakePoolConfig,
  handleCreateXLabsMint,
  handleCreateStakePool,
  isDialogOpen,
  setIsDialogOpen,
  isCreateStakePoolConfigDialogOpen,
  setICreateStakePoolConfigDialogOpen,
  isDeleteStakePoolConfigDialogOpen,
  setIsDeleteStakePoolConfigDialogOpen,
  isCreateXLabsMintDialogOpen,
  setIsCreateXLabsMintDialogOpen,
  isCreateStakePoolDialogOpen,
  setIsCreateStakePoolDialogOpen,
  stakePoolStatus,
  refreshStakePoolStatus,
  isRefreshing
}: AdminPanelProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050810] via-[#0a0f1a] to-[#050810] text-white flex flex-col">
      <FlowingBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto sm:px-2 px-1 py-6 sm:py-8 md:py-12 flex-1">
          <div className="max-w-4xl mx-auto">
            <AdminNotification
              type={updateMessage?.type || 'success'}
              text={updateMessage?.text || ''}
              show={isNotificationVisible}
              onClose={() => setUpdateMessage(null)}
            />
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
                <ApySettings apy={apy} setApy={setApy} onUpdate={() => setIsDialogOpen(true)} />
                <div className="space-y-4">
                  <h3 className="text-base sm:text-xl font-medium text-white">Stake Program</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gray-800/30 border-gray-700/60 p-4 rounded-lg">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-lg font-semibold text-white">Initialize Stake Program</CardTitle>
                        <CardDescription className="text-gray-400 text-sm">Initialize the on-chain staking program.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 space-y-4">
                        <StakeProgramActions
                          onCreateConfig={() => setICreateStakePoolConfigDialogOpen(true)}
                          onDeleteConfig={() => setIsDeleteStakePoolConfigDialogOpen(true)}
                          onCreateXLabsMint={() => setIsCreateXLabsMintDialogOpen(true)}
                          onCreateStakePool={() => setIsCreateStakePoolDialogOpen(true)}
                        />
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800/30 border-gray-700/60 p-4 rounded-lg">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-lg font-semibold text-white">Stake Pool Status</CardTitle>
                        <CardDescription className="text-gray-400 text-sm">Current state of the stake pool.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <StakePoolStatus
                          programAddress={stakePoolStatus.programAddress}
                          stakePoolAddress={stakePoolStatus.stakePoolAddress}
                          configAddress={stakePoolStatus.configAddress}
                          configAuthority={stakePoolStatus.configAuthority}
                          currentOnChainApy={stakePoolStatus.currentOnChainApy}
                          labsTokenAddress={stakePoolStatus.labsTokenAddress}
                          xLabsTokenAddress={stakePoolStatus.xLabsTokenAddress}
                          unclaimedRewards={stakePoolStatus.unclaimedRewards}
                          claimedRewards={stakePoolStatus.claimedRewards}
                          totalStaked={stakePoolStatus.totalStaked}
                          tvlStaked={stakePoolStatus.tvlStaked}
                          refreshStakePoolStatus={refreshStakePoolStatus}
                          isRefreshing={isRefreshing}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
        <AdminDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title="Confirm APY Change"
          description={`Are you sure you want to change the staking APY to ${apy}%?`}
          onConfirm={handleSetApy}
          onCancel={() => setIsDialogOpen(false)}
          confirmText="Confirm"
          cancelText="Cancel"
        />
        <AdminDialog
          open={isCreateStakePoolConfigDialogOpen}
          onOpenChange={setIsCreateStakePoolConfigDialogOpen}
          title="Confirm Create Stake Pool Config"
          description="Are you sure you want to create the stake pool config?"
          onConfirm={handleCreateStakePoolConfig}
          onCancel={() => setIsCreateStakePoolConfigDialogOpen(false)}
          confirmText="Confirm"
          cancelText="Cancel"
        />
        <AdminDialog
          open={isDeleteStakePoolConfigDialogOpen}
          onOpenChange={setIsDeleteStakePoolConfigDialogOpen}
          title="Confirm Delete Stake Pool Config"
          description="Are you sure you want to delete the stake pool config? This action is destructive and cannot be undone."
          onConfirm={handleDeleteStakePoolConfig}
          onCancel={() => setIsDeleteStakePoolConfigDialogOpen(false)}
          confirmText="Confirm Deletion"
          cancelText="Cancel"
          confirmClassName="bg-red-600 hover:bg-red-500 text-white shadow-md transition-all"
        />
        <AdminDialog
          open={isCreateXLabsMintDialogOpen}
          onOpenChange={setIsCreateXLabsMintDialogOpen}
          title="Confirm Create xLABS Mint"
          description="Are you sure you want to create the xLABS mint?"
          onConfirm={handleCreateXLabsMint}
          onCancel={() => setIsCreateXLabsMintDialogOpen(false)}
          confirmText="Confirm"
          cancelText="Cancel"
        />
        <AdminDialog
          open={isCreateStakePoolDialogOpen}
          onOpenChange={setIsCreateStakePoolDialogOpen}
          title="Confirm Create Stake Pool"
          description="Are you sure you want to create the stake pool?"
          onConfirm={handleCreateStakePool}
          onCancel={() => setIsCreateStakePoolDialogOpen(false)}
          confirmText="Confirm"
          cancelText="Cancel"
        />
      </div>
    </div>
  )
}