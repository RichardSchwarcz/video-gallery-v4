import type { Session } from 'next-auth/core/types'
import { ModeToggle } from './mode-toggle'
import { ProfileDropdownMenu } from './profile-dropdown-menu'
import { Button } from './ui/button'
import Logo from './icons/logo'
import { useRouter } from 'next/router'

function Navbar({ sessionData }: { sessionData: Session | null }) {
  const router = useRouter()
  return (
    <nav className="flex justify-between pb-4">
      <Button
        variant="outline"
        className="px-2"
        onClick={() => void router.push('/app')}
      >
        <Logo />
        <span className="pl-2">Video Gallery</span>
      </Button>
      <div className="flex items-end gap-2">
        <ModeToggle />
        <ProfileDropdownMenu sessionData={sessionData} />
      </div>
    </nav>
  )
}

export default Navbar
