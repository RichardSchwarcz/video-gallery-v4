import Link from 'next/link'
import Notion from './icons/notion'

function NotionAuthSettings() {
  return (
    <>
      <div className="flex items-center gap-2">
        <Notion width="3rem" height="3rem" />
        <h1 className="text-center text-2xl font-bold">Notion Authorization</h1>
      </div>
      <p className="pt-7">
        You already gave us consent to access your Notion database.
      </p>
      <div className="pt-2">
        <p className="leading-7">
          If you want to remove your consent:
          <li>
            Go to your{' '}
            <Link
              href=""
              className="underline underline-offset-4 hover:text-primary"
            >
              profile
            </Link>{' '}
            and remove your Notion account
          </li>
          <li>Remove VideoGallery integration from your Notion App</li>
        </p>
      </div>
    </>
  )
}

export default NotionAuthSettings
