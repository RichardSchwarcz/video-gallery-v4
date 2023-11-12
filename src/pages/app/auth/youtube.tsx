import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Youtube from '~/components/icons/youtube'
import { TooltipWrapper } from '~/components/tooltip-wrapper'
import { Button } from '~/components/ui/button'
import { OAUTH_GOOGLE_SCOPES } from '~/server/constants'

function YoutubeAuthPage() {
  const authorization = {
    scope: OAUTH_GOOGLE_SCOPES.join(' '),
  }

  return (
    <div className="p-4">
      <div className="mx-auto flex w-1/3 flex-col rounded-md border border-slate-500 p-2">
        <div className="flex items-center gap-2">
          <Youtube width="3rem" height="3rem" />
          <div className="pb-2 text-center text-2xl font-bold">
            Youtube Authorization Consent
          </div>
        </div>
        <div>
          We need your consent to be able to access and sync your data with
          Notion.
        </div>
        <div className="pt-2">
          With your consent we will be able to delete youtube playlist items
          that you will delete from Notion.
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
          <Button
            onClick={() => void signIn('google', undefined, authorization)}
          >
            Continue
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

export default YoutubeAuthPage
