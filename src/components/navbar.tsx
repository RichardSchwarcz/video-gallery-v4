import type { Session } from 'next-auth/core/types'
import { ModeToggle } from './mode-toggle'
import { ProfileDropdownMenu } from './profile-dropdown-menu'
import { Button } from './ui/button'
import Logo from './icons/logo'

function Navbar({ sessionData }: { sessionData: Session | null }) {
  return (
    <nav className="flex justify-between">
      <Button variant="outline" className="px-2">
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
