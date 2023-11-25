import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { api } from '~/utils/api'
import { ProfileDropdownMenu } from '~/components/profile-dropdown-menu'
import { AuthorizationMenu } from '~/components/authorization-menu'
import { ModeToggle } from '~/components/mode-toggle'
import { useSession } from 'next-auth/react'
import Navbar from '~/components/navbar'

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

  const formSchema = z.object({
    youtubePlaylistId: z.string().min(34, {
      message: 'Youtube playlist ID must be 34 characters long',
    }),
    notionMainDbId: z.string().min(32, {
      message: 'Notion database ID must be 32 characters long',
    }),
    notionSnapshotDbId: z.string().min(32, {
      message: 'Notion snapshot ID must be 32 characters long',
    }),
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
      <div className="text-lg font-bold">Settings</div>
      <div className="w-1/3">
        <Form {...form}>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="youtubePlaylistId"
              render={({ field }) => (
                <div className="rounded-md border border-slate-200 p-4">
                  <FormItem>
                    <FormLabel>Youtube playlist ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Youtube playlist ID" {...field} />
                    </FormControl>
                    <FormDescription className="border-t">
                      Learn more about how to get your Youtube playlist ID{' '}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="notionMainDbId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notion database ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Notion database ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notionSnapshotDbId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notion snapshot ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Notion snapshot ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isLoading ? (
              <Button disabled>Loading...</Button>
            ) : (
              <Button type="submit">Submit</Button>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}

export default Settings
