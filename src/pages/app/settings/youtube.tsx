import { useSession } from 'next-auth/react'
import Navbar from '~/components/navbar'
import SettingsTabs from '~/components/settings-tabs'
import YoutubeAuthConsent from '~/components/youtube-auth-consent'
import YoutubeAuthSettings from '~/components/youtube-auth-settings'
import { OAUTH_GOOGLE_SCOPES } from '~/server/constants'
import { isYoutubeAuthorized } from '~/utils/auth'

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
            {isYoutubeAuthorized(sessionData) ? (
              <YoutubeAuthSettings />
            ) : (
              <YoutubeAuthConsent authorization={authorization} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default YoutubeAuthPage
