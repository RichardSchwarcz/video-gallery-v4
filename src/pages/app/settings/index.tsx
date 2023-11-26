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

function Settings() {
  const { status, data: sessionData } = useSession()
  const { data, mutate, isLoading } = api.settings.setIds.useMutation({
    onSuccess: () => {
      console.log('success')
    },
    onError: () => {
      console.log('error')
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log({ values })
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
        <div className="flex w-[140px] flex-col">
          <p className="text-center text-lg font-bold">Settings</p>
          <div className="border-t py-2" />
          <div className="flex flex-col gap-4">
            <Button variant={'outline'}>Youtube</Button>
            <Button variant={'outline'}>Notion</Button>
            <Button
              variant={'outline'}
              className="border-2 border-slate-300 bg-gradient-to-r from-stone-200"
            >
              IDs
            </Button>
          </div>
        </div>
        <div className="w-full">
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
                    render={({ field }) => <FormItemWrapper field={field} />}
                  />

                  <FormField
                    control={form.control}
                    name="notionMainDbId"
                    render={({ field }) => <FormItemWrapper field={field} />}
                  />

                  <FormField
                    control={form.control}
                    name="notionSnapshotDbId"
                    render={({ field }) => <FormItemWrapper field={field} />}
                  />
                  <div className="flex justify-end gap-4">
                    {isLoading ? (
                      <Button disabled>Loading...</Button>
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
