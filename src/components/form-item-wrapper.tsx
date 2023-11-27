import type { ControllerRenderProps } from 'react-hook-form'
import HelpIcon from './icons/help'
import { Button } from './ui/button'
import { FormControl, FormItem, FormMessage } from './ui/form'
import { Input } from './ui/input'
import type { formSchema } from '~/lib/validations/form'
import type { z } from 'zod'
import { TooltipWrapper } from './tooltip-wrapper'

type FormValues = z.infer<typeof formSchema>

type fieldType =
  | ControllerRenderProps<FormValues, 'notionMainDbId'>
  | ControllerRenderProps<FormValues, 'notionSnapshotDbId'>
  | ControllerRenderProps<FormValues, 'youtubePlaylistId'>

function FormItemWrapper({ field, id }: { field: fieldType; id: string }) {
  let title = ''
  let placeholder = ''
  let tooltip = ''
  if (field.name === 'youtubePlaylistId') {
    title = 'Youtube playlist ID'
    placeholder = 'Your unique Youtube playlist ID'
    tooltip = 'How to get Youtube playlist ID'
  }
  if (field.name === 'notionMainDbId') {
    title = 'Notion database ID'
    placeholder = 'Your unique Notion database ID'
    tooltip = 'How to get Notion database ID'
  }
  if (field.name === 'notionSnapshotDbId') {
    title = 'Notion snapshot ID'
    placeholder = 'Your unique Notion snapshot ID'
    tooltip = 'How to get Notion snapshot ID'
  }
  return (
    <FormItem>
      <div className="flex flex-row justify-between">
        <div className="flex w-full flex-row items-center">
          <p className="w-40 flex-none">{title}</p>
          <FormControl>
            <div className="flex w-full px-4">
              {id === '' ? (
                <Input placeholder={placeholder} {...field} />
              ) : (
                <Input placeholder={id} {...field} disabled />
              )}
            </div>
          </FormControl>
        </div>
        <div className="flex-none">
          <TooltipWrapper text={tooltip}>
            <Button
              size={'icon'}
              variant={'ghost'}
              onClick={(e) => e.preventDefault()}
            >
              <HelpIcon />
            </Button>
          </TooltipWrapper>
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
