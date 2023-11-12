import Link from 'next/link'
import Notion from '~/components/icons/notion'
import { TooltipWrapper } from '~/components/tooltip-wrapper'
import { Button } from '~/components/ui/button'
import { api } from '~/utils/api'

function NotionAuthPage() {
  const { data } = api.notion.getOAuthURL.useQuery(undefined, {
    enabled: true,
  })
  if (data) {
    return (
      <div className="p-4">
        <div className="mx-auto flex w-1/3 flex-col rounded-md border border-slate-500 p-2">
          <div className="flex items-center gap-2">
            <Notion width="3rem" height="3rem" />
            <div className="pb-2 text-center text-2xl font-bold">
              Notion Authorization Consent
            </div>
          </div>
          <div>
            We need your consent to be able to access and sync your data with
            Youtube.
          </div>
          <div className="pt-2">
            With your consent we will be able to add youtube playlist items as
            new pages to your Notion database.
          </div>
          <div className="pt-2">
            For more information, please read how our sync works{' '}
            <Link
              href="/help#how-does-syncing-work"
              className="underline underline-offset-4 hover:text-primary"
            >
              here
            </Link>
          </div>
          <div className="flex justify-center gap-4 pt-8">
            <Button asChild>
              <Link href={data}>Continue</Link>
            </Button>
            <TooltipWrapper text="Go back to App">
              <Button asChild variant={'outline'}>
                <Link href="/app">App</Link>
              </Button>
            </TooltipWrapper>
            <TooltipWrapper text="Go back to Home Page">
              <Button asChild variant={'outline'}>
                <Link href="/">Home Page</Link>
              </Button>
            </TooltipWrapper>
          </div>

          <p className="py-2 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{' '}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    )
  }
}

export default NotionAuthPage
