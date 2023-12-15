import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField } from '~/components/ui/form'
import { Button } from '~/components/ui/button'
import FormItemWrapper from '~/components/form-item-wrapper'
import { idSchema } from '~/lib/validations/form'
import type { z } from 'zod'
import { ButtonLoading } from '~/components/ui/button-loading'
import React from 'react'
import { cn } from '~/lib/utils'

type settingsIdsType = z.infer<typeof idSchema>

type propsType = {
  data: settingsIdsType | undefined
  mutate: (values: settingsIdsType) => void
  isLoading: boolean
}

function SettingsForm({ data, mutate, isLoading }: propsType) {
  const form = useForm<settingsIdsType>({
    resolver: zodResolver(idSchema),
    defaultValues: {
      youtubePlaylistId: data?.youtubePlaylistId ?? '',
      notionMainDbId: data?.notionMainDbId ?? '',
      notionSnapshotDbId: data?.notionSnapshotDbId ?? '',
    },
  })

  function onSubmit(values: settingsIdsType) {
    mutate(values)
  }

  const offsetElementWidth = (ids: settingsIdsType | undefined) => {
    if (ids) {
      return 'w-20'
    }
    return 'w-10'
  }

  const renderButton = (isLoading: boolean) => {
    const isDisabled = !form.formState.isDirty
    if (isDisabled) {
      return (
        <Button type="submit" disabled>
          Save
        </Button>
      )
    }
    if (isLoading) {
      return <ButtonLoading loadingText="Please wait" />
    }
    return <Button type="submit">Save</Button>
  }

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="youtubePlaylistId"
          render={({ field }) => (
            <FormItemWrapper field={field} id={data?.youtubePlaylistId} />
          )}
        />

        <FormField
          control={form.control}
          name="notionMainDbId"
          render={({ field }) => (
            <FormItemWrapper field={field} id={data?.notionMainDbId} />
          )}
        />

        <FormField
          control={form.control}
          name="notionSnapshotDbId"
          render={({ field }) => (
            <FormItemWrapper field={field} id={data?.notionSnapshotDbId} />
          )}
        />
        <div className="flex justify-end gap-4">
          {renderButton(isLoading)}
          <div className={cn(offsetElementWidth(data))} />
        </div>
      </form>
    </Form>
  )
}

export default SettingsForm
