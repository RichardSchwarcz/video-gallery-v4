import { Button } from './ui/button'

type props = {
  onClickSyncDetailsTab: (tab: 'added' | 'deleted' | 'errors' | 'hide') => void
}

function SyncDetailsTabs({ onClickSyncDetailsTab }: props) {
  return (
    <div className="fixed top-0 flex w-[140px] flex-col gap-4 pt-20">
      <Button
        variant={'outline'}
        onClick={() => onClickSyncDetailsTab('added')}
      >
        Added videos
      </Button>
      <Button
        variant={'outline'}
        onClick={() => onClickSyncDetailsTab('deleted')}
      >
        Deleted Videos
      </Button>
      <Button
        variant={'outline'}
        onClick={() => onClickSyncDetailsTab('errors')}
      >
        Errors
      </Button>
      <Button onClick={() => onClickSyncDetailsTab('hide')}>
        Hide Details
      </Button>
    </div>
  )
}

export default SyncDetailsTabs
