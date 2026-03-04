import { cn } from '@shared/utils/cn'

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded bg-muted animate-pulse', className)}
      aria-hidden="true"
    />
  )
}

/** Skeleton rows for the desktop table view */
function TenantTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="px-4 py-3"><SkeletonBar className="h-3 w-16" /></th>
            <th className="px-4 py-3 hidden xl:table-cell"><SkeletonBar className="h-3 w-8" /></th>
            <th className="px-4 py-3"><SkeletonBar className="h-3 w-12 mx-auto" /></th>
            <th className="px-4 py-3 hidden md:table-cell"><SkeletonBar className="h-3 w-16 mx-auto" /></th>
            <th className="px-4 py-3 hidden lg:table-cell"><SkeletonBar className="h-3 w-20" /></th>
            <th className="px-4 py-3"><SkeletonBar className="h-3 w-12 ml-auto" /></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, i) => (
            <tr key={i} className="border-b border-border last:border-b-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <SkeletonBar className="w-9 h-9 rounded-full shrink-0" />
                  <div className="space-y-1.5">
                    <SkeletonBar className="h-3.5 w-32" />
                    <SkeletonBar className="h-2.5 w-24" />
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 hidden xl:table-cell"><SkeletonBar className="h-3 w-20" /></td>
              <td className="px-4 py-3"><SkeletonBar className="h-5 w-14 mx-auto rounded-full" /></td>
              <td className="px-4 py-3 hidden md:table-cell"><SkeletonBar className="h-3 w-6 mx-auto" /></td>
              <td className="px-4 py-3 hidden lg:table-cell"><SkeletonBar className="h-3 w-20" /></td>
              <td className="px-4 py-3"><SkeletonBar className="h-3 w-16 ml-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Skeleton cards for mobile view */
function TenantCardsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-[var(--radius-lg)] bg-surface border border-border p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-start gap-3">
            <SkeletonBar className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <div className="space-y-1.5">
                  <SkeletonBar className="h-3.5 w-36" />
                  <SkeletonBar className="h-2.5 w-24" />
                </div>
                <SkeletonBar className="h-5 w-14 rounded-full" />
              </div>
              <SkeletonBar className="h-2.5 w-28" />
              <div className="pt-3 border-t border-border flex gap-2">
                <SkeletonBar className="h-7 w-24 rounded-[var(--radius-md)]" />
                <SkeletonBar className="h-7 w-16 rounded-[var(--radius-md)]" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

TenantTableSkeleton.displayName = 'TenantTableSkeleton'
TenantCardsSkeleton.displayName = 'TenantCardsSkeleton'

export { TenantTableSkeleton, TenantCardsSkeleton }
