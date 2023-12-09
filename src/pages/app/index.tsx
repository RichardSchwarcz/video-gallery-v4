import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import Link from 'next/link'
import { ButtonLoading } from '~/components/ui/button-loading'
import {
  type EventSourceMessages,
  syncMessages,
  type ResponseData,
  type TSyncMessages,
} from '../api/sync'
import Navbar from '~/components/navbar'
import SyncIcon from '~/components/icons/sync'
import { api } from '~/utils/api'
import WelcomeMessage from '~/components/welcome-message'
import SettingsIcon from '~/components/icons/settings'
import { Skeleton } from '~/components/ui/skeleton'
import { formatDateObject } from '~/utils/formatDateObject'
import SyncDetailsTabs from '~/components/sync-details-tabs'
import VideoCard from '~/components/video-card'

function App() {
  const [message, setMessage] = useState<TSyncMessages>()
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
              message: typeof syncMessages.done
              data: ResponseData
            }
        setMessage(data.message)

        if (data.message == syncMessages.done) {
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
    if (!hasSettings && !isLoading) {
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
    if (message && message == syncMessages.done) {
      return
    }
    return (
      <Button onClick={() => handleSync()} className="w-64">
        <SyncIcon />
        <span className="pl-2 font-semibold">Sync</span>
      </Button>
    )
  }

  const renderMessage = () => {
    if (message) {
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
    if (hasSettings && !lastSync) {
      return (
        <div className="mt-4 rounded-md border border-slate-300 p-2 shadow-messages">
          <p className="line-clamp-2 px-4">
            Try adding some videos to your YouTube playlist and sync!
          </p>
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
      <div className="flex">
        <SyncDetailsTabs />
        <div className="mx-auto flex w-2/3 flex-col items-center">
          <div>{renderSyncButton()}</div>
          <div className="flex justify-center">
            {isLoading ? (
              <Skeleton className="mt-4 h-8 w-96" />
            ) : (
              renderMessage()
            )}
          </div>
          <div className="mt-4 w-full rounded-md border border-slate-300 p-2 shadow-messages">
            {syncData.newDataToMainDB.map((video) => (
              <VideoCard key={video.url} data={video} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
