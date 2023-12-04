import { api } from '~/utils/api'
import { useSession } from 'next-auth/react'
import Navbar from '~/components/navbar'
import React from 'react'
import SettingsTabs from '~/components/settings-tabs'
import SettingsForm from '~/components/settings-form'
import FormFieldSkeleton from '~/components/form-field-skeleton'
import { Skeleton } from '~/components/ui/skeleton'

function Settings() {
  const { data: sessionData } = useSession()
  const [isBanner, setIsBanner] = React.useState(false)
  const { mutate, isLoading, isSuccess } = api.settings.setIds.useMutation()
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
    if (isSuccess) {
      setIsBanner(false)
    }
  }, [error, isSuccess])

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
              {isDataLoading ? (
                <div className="flex flex-col gap-8">
                  <FormFieldSkeleton />
                  <FormFieldSkeleton />
                  <FormFieldSkeleton />
                  <div className="flex flex-row-reverse pr-14">
                    <Skeleton className="h-10 w-28" />
                  </div>
                </div>
              ) : (
                <SettingsForm
                  data={data}
                  mutate={mutate}
                  isLoading={isLoading}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
