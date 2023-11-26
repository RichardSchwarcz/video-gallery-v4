import type { ControllerRenderProps } from 'react-hook-form'
import HelpIcon from './icons/help'
import { Button } from './ui/button'
import { FormControl, FormItem, FormMessage } from './ui/form'
import { Input } from './ui/input'
import type { formSchema } from '~/lib/validations/form'
import type { z } from 'zod'

type FormValues = z.infer<typeof formSchema>

type fieldType =
  | ControllerRenderProps<FormValues, 'notionMainDbId'>
  | ControllerRenderProps<FormValues, 'notionSnapshotDbId'>
  | ControllerRenderProps<FormValues, 'youtubePlaylistId'>

function FormItemWrapper({ field }: { field: fieldType }) {
  let title = ''
  let placeholder = ''
  if (field.name === 'youtubePlaylistId') {
    title = 'Youtube playlist ID'
    placeholder = 'Your unique Youtube playlist ID'
  }
  if (field.name === 'notionMainDbId') {
    title = 'Notion database ID'
    placeholder = 'Your unique Notion database ID'
  }
  if (field.name === 'notionSnapshotDbId') {
    title = 'Notion snapshot ID'
    placeholder = 'Your unique Notion snapshot ID'
  }
  return (
    <FormItem>
      <div className="flex flex-row justify-between">
        <div className="flex w-full flex-row items-center">
          <p className="w-40 flex-none">{title}</p>
          <FormControl>
            <div className="flex w-full px-4">
              <Input placeholder={placeholder} {...field} />
            </div>
          </FormControl>
        </div>
        <div className="flex-none">
          <Button size={'icon'} variant={'ghost'}>
            <HelpIcon />
          </Button>
        </div>
      </div>
      <div className="flex h-8 items-center">
        <div className="w-40" />
        <FormMessage className="pl-4" />
      </div>
    </FormItem>
  )
}

export default FormItemWrapper
