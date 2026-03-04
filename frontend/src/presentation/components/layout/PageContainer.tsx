import type { ReactNode } from 'react'
import { cn } from '@shared/utils/cn'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        'px-4 sm:px-6 lg:px-8',
        'py-6',
        'max-w-7xl mx-auto w-full',
        className,
      )}
    >
      {children}
    </div>
  )
}

export { PageContainer }
export type { PageContainerProps }
