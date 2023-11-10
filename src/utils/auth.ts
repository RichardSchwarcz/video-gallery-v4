import type { Session } from 'next-auth'

export const isYoutubeAuthorized = (sessionData: Session | null) => {
  if (sessionData?.token.scope?.includes('youtube')) {
    return true
  } else {
    return false
  }
}
