import { CreditCard, LifeBuoy, LogOut, Settings, User } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { TooltipWrapper } from './tooltip-wrapper'
import type { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

type PropsType = {
  sessionData: Session | null
}

export function ProfileDropdownMenu({ sessionData }: PropsType) {
  const router = useRouter()
  return (
    <DropdownMenu>
      <TooltipWrapper text="Account">
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer rounded-md">
            <AvatarImage
              src={sessionData?.user.image ? sessionData?.user.image : ''}
            />
            <AvatarFallback>VG</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
      </TooltipWrapper>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>{sessionData?.user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => void router.push('/app/settings')}
            className="cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <LifeBuoy className="mr-2 h-4 w-4" />
          <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void signOut()}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
