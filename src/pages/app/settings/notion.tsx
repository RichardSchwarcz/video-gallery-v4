import { useSession } from 'next-auth/react'
import Navbar from '~/components/navbar'
import NotionAuthConsent from '~/components/notion-auth-consent'
import NotionAuthSettings from '~/components/notion-auth-settings'
import SettingsTabs from '~/components/settings-tabs'
import { api } from '~/utils/api'

function NotionAuthPage() {
  const { data: sessionData } = useSession()
  const { isSuccess: hasToken } = api.notion.getNotionToken.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      retry: false,
    },
  )
  const { data } = api.notion.getOAuthURL.useQuery(undefined, {
    enabled: !hasToken,
  })

  return (
    <div className="container mx-auto pt-6">
      <Navbar sessionData={sessionData} />
      <div className="flex">
        <SettingsTabs />
        <div className="w-full">
          <div className="ml-20 w-8/12 rounded-md border border-slate-300 p-6 shadow-messages">
            {hasToken ? (
              <NotionAuthSettings />
            ) : !!data ? (
              <NotionAuthConsent data={data} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotionAuthPage
