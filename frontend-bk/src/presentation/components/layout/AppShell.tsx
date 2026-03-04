import type { PropsWithChildren } from 'react'

export const AppShell = ({ children }: PropsWithChildren): JSX.Element => (
  <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
)