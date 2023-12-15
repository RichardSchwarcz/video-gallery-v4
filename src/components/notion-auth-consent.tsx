import Link from 'next/link'
import Notion from './icons/notion'
import { Button } from './ui/button'

function NotionAuthConsent({ data }: { data: string }) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Notion width="3rem" height="3rem" />
        <div className="text-center text-2xl font-bold">
          Notion Authorization Consent
        </div>
      </div>
      <div className="pt-7">
        We need your consent to be able to access and sync your data with
        Youtube.
      </div>
      <div className="pt-2">
        With your consent we will be able to add youtube playlist items as new
        pages to your Notion database.
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
    </>
  )
}

export default NotionAuthConsent
