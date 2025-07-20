import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PoolConfigurationSectionProps {
  apy: string;
  onApyChange: (apy: string) => void;
  onUpdateApy: () => void;
  currentOnChainApy: string;
}

export function PoolConfigurationSection({
  apy,
  onApyChange,
  onUpdateApy,
  currentOnChainApy
}: PoolConfigurationSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-base sm:text-xl font-medium text-white">Pool Configuration</h3>
      <Card className="bg-gray-800/30 border-gray-700/60 p-4 rounded-lg">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-lg font-semibold text-white">APY Settings</CardTitle>
          <CardDescription className="text-gray-400 text-sm">
            Current APY: <span className="text-white font-medium">{currentOnChainApy}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apy" className="text-sm font-medium text-gray-300">
              New APY (%)
            </Label>
            <Input
              id="apy"
              type="number"
              step="0.01"
              min="0"
              max="1000"
              value={apy}
              onChange={(e) => onApyChange(e.target.value)}
              placeholder="Enter APY percentage"
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#4a85ff] focus:ring-[#4a85ff]/20 cursor-pointer"
            />
          </div>
          <Button
            onClick={onUpdateApy}
            className="w-full bg-[#4a85ff] hover:bg-[#3b6ee6] text-white shadow-md transition-all cursor-pointer"
          >
            Update APY
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}