import { cn } from '~/lib/utils'
import { Button } from './ui/button'
import type { SyncDetails } from '~/pages/app'

type props = {
  onClickSyncDetailsTab: (tab: Exclude<SyncDetails, 'summary'>) => void
  syncDetails: SyncDetails
}

function SyncDetailsTabs({ onClickSyncDetailsTab, syncDetails }: props) {
  const active = () => {
    return 'bg-gradient-to-r from-yellow-200 via-lime-200 to-stone-100 text-slate-700 font-semibold'
  }
  return (
    <div className="fixed top-20 flex w-[140px] flex-col gap-4 ">
      <Button
        variant={'outline'}
        onClick={() => onClickSyncDetailsTab('added')}
        className={cn(syncDetails == 'added' && active())}
      >
        Added videos
      </Button>
      <Button
        variant={'outline'}
        onClick={() => onClickSyncDetailsTab('deleted')}
        className={cn(syncDetails == 'deleted' && active())}
      >
        Deleted Videos
      </Button>

      <Button onClick={() => onClickSyncDetailsTab('hide')}>
        Hide Details
      </Button>
    </div>
  )
}

export default SyncDetailsTabs
