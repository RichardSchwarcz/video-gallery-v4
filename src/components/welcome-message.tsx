function WelcomeMessage() {
  return (
    <>
      <h1 className="pb-4 text-center text-xl font-bold">
        Hello and welcome to our app!
      </h1>
      <p className="mb-4">
        To ensure you have a smooth experience, we need your input to set up the
        essential components of our app.
      </p>

      <h2 className="font-bold">
        Step 1: Fill Your URLs for Seamless Integration
      </h2>
      <p className="mb-4">
        To get started, kindly navigate to the Settings section and fill in the
        URLs form. This step is crucial for ensuring a smooth synchronization
        between your YouTube playlists and Notion database.
      </p>

      <h2 className="font-bold">Step 2: Grant Consent for Notion Database</h2>
      <p className="mb-2">
        We&apos;re excited to offer you the best experience in syncing your
        YouTube playlists with the Notion database. To enable this feature,
        please grant consent for accessing your Notion database.
      </p>
      <p>
        Thank you for choosing our app for your syncing needs. If you have any
        questions or need assistance, feel free to visit the Help section. Happy
        syncing!
      </p>
    </>
  )
}
export default WelcomeMessage
