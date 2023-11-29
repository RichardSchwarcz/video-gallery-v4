import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Notion from '~/components/icons/notion'
import Navbar from '~/components/navbar'
import SettingsTabs from '~/components/settings-tabs'
import { Button } from '~/components/ui/button'
import { api } from '~/utils/api'

function NotionAuthPage() {
  const { data: sessionData } = useSession()
  const { data } = api.notion.getOAuthURL.useQuery(undefined, {
    enabled: true,
  })
  if (data) {
    return (
      <div className="container mx-auto pt-6">
        <Navbar sessionData={sessionData} />
        <div className="flex">
          <SettingsTabs />
          <div className="w-full">
            <div className="ml-20 w-8/12 rounded-md border border-slate-300 p-6 shadow-messages">
              <div className="flex items-center gap-2">
                <Notion width="3rem" height="3rem" />
                <div className="pb-2 text-center text-2xl font-bold">
                  Notion Authorization Consent
                </div>
              </div>
              <div>
                We need your consent to be able to access and sync your data
                with Youtube.
              </div>
              <div className="pt-2">
                With your consent we will be able to add youtube playlist items
                as new pages to your Notion database.
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
                <Button asChild className="w-40">
                  <Link href={data}>Continue</Link>
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
}

export default NotionAuthPage
