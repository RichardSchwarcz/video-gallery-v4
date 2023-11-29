import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField } from '~/components/ui/form'
import { Button } from '~/components/ui/button'
import { api } from '~/utils/api'
import { useSession } from 'next-auth/react'
import Navbar from '~/components/navbar'
import FormItemWrapper from '~/components/form-item-wrapper'
import { formSchema } from '~/lib/validations/form'
import type { z } from 'zod'
import { ButtonLoading } from '~/components/ui/button-loading'
import React from 'react'
import type { usersSettingsSchema } from '~/lib/validations/user'
import Link from 'next/link'
import SettingsTabs from '~/components/settings-tabs'

function Settings() {
  const { data: sessionData } = useSession()
  const [isBanner, setIsBanner] = React.useState(false)
  const [settingsIds, setSettingsIds] = React.useState<settingsIds>({
    youtubePlaylistId: '',
    notionMainDbId: '',
    notionSnapshotDbId: '',
  })
  const { mutate, isLoading } = api.settings.setIds.useMutation()
  const { error, data: ids } = api.settings.getIds.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: false,
  })

  React.useEffect(() => {
    if (error) {
      setIsBanner(true)
    }
    if (ids) {
      setSettingsIds(ids)
    }
  }, [error, ids])

  type settingsIds = z.infer<typeof usersSettingsSchema>

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values)
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notionMainDbId: '',
      notionSnapshotDbId: '',
      youtubePlaylistId: '',
    },
  })

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
              <Form {...form}>
                <form
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="youtubePlaylistId"
                    render={({ field }) => (
                      <FormItemWrapper
                        field={field}
                        id={settingsIds.youtubePlaylistId}
                      />
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notionMainDbId"
                    render={({ field }) => (
                      <FormItemWrapper
                        field={field}
                        id={settingsIds.notionMainDbId}
                      />
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notionSnapshotDbId"
                    render={({ field }) => (
                      <FormItemWrapper
                        field={field}
                        id={settingsIds.notionSnapshotDbId}
                      />
                    )}
                  />
                  <div className="flex justify-end gap-4">
                    {isLoading ? (
                      <ButtonLoading loadingText="Please wait" />
                    ) : (
                      <Button type="submit">Save</Button>
                    )}
                    <div className="w-10" />
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
