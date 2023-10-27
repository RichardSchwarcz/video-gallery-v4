import { CreditCard, LifeBuoy, LogOut, Settings, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { TooltipWrapper } from "./tooltip-wrapper";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";

type PropsType = {
  sessionData: Session | null;
};

export function ProfileDropdownMenu({ sessionData }: PropsType) {
  return (
    <DropdownMenu>
      <TooltipWrapper text="Account">
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer rounded-md">
            <AvatarImage
              src={sessionData?.user.image ? sessionData?.user.image : ""}
            />
            <AvatarFallback>VG</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
      </TooltipWrapper>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{sessionData?.user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup></DropdownMenuGroup>
        <DropdownMenuItem>
          <LifeBuoy className="mr-2 h-4 w-4" />
          <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
