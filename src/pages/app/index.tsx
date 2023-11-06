import { useSession } from "next-auth/react";
import { useReducer, useState } from "react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ModeToggle } from "~/components/mode-toggle";
import { ProfileDropdownMenu } from "~/components/profile-dropdown-menu";
import { AuthorizationMenu } from "~/components/authorization-menu";
import AuthorizationConsent from "~/components/authorization-consent";
import { ButtonLoading } from "~/components/ui/button-loading";
import { syncMessage } from "../api/sync";
import type {
  ArchivedVideoInfo,
  VideoSchema,
} from "~/server/api/types/videoTypes";
import type { SnapshotData } from "~/server/api/utils/syncHelpers";

// type EventSourceDataType = {
//   message: SyncMessageType;
//   data: VideoSchema[];
// };

type EventSourceDataType =
  | {
      message: "deleted these videos from youtube playlist";
      data: ArchivedVideoInfo[];
    }
  | {
      message: "added these videos";
      data: VideoSchema[];
    }
  | {
      message: "snapshot";
      data: SnapshotData;
    }
  | {
      message: "everything is in sync" | "done";
    };

function App() {
  const { status, data: sessionData } = useSession();
  const [isSyncing, setIsSyncing] = useState(false);

  const initialState = {
    comparing: {
      message: "",
    },
    deleting: {
      message: "",
    },
    adding: {
      message: "",
    },
    synced: {
      message: "",
    },
    done: {
      message: "",
    },
    snapshotAdding: {
      message: "",
    },

    added: {
      message: "",
      data: [] as VideoSchema[],
    },
    deleted: {
      message: "",
      data: [] as ArchivedVideoInfo[],
    },
    snapshot: {
      message: "",
      data: [] as SnapshotData,
    },
  };

  type initialStateType = typeof initialState;

  type Action = {
    type: string;
  } & initialStateType;

  const [state, dispatch] = useReducer(reducer, initialState);
  console.log({ state });

  function reducer(state: initialStateType, action: Action): initialStateType {
    if (action.type === syncMessage.added) {
      return {
        ...state,
        added: {
          message: action.added.message,
          data: action.added.data,
        },
      };
    }
    if (action.type === syncMessage.deleted) {
      return {
        ...state,
        deleted: {
          message: action.deleted.message,
          data: action.deleted.data,
        },
      };
    }
    if (action.type === syncMessage.synced) {
      return {
        ...state,
        synced: {
          message: action.synced.message,
        },
      };
    }
    if (action.type === syncMessage.snapshot) {
      return {
        ...state,
        snapshot: {
          message: action.snapshot.message,
          data: action.snapshot.data,
        },
      };
    }
    if (action.type === syncMessage.done) {
      return {
        ...state,
        done: {
          message: action.done.message,
        },
      };
    } else {
      throw new Error();
    }
  }

  const handleSync = () => {
    setIsSyncing(true);
    try {
      const eventSource = new EventSource("/api/sync");
      eventSource.addEventListener("syncEvent", (e) => {
        const data = JSON.parse(e.data as string) as EventSourceDataType;
        if (data.message == syncMessage.deleted) {
          dispatch({
            ...initialState,
            type: syncMessage.deleted,
            deleted: { message: data.message, data: data.data },
          });
        }
        if (data.message == syncMessage.added) {
          dispatch({
            ...initialState,
            type: syncMessage.added,
            added: { message: data.message, data: data.data },
          });
        }
        if (data.message == syncMessage.synced) {
          dispatch({
            ...initialState,
            type: syncMessage.synced,
            synced: { message: data.message },
          });
        }
        if (data.message == syncMessage.done) {
          dispatch({
            ...initialState,
            type: syncMessage.done,
            done: { message: data.message },
          });
          setIsSyncing(false);
        }
      });
      eventSource.addEventListener("open", (e) => {
        console.log("open", e);
      });
      eventSource.addEventListener("error", (e) => {
        console.log(e);
        eventSource.close();
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-auto py-10">
        <Link
          href={"/api/auth/signin"}
          className="un mx-auto rounded-md border-2 border-slate-500 bg-slate-200 p-2 text-2xl font-bold hover:bg-slate-300"
        >
          Please log in
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <nav className="flex flex-row-reverse items-center gap-2 rounded-md">
        <ProfileDropdownMenu sessionData={sessionData} />
        <AuthorizationMenu sessionData={sessionData} />
        <ModeToggle />
      </nav>

      <div className="mx-auto flex h-96 w-1/4 flex-col items-center rounded-md border border-slate-500 p-4">
        <div>
          {isSyncing ? (
            <ButtonLoading />
          ) : (
            <Button onClick={() => handleSync()} className="w-64">
              Sync
            </Button>
          )}
        </div>
        <div className="mt-4 h-80 w-64 rounded-md border border-slate-500 p-4">
          <div className="border-b border-slate-500 text-center text-lg">
            Sync status messages
          </div>
          <div className="pt-4">{state.added.message}</div>
          <div className="pt-4">{state.deleted.message}</div>
          <div className="pt-4">{state.done.message}</div>
          <div className="pt-4">{state.synced.message}</div>
          <div className="pt-4">{state.snapshot.message}</div>
        </div>
      </div>
      {/* <AuthorizationConsent /> */}
    </div>
  );
}

export default App;
