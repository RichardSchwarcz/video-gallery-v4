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
import SettingsTabs from '~/components/settings-tabs'
import { cn } from '~/lib/utils'
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next'
import { createServerSideHelpers } from '@trpc/react-query/server'
import { appRouter } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import { TRPCError } from '@trpc/server'

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createTRPCContext({ req: context.req, res: context.res }),
  })

  try {
    const prefetchedIds = await helpers.settings.getIds.fetch(undefined)
    return {
      props: {
        prefetchedIds,
      },
    }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return {
        props: {
          error: error.message,
        },
      }
    }
  }
}

type settingsIdsType = z.infer<typeof formSchema>

function Settings(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const { data: sessionData } = useSession()
  const [isBanner, setIsBanner] = React.useState(false)
  const { mutate, isLoading } = api.settings.setIds.useMutation()
  const { error } = api.settings.getIds.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: false,
  })

  React.useEffect(() => {
    if (error) {
      setIsBanner(true)
    }
  }, [error])

  const form = useForm<settingsIdsType>({
    resolver: zodResolver(formSchema),
    defaultValues: props.prefetchedIds,
  })

  const settingsIds = props.prefetchedIds ?? {
    youtubePlaylistId: '',
    notionMainDbId: '',
    notionSnapshotDbId: '',
  }

  function onSubmit(values: settingsIdsType) {
    mutate(values)
  }
  const offsetElementWidth = (ids: settingsIdsType | undefined) => {
    if (ids) {
      return 'w-20'
    }
    return 'w-10'
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
                    <div
                      className={cn(offsetElementWidth(props.prefetchedIds))}
                    />
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
