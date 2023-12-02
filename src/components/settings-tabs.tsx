import Link from 'next/link'
import { Button } from './ui/button'
import { useRouter } from 'next/router'
import { cn } from '~/lib/utils'

function SettingsTabs() {
  const router = useRouter()
  const active = (path: string) => {
    if (router.pathname === path) {
      return 'bg-gradient-to-r from-yellow-200 via-lime-200 to-stone-100 text-primary-foreground'
    }
  }
  return (
    <div className="flex w-[140px] flex-col">
      <p className="text-center text-lg font-bold">Settings</p>
      <div className="border-t py-2" />
      <div className="flex flex-col gap-4">
        <Button
          variant={'outline'}
          asChild
          className={cn(active('/app/settings'))}
        >
          <Link href="/app/settings">IDs</Link>
        </Button>
        <Button
          variant={'outline'}
          asChild
          className={cn(active('/app/settings/youtube'))}
        >
          <Link href="/app/settings/youtube">Youtube</Link>
        </Button>
        <Button
          variant={'outline'}
          asChild
          className={cn(active('/app/settings/notion'))}
        >
          <Link href="/app/settings/notion">Notion</Link>
        </Button>
      </div>
    </div>
  )
}

export default SettingsTabs
