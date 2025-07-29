import { AdminDialog } from '../../app/admin/AdminDialog';

interface AdminDialogsSectionProps {
  apy: string;
  dialogs: {
    updateApy: boolean;
    createStakePoolConfig: boolean;
    deleteStakePoolConfig: boolean;
    createXLabsMint: boolean;
    createStakePool: boolean;
    deleteStakePool: boolean;
  };
  onCloseDialog: (dialogType: keyof AdminDialogsSectionProps['dialogs']) => void;
  onUpdateApy: () => void;
  onCreateStakePoolConfig: () => void;
  onDeleteStakePoolConfig: () => void;
  onCreateXLabsMint: () => void;
  onCreateStakePool: () => void;
  onDeleteStakePool: () => void;
}

export function AdminDialogsSection({
  apy,
  dialogs,
  onCloseDialog,
  onUpdateApy,
  onCreateStakePoolConfig,
  onDeleteStakePoolConfig,
  onCreateXLabsMint,
  onCreateStakePool,
  onDeleteStakePool
}: AdminDialogsSectionProps) {
  return (
    <>
      <AdminDialog
        open={dialogs.updateApy}
        onOpenChange={(open) => !open && onCloseDialog('updateApy')}
        title="Confirm APY Change"
        description={`Are you sure you want to change the staking APY to ${apy}%?`}
        onConfirm={onUpdateApy}
        onCancel={() => onCloseDialog('updateApy')}
        confirmText="Confirm"
        cancelText="Cancel"
      />
      
      <AdminDialog
        open={dialogs.createStakePoolConfig}
        onOpenChange={(open) => !open && onCloseDialog('createStakePoolConfig')}
        title="Confirm Create Stake Pool Config"
        description="Are you sure you want to create the stake pool config?"
        onConfirm={onCreateStakePoolConfig}
        onCancel={() => onCloseDialog('createStakePoolConfig')}
        confirmText="Confirm"
        cancelText="Cancel"
      />
      
      <AdminDialog
        open={dialogs.deleteStakePoolConfig}
        onOpenChange={(open) => !open && onCloseDialog('deleteStakePoolConfig')}
        title="Confirm Delete Stake Pool Config"
        description="Are you sure you want to delete the stake pool config? This action is destructive and cannot be undone."
        onConfirm={onDeleteStakePoolConfig}
        onCancel={() => onCloseDialog('deleteStakePoolConfig')}
        confirmText="Confirm Deletion"
        cancelText="Cancel"
        confirmClassName="bg-red-600 hover:bg-red-500 text-white shadow-md transition-all"
      />
      
      <AdminDialog
        open={dialogs.createXLabsMint}
        onOpenChange={(open) => !open && onCloseDialog('createXLabsMint')}
        title="Confirm Create xLABS Mint"
        description="Are you sure you want to create the xLABS mint?"
        onConfirm={onCreateXLabsMint}
        onCancel={() => onCloseDialog('createXLabsMint')}
        confirmText="Confirm"
        cancelText="Cancel"
      />
      
      <AdminDialog
        open={dialogs.createStakePool}
        onOpenChange={(open) => !open && onCloseDialog('createStakePool')}
        title="Confirm Create Stake Pool"
        description="Are you sure you want to create the stake pool?"
        onConfirm={onCreateStakePool}
        onCancel={() => onCloseDialog('createStakePool')}
        confirmText="Confirm"
        cancelText="Cancel"
      />
      
      <AdminDialog
        open={dialogs.deleteStakePool}
        onOpenChange={(open) => !open && onCloseDialog('deleteStakePool')}
        title="Confirm Delete Stake Pool"
        description="Are you sure you want to delete the stake pool? This action is destructive and cannot be undone."
        onConfirm={onDeleteStakePool}
        onCancel={() => onCloseDialog('deleteStakePool')}
        confirmText="Confirm Deletion"
        cancelText="Cancel"
        confirmClassName="bg-red-600 hover:bg-red-500 text-white shadow-md transition-all"
      />
    </>
  );
}