import { syncMessage } from "~/pages/api/sync";
import type {
  ArchivedVideoInfo,
  VideoSchema,
} from "~/server/api/types/videoTypes";
import type { SnapshotData } from "~/server/api/utils/syncHelpers";

export const initialState = {
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

export function reducer(
  state: initialStateType,
  action: Action,
): initialStateType {
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
  if (action.type === syncMessage.snapshot) {
    return {
      ...state,
      snapshot: {
        message: action.snapshot.message,
        data: action.snapshot.data,
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
  if (action.type === syncMessage.done) {
    return {
      ...state,
      done: {
        message: action.done.message,
      },
    };
  }
  if (action.type === syncMessage.adding) {
    return {
      ...state,
      adding: {
        message: action.adding.message,
      },
    };
  }
  if (action.type === syncMessage.comparing) {
    return {
      ...state,
      comparing: {
        message: action.comparing.message,
      },
    };
  }
  if (action.type === syncMessage.deleting) {
    return {
      ...state,
      deleting: {
        message: action.deleting.message,
      },
    };
  }
  if (action.type === syncMessage.snapshotAdding) {
    return {
      ...state,
      snapshotAdding: {
        message: action.snapshotAdding.message,
      },
    };
  } else {
    throw new Error();
  }
}
