import { Button } from './ui/button'

function SyncDetailsTabs() {
  return (
    <div className="flex w-[140px] flex-col gap-4">
      <Button variant={'outline'}>Added videos</Button>
      <Button variant={'outline'}>Deleted Videos</Button>
      <Button variant={'outline'}>Errors</Button>
      <Button>Hide Details</Button>
    </div>
  )
}

export default SyncDetailsTabs
