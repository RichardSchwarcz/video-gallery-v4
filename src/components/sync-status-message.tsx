function SyncStatusMessage({ message }: { message: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="py-2">{message}</div>
      <div className="mx-auto h-1 w-1 rounded-full border border-slate-700 bg-slate-500" />
      <div className="mx-auto h-1 w-1 rounded-full border border-slate-700 bg-slate-500" />
      <div className="mx-auto h-1 w-1 rounded-full border border-slate-700 bg-slate-500" />
    </div>
  )
}

export default SyncStatusMessage
