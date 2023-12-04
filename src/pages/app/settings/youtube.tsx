import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import Youtube from '~/components/icons/youtube'
import Navbar from '~/components/navbar'
import SettingsTabs from '~/components/settings-tabs'
import { Button } from '~/components/ui/button'
import { OAUTH_GOOGLE_SCOPES } from '~/server/constants'

function YoutubeAuthPage() {
  const { data: sessionData } = useSession()
  const authorization = {
    scope: OAUTH_GOOGLE_SCOPES.join(' '),
    access_type: 'offline', // to get refresh token
  }

  return (
    <div className="container mx-auto pt-6">
      <Navbar sessionData={sessionData} />
      <div className="flex">
        <SettingsTabs />
        <div className="w-full">
          <div className="ml-20 w-8/12 rounded-md border border-slate-300 p-6 shadow-messages">
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
                className="w-40"
              >
                Continue
              </Button>
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
      </div>
    </div>
  )
}

export default YoutubeAuthPage
