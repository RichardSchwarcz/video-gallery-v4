import { useSession } from 'next-auth/react'
import { useReducer, useState } from 'react'
import { Button } from '~/components/ui/button'
import Link from 'next/link'
import { ModeToggle } from '~/components/mode-toggle'
import { ProfileDropdownMenu } from '~/components/profile-dropdown-menu'
import { AuthorizationMenu } from '~/components/authorization-menu'
import { ButtonLoading } from '~/components/ui/button-loading'
import { type EventSourceDataType, syncMessage } from '../api/sync'
import Image from 'next/image'
import { TooltipWrapper } from '~/components/tooltip-wrapper'
import { truncateTitle } from '~/utils/truncateVideoTitle'
import { initialState, reducer } from '~/utils/reducer'
import SyncStatusMessage from '~/components/sync-status-message'

function App() {
  const { status, data: sessionData } = useSession()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isDeletedVisible, setIsDeletedVisible] = useState(false)
  const [isAddedVisible, setIsAddedVisible] = useState(false)
  const [isDoneVisible, setIsDoneVisible] = useState(false)
  const [state, dispatch] = useReducer(reducer, initialState)

  const handleSync = () => {
    setIsSyncing(true)
    try {
      const eventSource = new EventSource('/api/sync')
      eventSource.addEventListener('syncEvent', (e) => {
        const data = JSON.parse(e.data as string) as EventSourceDataType
        if (data.message == syncMessage.deleted) {
          dispatch({
            ...initialState,
            type: syncMessage.deleted,
            deleted: { message: data.message, data: data.data },
          })
        }
        if (data.message == syncMessage.added) {
          dispatch({
            ...initialState,
            type: syncMessage.added,
            added: { message: data.message, data: data.data },
          })
        }
        if (data.message == syncMessage.synced) {
          dispatch({
            ...initialState,
            type: syncMessage.synced,
            synced: { message: data.message },
          })
        }
        if (data.message == syncMessage.done) {
          dispatch({
            ...initialState,
            type: syncMessage.done,
            done: { message: data.message },
          })
          setIsSyncing(false)
        }
        if (data.message == syncMessage.snapshot) {
          dispatch({
            ...initialState,
            type: syncMessage.snapshot,
            snapshot: { message: data.message, data: data.data },
          })
        }
        if (data.message == syncMessage.adding) {
          dispatch({
            ...initialState,
            type: syncMessage.adding,
            adding: { message: data.message },
          })
        }
        if (data.message == syncMessage.comparing) {
          dispatch({
            ...initialState,
            type: syncMessage.comparing,
            comparing: { message: data.message },
          })
        }
        if (data.message == syncMessage.deleting) {
          dispatch({
            ...initialState,
            type: syncMessage.deleting,
            deleting: { message: data.message },
          })
        }
        if (data.message == syncMessage.snapshotAdding) {
          dispatch({
            ...initialState,
            type: syncMessage.snapshotAdding,
            snapshotAdding: { message: data.message },
          })
        }
      })
      eventSource.addEventListener('open', (e) => {
        console.log('open', e)
      })
      eventSource.addEventListener('error', (e) => {
        console.log(e)
        eventSource.close()
      })
    } catch (error) {
      console.log(error)
    }
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-auto py-10">
        <Link
          href={'/api/auth/signin'}
          className="un mx-auto rounded-md border-2 border-slate-500 bg-slate-200 p-2 text-2xl font-bold hover:bg-slate-300"
        >
          Please log in
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4">
      <nav className="flex flex-row-reverse items-center gap-2 rounded-md">
        <ProfileDropdownMenu sessionData={sessionData} />
        <AuthorizationMenu sessionData={sessionData} />
        <ModeToggle />
      </nav>

      <div className="mx-auto flex w-fit flex-col items-center rounded-md border border-slate-500 p-4">
        <div>
          {isSyncing ? (
            <ButtonLoading />
          ) : (
            <Button onClick={() => handleSync()} className="w-64">
              Sync
            </Button>
          )}
        </div>
        <div className="mt-4 flex gap-2 ">
          <div className="w-64 rounded-md border border-slate-500 p-4">
            <div className="border-b border-slate-500 text-center text-lg">
              Sync status messages
            </div>
            <div>
              {!!state.comparing.message && (
                <SyncStatusMessage message={state.comparing.message} />
              )}
              {!!state.deleting.message && (
                <SyncStatusMessage message={state.deleting.message} />
              )}
              {!!state.deleted.message && (
                <div className="flex flex-col gap-1">
                  <div
                    className="pt-4"
                    onClick={() => {
                      setIsDeletedVisible(!isDeletedVisible)
                      setIsAddedVisible(false)
                      setIsDoneVisible(false)
                    }}
                  >
                    {state.deleted.message}
                  </div>
                  <div className="mx-auto h-1 w-1 rounded-full border border-slate-700 bg-slate-500" />
                  <div className="mx-auto h-1 w-1 rounded-full border border-slate-700 bg-slate-500" />
                  <div className="mx-auto h-1 w-1 rounded-full border border-slate-700 bg-slate-500" />
                </div>
              )}
              {!!state.adding.message && (
                <SyncStatusMessage message={state.adding.message} />
              )}
              {!!state.added.message && (
                <div className="flex flex-col gap-1">
                  <div
                    className="pt-4"
                    onClick={() => {
                      setIsAddedVisible(!isAddedVisible)
                      setIsDeletedVisible(false)
                      setIsDoneVisible(false)
                    }}
                  >
                    {state.added.message}
                  </div>
                  <div className="mx-auto h-1 w-1 rounded-full border border-slate-700 bg-slate-500" />
                  <div className="mx-auto h-1 w-1 rounded-full border border-slate-700 bg-slate-500" />
                  <div className="mx-auto h-1 w-1 rounded-full border border-slate-700 bg-slate-500" />
                </div>
              )}
              {!!state.snapshotAdding.message && (
                <SyncStatusMessage message={state.snapshotAdding.message} />
              )}
              {!!state.snapshot.message && (
                <SyncStatusMessage message={state.snapshot.message} />
              )}
              {!!state.done.message && (
                <div
                  className="pt-4"
                  onClick={() => {
                    setIsDoneVisible(!isDoneVisible)
                    setIsDeletedVisible(false)
                    setIsAddedVisible(false)
                  }}
                >
                  {state.done.message}
                </div>
              )}
              {!!state.synced.message && (
                <SyncStatusMessage message={state.synced.message} />
              )}
            </div>
          </div>
          <div className="w-64 rounded-md border border-slate-500 p-4">
            <div className="border-b border-slate-500 text-center text-lg">
              Details
            </div>
            {isDeletedVisible && (
              <div>
                {state.deleted.data.map((data) => {
                  return (
                    <div
                      key={data.title}
                      className="my-2 flex flex-col rounded-md border border-slate-500"
                    >
                      <Image
                        src={data.thumbnail_url}
                        alt="img"
                        width="480"
                        height="360"
                        className="rounded-t-md"
                      />
                      <TooltipWrapper text={data.title}>
                        <a href={data.url} target="_blank">
                          <div className="p-2 text-sm">
                            {truncateTitle(data.title)}
                          </div>
                        </a>
                      </TooltipWrapper>
                      <TooltipWrapper text={data.author_name}>
                        <div className="p-2 text-sm font-semibold">
                          {data.author_name}
                        </div>
                      </TooltipWrapper>
                    </div>
                  )
                })}
              </div>
            )}
            {isAddedVisible && (
              <div>
                {state.added.data.map((data) => {
                  console.log({ data })
                  return (
                    <div
                      key={data.title}
                      className="my-2 flex flex-col rounded-md border border-slate-500"
                    >
                      <Image
                        src={data.thumbnail}
                        alt="img"
                        width="480"
                        height="360"
                        className="rounded-t-md"
                      />
                      <TooltipWrapper text={data.title}>
                        <a href={data.url} target="_blank">
                          <div className="p-2 text-sm">
                            {truncateTitle(data.title)}
                          </div>
                        </a>
                      </TooltipWrapper>
                      <TooltipWrapper text={data.videoOwnerChannelTitle}>
                        <div className="p-2 text-sm font-semibold">
                          {data.videoOwnerChannelTitle}
                        </div>
                      </TooltipWrapper>
                    </div>
                  )
                })}
              </div>
            )}
            {isDoneVisible && (
              <div>
                <div
                  onClick={() => {
                    setIsAddedVisible(!isAddedVisible)
                    setIsDoneVisible(false)
                  }}
                >
                  Added {state.added.data.length} videos to notion
                </div>
                <div>
                  {state.deleted.data.length > 1 ? (
                    <div
                      onClick={() => {
                        setIsDeletedVisible(!isDeletedVisible)
                        setIsDoneVisible(false)
                      }}
                    >
                      Deleted {state.deleted.data.length} videos from youtube
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setIsDeletedVisible(!isDeletedVisible)
                        setIsDoneVisible(false)
                      }}
                    >
                      Deleted {state.deleted.data.length} video from youtube
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
