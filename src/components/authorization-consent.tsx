function AuthorizationConsent() {
  return (
    <div className="mx-auto flex w-1/3 flex-col rounded-md border border-slate-600 p-4 text-justify">
      <div className="mb-2">
        &ldquo;Welcome to Notion Video Gallery! To begin your journey, we need
        your permission to access essential features. Without authorization,
        Notion Video Gallery won&apos;t function properly, and you won&apos;t be
        able to use the app.
      </div>

      <div className="mb-2">
        Your privacy and data security are our top priorities, and we only
        request the permissions necessary for optimal performance.
      </div>
      <div className="mb-2">
        To get started, click &lsquo;Next&rsquo; and experience the core
        functionalities of Notion Video Gallery.
      </div>
      <div className="text-sm">
        Thank you for choosing Notion Video Gallery—where every permission
        ensures a smoother and more efficient user experience!&rdquo;
      </div>
    </div>
  );
}

export default AuthorizationConsent;
