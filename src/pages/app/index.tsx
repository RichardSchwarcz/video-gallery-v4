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
import { z } from 'zod'
import { MockAddedVideos, MockDeletedVideos } from '~/utils/mockData'

function App() {
  const [message, setMessage] = useState<TSyncMessages>()
  const [syncData, setSyncData] = useState<ResponseData>({
    newDataToSnapshotDB: [],
    newDataToMainDB: [],
    archivedVideoInfo: [],
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncDetails, setSyncDetails] = useState<
    'added' | 'deleted' | 'errors' | 'summary' | 'hide'
  >('summary')

  const { status, data: sessionData } = useSession()
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
      return (
        <div className="mb-4">
          <ButtonLoading loadingText="Syncing" />
        </div>
      )
    }
    if (!hasSettings && !isLoading) {
      return (
        <Button asChild className="mb-4 cursor-pointer">
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
      <Button onClick={() => handleSync()} className="mb-4 w-64">
        <SyncIcon />
        <span className="pl-2 font-semibold">Sync</span>
      </Button>
    )
  }

  const renderMessage = () => {
    if (message) {
      return (
        <div className="rounded-md border border-slate-300 p-2 shadow-messages">
          <p className="px-16">{message}</p>
        </div>
      )
    }
    if (hasSettings && lastSync) {
      return (
        <div className="rounded-md border border-slate-300 p-2 shadow-messages">
          <p className="px-16">Last Sync: {formatDateObject(lastSync)}</p>
        </div>
      )
    }
    if (hasSettings && !lastSync) {
      return (
        <div className="rounded-md border border-slate-300 p-2 shadow-messages">
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

  // validate syncData with zod
  const syncDataSchema = z
    .object({
      newDataToSnapshotDB: z.array(z.object({})),
      newDataToMainDB: z.array(
        z.object({
          videoId: z.string(),
          title: z.string(),
          thumbnail: z.string(),
          url: z.string(),
          videoOwnerChannelTitle: z.string(),
          duration: z.string(),
        }),
      ),
      archivedVideoInfo: z.array(
        z.object({
          author_name: z.string(),
          author_url: z.string(),
          height: z.number(),
          html: z.string(),
          provider_name: z.string(),
          provider_url: z.string(),
          thumbnail_height: z.number(),
          thumbnail_url: z.string(),
          thumbnail_width: z.number(),
          title: z.string(),
          type: z.string(),
          url: z.string(),
          version: z.string(),
          width: z.number(),
        }),
      ),
    })
    .refine((data) => {
      return (
        data.newDataToSnapshotDB.length > 0 ||
        data.newDataToMainDB.length > 0 ||
        data.archivedVideoInfo.length > 0
      )
    })
  // const validatedSyncData = syncDataSchema.safeParse(syncData)

  type TValidatedSyncData = z.infer<typeof syncDataSchema>

  const validatedSyncData = {
    success: true,
    data: {
      newDataToMainDB: MockAddedVideos,
      archivedVideoInfo: MockDeletedVideos,
    },
  }
  const renderSyncDetails = (data: TValidatedSyncData) => {
    console.log(syncDetails)
    if (syncDetails == 'added') {
      return (
        <div className="flex flex-col gap-4">
          {data.newDataToMainDB.map((video) => {
            return <VideoCard data={video} key={video.videoId} />
          })}
        </div>
      )
    }
    if (syncDetails == 'deleted') {
      return (
        <div className="flex flex-col gap-4">
          {data.archivedVideoInfo.map((video) => {
            return (
              <div key={video.url}>
                <p>{video.title}</p>
                <p>{video.author_name}</p>
              </div>
            )
          })}
        </div>
      )
    }
    if (syncDetails == 'errors') {
      return <div>errors</div>
    }
    if (syncDetails == 'summary') {
      return (
        <>
          <p>
            Added {data.newDataToMainDB.length} new{' '}
            {data.newDataToMainDB.length == 1 ? 'video' : 'videos'} to Notion
            database
          </p>
          <p className="pt-2">
            Removed {data.archivedVideoInfo.length}{' '}
            {data.archivedVideoInfo.length == 1 ? 'video' : 'videos'} from
            YouTube playlist
          </p>
        </>
      )
    }
  }

  const onClickSyncDetailsTab = (
    tab: 'added' | 'deleted' | 'errors' | 'hide',
  ) => {
    setSyncDetails(tab)
  }

  return (
    <div className="container mx-auto pt-6">
      <Navbar sessionData={sessionData} />
      <div className="mx-auto flex flex-col items-center">
        <div>{renderSyncButton()}</div>
        <div className="flex justify-center">
          {isLoading ? <Skeleton className="mt-4 h-8 w-96" /> : renderMessage()}
        </div>
        <div className="w-full">
          {validatedSyncData.success ? (
            <div className="flex ">
              <SyncDetailsTabs onClickSyncDetailsTab={onClickSyncDetailsTab} />

              <div className="mx-auto mt-4 w-8/12 rounded-md border border-slate-300 p-4 shadow-messages">
                {renderSyncDetails(validatedSyncData.data)}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default App
