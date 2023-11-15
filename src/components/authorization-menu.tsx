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
import { cn } from "~/lib/utils";
import type { Session } from "next-auth/core/types";
import { isYoutubeAuthorized } from "~/utils/auth";

type PropsType = {
  sessionData: Session | null;
};

export function AuthorizationMenu({ sessionData }: PropsType) {
  const isNotionAuthorized = () => {
    return true;
  };
  const isAuthNeeded = (sessionData: Session | null) => {
    if (isYoutubeAuthorized(sessionData) && isNotionAuthorized()) {
      return false;
    } else {
      return true;
    }
  };
  return (
    <DropdownMenu>
      <TooltipWrapper text="Authorization">
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              isAuthNeeded(sessionData)
                ? "border-2 border-red-500 bg-red-100"
                : "",
            )}
          >
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
          <div className="flex w-full justify-between">
            <div className="flex">
              <Youtube />
              <span className="px-2">Youtube Authorization</span>
            </div>
            {isYoutubeAuthorized(sessionData) ? (
              <div className="h-[1rem] w-[1rem] rounded-full bg-green-700" />
            ) : (
              <div className="h-[1rem] w-[1rem] rounded-full bg-red-600" />
            )}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer justify-between"
          onClick={() => void router.push("/app/auth/notion")}
        >
          <div className="flex w-full justify-between">
            <div className="flex">
              <Notion />
              <span className="px-2">Notion Authorization</span>
            </div>
            {isNotionAuthorized() ? (
              <div className="h-[1rem] w-[1rem] rounded-full bg-green-700" />
            ) : (
              <div className="h-[1rem] w-[1rem] rounded-full bg-red-600" />
            )}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
