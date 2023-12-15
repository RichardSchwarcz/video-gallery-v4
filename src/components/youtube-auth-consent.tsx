import Link from 'next/link'
import Youtube from './icons/youtube'
import { Button } from './ui/button'
import { signIn } from 'next-auth/react'

type authorizationType = {
  authorization: {
    scope: string
    access_type: string
  }
}

function YoutubeAuthConsent({ authorization }: authorizationType) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Youtube width="3rem" height="3rem" />
        <div className="text-center text-2xl font-bold">
          YouTube Authorization Consent
        </div>
      </div>
      <div className="pt-7">
        We need your consent to be able to access and sync your data with
        Notion.
      </div>
      <div className="pt-2">
        With your consent we will be able to delete YouTube playlist items that
        you will delete from Notion.
      </div>
      <p className="pt-2">
        For more information, please read how our sync works{' '}
        <Link
          href="/help#how-does-syncing-work"
          className="underline underline-offset-4 hover:text-primary"
        >
          here
        </Link>
        .
      </p>
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
    </>
  )
}

export default YoutubeAuthConsent
