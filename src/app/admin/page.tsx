"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { ConnectWalletScreen } from './ConnectWalletScreen'
import { AccessDeniedScreen } from './AccessDeniedScreen'
import { useAdminPanel } from '@/hooks/useAdminPanel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { FlowingBackground } from '@/components/flowing-background'
import { PoolConfigurationSection } from '@/components/admin/PoolConfigurationSection'
import { MintManagementSection } from '@/components/admin/MintManagementSection'
import { AdminStatsSection } from '@/components/admin/AdminStatsSection'
import { AdminNotificationSection } from '@/components/admin/AdminNotificationSection'
import { AdminDialogsSection } from '@/components/admin/AdminDialogsSection'


export default function AdminPanelPage() {
  const { publicKey } = useWallet();
  const [isMounted, setIsMounted] = useState(false);
  
  const {
    apy,
    stakePoolStatus,
    isRefreshing,
    updateMessage,
    isNotificationVisible,
    dialogs,
    isAdmin,
    setApy,
    setUpdateMessage,
    refreshStakePoolStatus,
    updateApy,
    createStakePoolConfig,
    deleteStakePoolConfig,
    createXLabsMint,
    createStakePool,
    deleteStakePool,
    openDialog,
    closeDialog,
  } = useAdminPanel();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  if (!publicKey) return <ConnectWalletScreen />;
  if (!isAdmin) return <AccessDeniedScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050810] via-[#0a0f1a] to-[#050810] text-white flex flex-col">
      <FlowingBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <AdminNotificationSection
          type={updateMessage?.type || 'success'}
          text={updateMessage?.text || ''}
          show={isNotificationVisible}
          onClose={() => setUpdateMessage(null)}
        />
        
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
                <PoolConfigurationSection
                  apy={apy}
                  onApyChange={setApy}
                  onUpdateApy={() => openDialog('updateApy')}
                  currentOnChainApy={stakePoolStatus.currentOnChainApy}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MintManagementSection
                    onCreateStakePoolConfig={() => openDialog('createStakePoolConfig')}
                    onDeleteStakePoolConfig={() => openDialog('deleteStakePoolConfig')}
                    onCreateXLabsMint={() => openDialog('createXLabsMint')}
                    onCreateStakePool={() => openDialog('createStakePool')}
                    onDeleteStakePool={() => openDialog('deleteStakePool')}
                  />
                  
                  <AdminStatsSection
                    programAddress={stakePoolStatus.programAddress}
                    stakePoolAddress={stakePoolStatus.stakePoolAddress}
                    configAddress={stakePoolStatus.configAddress}
                    vaultAddress={stakePoolStatus.vaultAddress}
                    currentOnChainApy={stakePoolStatus.currentOnChainApy}
                    labsTokenAddress={stakePoolStatus.labsTokenAddress}
                    xLabsTokenAddress={stakePoolStatus.xLabsTokenAddress}
                    unclaimedRewards={stakePoolStatus.unclaimedRewards}
                    claimedRewards={stakePoolStatus.claimedRewards}
                    totalStaked={stakePoolStatus.totalStaked}
                    tvlStaked={stakePoolStatus.tvlStaked}
                    onRefresh={refreshStakePoolStatus}
                    isRefreshing={isRefreshing}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Footer />
        
        <AdminDialogsSection
          apy={apy}
          dialogs={dialogs}
          onCloseDialog={closeDialog}
          onUpdateApy={updateApy}
          onCreateStakePoolConfig={createStakePoolConfig}
          onDeleteStakePoolConfig={deleteStakePoolConfig}
          onCreateXLabsMint={createXLabsMint}
          onCreateStakePool={createStakePool}
          onDeleteStakePool={deleteStakePool}
        />
      </div>
    </div>
  );
}