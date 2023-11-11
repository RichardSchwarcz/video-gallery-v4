function SyncStatusMessage({ message }: { message: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="rounded-md border-l-2 border-zinc-300 bg-zinc-100 p-2">
        {message}
      </div>
      <div className="flex justify-center">
        <svg height="20" width="33">
          <circle cx="4" cy="8.5" r="3" fill="gray" />
          <circle cx="14" cy="8.5" r="3" fill="gray" />
          <circle cx="24" cy="8.5" r="3" fill="gray" />
        </svg>
      </div>
    </div>
  )
}

export default SyncStatusMessage
