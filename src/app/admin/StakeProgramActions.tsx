import { Button } from '@/components/ui/button'

export function StakeProgramActions({
  onCreateConfig,
  onDeleteConfig,
  onCreateXLabsMint
}: {
  onCreateConfig: () => void,
  onDeleteConfig: () => void,
  onCreateXLabsMint: () => void
}) {
  return (
    <div className="space-y-4">
      <Button
        onClick={onCreateConfig}
        className="w-full bg-zinc-800 text-zinc-50 hover:bg-zinc-700"
      >
        create_stake_pool_config
      </Button>
      <Button
        onClick={onDeleteConfig}
        className="w-full bg-red-900/70 text-red-100 hover:bg-red-800/70"
      >
        delete_stake_pool_config
      </Button>
      <Button
        onClick={onCreateXLabsMint}
        className="w-full bg-zinc-800 text-zinc-50 hover:bg-zinc-700"
      >
        create_x_labs_mint
      </Button>
    </div>
  )
} 