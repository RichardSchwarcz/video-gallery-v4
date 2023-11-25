import { useSession } from 'next-auth/react'
import { useReducer, useState } from 'react'
import { Button } from '~/components/ui/button'
import Link from 'next/link'
import { ButtonLoading } from '~/components/ui/button-loading'
import { type EventSourceDataType, syncMessage } from '../api/sync'
import { initialState, reducer } from '~/utils/reducer'
import Navbar from '~/components/navbar'
import SyncIcon from '~/components/icons/sync'

function App() {
  const { status, data: sessionData } = useSession()
  const [isSyncing, setIsSyncing] = useState(false)
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
    <div className="container mx-auto pt-6">
      <Navbar sessionData={sessionData} />

      <div className="mx-auto flex w-fit flex-col items-center pt-4">
        <div>
          {isSyncing ? (
            <ButtonLoading />
          ) : (
            <Button onClick={() => handleSync()} className="w-64">
              <SyncIcon />
              <span className="pl-2 font-semibold">Sync</span>
            </Button>
          )}
        </div>
        <div className="shadow-messages mt-4 rounded-md border border-slate-300 p-2">
          <p>Go to settings and give consent and fill IDs</p>
        </div>
      </div>
    </div>
  )
}

export default App
