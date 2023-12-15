import { Skeleton } from './ui/skeleton'

function FormFieldSkeleton() {
  return (
    <div className="flex flex-row justify-between">
      <div className="flex w-full flex-row items-center">
        {/* Text */}
        <Skeleton className="h-6 w-40 flex-none" />
        {/* input */}
        <Skeleton className="mx-4 flex h-10 w-full" />
        {/* Help */}
        <Skeleton className="h-10 w-10 flex-none" />
      </div>
    </div>
  )
}

export default FormFieldSkeleton
