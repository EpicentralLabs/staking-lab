import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MintManagementSectionProps {
  onCreateStakePoolConfig: () => void;
  onDeleteStakePoolConfig: () => void;
  onCreateXLabsMint: () => void;
  onCreateStakePool: () => void;
  onDeleteStakePool: () => void;
}

export function MintManagementSection({
  onCreateStakePoolConfig,
  onDeleteStakePoolConfig,
  onCreateXLabsMint,
  onCreateStakePool,
  onDeleteStakePool
}: MintManagementSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-base sm:text-xl font-medium text-white">Stake Program Management</h3>
      <Card className="bg-gray-800/30 border-gray-700/60 p-4 rounded-lg">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-lg font-semibold text-white">Initialize Stake Program</CardTitle>
          <CardDescription className="text-gray-400 text-sm">
            Initialize the on-chain staking program components.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          <Button
            onClick={onCreateStakePoolConfig}
            className="w-full bg-gray-700/50 hover:bg-gray-600/60 border border-gray-600/40 hover:border-gray-500/60 text-white shadow-md transition-all cursor-pointer"
          >
            Create Stake Pool Config
          </Button>
          <Button
            onClick={onCreateXLabsMint}
            className="w-full bg-gray-700/50 hover:bg-gray-600/60 border border-gray-600/40 hover:border-gray-500/60 text-white shadow-md transition-all cursor-pointer"
          >
            Create xLABS Mint
          </Button>
          <Button
            onClick={onCreateStakePool}
            className="w-full bg-gray-700/50 hover:bg-gray-600/60 border border-gray-600/40 hover:border-gray-500/60 text-white shadow-md transition-all cursor-pointer"
          >
            Create Stake Pool
          </Button>
          <Button
            onClick={onDeleteStakePool}
            className="w-full bg-gray-700/50 hover:bg-gray-600/60 border border-gray-600/40 hover:border-red-500/40 text-white shadow-md transition-all cursor-pointer"
          >
            Delete Stake Pool
          </Button>
          <Button
            onClick={onDeleteStakePoolConfig}
            className="w-full bg-gray-700/50 hover:bg-gray-600/60 border border-gray-600/40 hover:border-red-500/40 text-white shadow-md transition-all cursor-pointer"
          >
            Delete Stake Pool Config
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}