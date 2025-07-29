import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function ApySettings({ apy, setApy, onUpdate, isLoading }: {
  apy: string,
  setApy: (v: string) => void,
  onUpdate: () => void,
  isLoading?: boolean
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-base sm:text-xl font-medium text-white">Staking APY</h3>
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
          onClick={onUpdate}
          disabled={isLoading || !apy || parseFloat(apy) < 0 || parseFloat(apy) > 100}
          aria-label="Update Annual Percentage Yield on blockchain"
          className="w-full md:w-auto bg-[#4a85ff] hover:bg-[#3a75ef] text-white py-3 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(74,133,255,0.3)] disabled:opacity-50 font-medium"
        >
          {isLoading ? 'Updating...' : 'Update APY (Constants + On-Chain)'}
        </Button>
      </div>
    </div>
  )
}