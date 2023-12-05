import Link from 'next/link'
import Youtube from './icons/youtube'

function YoutubeAuthSettings() {
  return (
    <>
      <div className="flex items-center gap-2">
        <Youtube width="3rem" height="3rem" />
        <h1 className="text-center text-2xl font-bold">
          YouTube Authorization
        </h1>
      </div>
      <div>
        <p className="pt-7">
          You already gave us consent to access your YouTube playlist items.
        </p>
        <div className="pt-2">
          <p>
            If you want to remove your consent, go to your{' '}
            <Link
              href=""
              className="underline underline-offset-4 hover:text-primary"
            >
              profile
            </Link>{' '}
            and remove your YouTube account.
          </p>
        </div>

        <div className="flex justify-center gap-4 pt-8"></div>
      </div>
    </>
  )
}

export default YoutubeAuthSettings
