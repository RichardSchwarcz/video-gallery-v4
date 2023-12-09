import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import Link from 'next/link'
import { ButtonLoading } from '~/components/ui/button-loading'
import {
  type EventSourceMessages,
  syncMessage,
  type ResponseData,
} from '../api/sync'
import Navbar from '~/components/navbar'
import SyncIcon from '~/components/icons/sync'
import { api } from '~/utils/api'
import WelcomeMessage from '~/components/welcome-message'
import SettingsIcon from '~/components/icons/settings'
import { Skeleton } from '~/components/ui/skeleton'
import { formatDateObject } from '~/utils/formatDateObject'

function App() {
  const [message, setMessage] = useState<string>('')
  const [syncData, setSyncData] = useState<ResponseData>({
    newDataToSnapshotDB: [],
    newDataToMainDB: [],
    archivedVideoInfo: [],
  })
  const { status, data: sessionData } = useSession()
  const [isSyncing, setIsSyncing] = useState(false)
  const { mutate: lastSyncMutation } = api.settings.setLastSync.useMutation()
  const { data: lastSync } = api.settings.getLastSync.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  })
  const { isSuccess: hasSettings, isLoading } =
    api.settings.hasSettings.useQuery(undefined, {
      retry: false,
      refetchOnWindowFocus: false,
    })

  const handleSync = () => {
    setIsSyncing(true)
    try {
      const eventSource = new EventSource('/api/sync')
      eventSource.addEventListener('syncEvent', (e) => {
        const data = JSON.parse(e.data as string) as
          | EventSourceMessages
          | {
              message: typeof syncMessage.done
              data: ResponseData
            }
        setMessage(data.message)

        if (data.message == syncMessage.done) {
          setSyncData(data.data)
          setIsSyncing(false)
          lastSyncMutation()
        }
      })
      eventSource.addEventListener('open', () => {
        return
      })
      eventSource.addEventListener('error', () => {
        eventSource.close()
      })
    } catch (error) {
      throw new Error('error')
    }
  }

  const renderSyncButton = () => {
    if (isSyncing) {
      return <ButtonLoading loadingText="Syncing" />
    }
    if (!hasSettings) {
      return (
        <Button asChild className="cursor-pointer">
          <div className="flex gap-2">
            <SettingsIcon />
            <Link href={'/app/settings'} className="font-semibold">
              Settings
            </Link>
          </div>
        </Button>
      )
    }
    return (
      <Button onClick={() => handleSync()} className="w-64">
        <SyncIcon />
        <span className="pl-2 font-semibold">Sync</span>
      </Button>
    )
  }

  const renderMessage = () => {
    if (message !== '') {
      if (message == 'Everything is in sync 🎉') {
        setTimeout(() => {
          setMessage('')
        }, 5000)
      }
      return (
        <div className="mt-4 rounded-md border border-slate-300 p-2 shadow-messages">
          <p className="px-16">{message}</p>
        </div>
      )
    }

    if (hasSettings && lastSync) {
      return (
        <div className="mt-4 rounded-md border border-slate-300 p-2 shadow-messages">
          <p className="px-16">Last Sync: {formatDateObject(lastSync)}</p>
        </div>
      )
    }
    return (
      <div className="mt-4 w-2/3 rounded-md border border-slate-300 p-4 shadow-messages">
        <WelcomeMessage />
      </div>
    )
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

      <div className="mx-auto flex w-fit flex-col items-center">
        <div>{renderSyncButton()}</div>
        <div className="flex justify-center">
          {isLoading ? <Skeleton className="mt-4 h-8 w-96" /> : renderMessage()}
        </div>
      </div>
    </div>
  )
}

export default App
