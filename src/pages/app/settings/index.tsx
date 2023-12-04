import { api } from '~/utils/api'
import { useSession } from 'next-auth/react'
import Navbar from '~/components/navbar'
import React from 'react'
import SettingsTabs from '~/components/settings-tabs'
import SettingsForm from '~/components/settings-form'

function Settings() {
  const { data: sessionData } = useSession()
  const [isBanner, setIsBanner] = React.useState(false)
  const { mutate, isLoading } = api.settings.setIds.useMutation()
  const {
    data,
    error,
    isLoading: isDataLoading,
  } = api.settings.getIds.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: false,
  })

  React.useEffect(() => {
    if (error) {
      setIsBanner(true)
    }
  }, [error])

  if (isDataLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto pt-6">
      <Navbar sessionData={sessionData} />
      <div className="flex">
        <SettingsTabs />
        <div className="w-full">
          {isBanner && (
            <div className="mb-4 ml-20 w-8/12 rounded-md border border-rose-400 p-6 shadow-messages">
              <p className="font-semibold">{error?.message}</p>
            </div>
          )}
          <div className="ml-20 w-8/12 rounded-md border border-slate-300 p-6 shadow-messages">
            <div className="">
              <SettingsForm data={data} mutate={mutate} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
