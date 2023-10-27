import { Lock } from "lucide-react";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import router from "next/router";
import Notion from "./icons/notion";
import Youtube from "./icons/youtube";
import { TooltipWrapper } from "./tooltip-wrapper";

export function AuthorizationMenu() {
  return (
    <DropdownMenu>
      <TooltipWrapper text="Authorization">
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Lock className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
      </TooltipWrapper>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => void router.push("/app/auth/youtube")}
        >
          <Youtube />
          <span className="px-2">Youtube Authorization</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => void router.push("/app/auth/notion")}
        >
          <Notion />
          <span className="px-2">Notion Authorization</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
