import { Outlet } from 'react-router-dom'
import { Sidebar, MobileSidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { ChatFab } from '@presentation/components/chatbot/ChatFab'
import { ChatWidget } from '@presentation/components/chatbot/ChatWidget'
import { cn } from '@shared/utils/cn'
import { useLayoutStore } from '@application/stores/useLayoutStore'

function AppShell() {
  const collapsed = useLayoutStore((s) => s.sidebarCollapsed)

  return (
    <div className="min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      <MobileSidebar />

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Main content — offset by sidebar width on desktop */}
      <main
        className={cn(
          'min-h-screen pb-20 lg:pb-0 sidebar-transition',
          collapsed
            ? 'lg:ml-[var(--sidebar-width-collapsed)]'
            : 'lg:ml-[var(--sidebar-width)]',
        )}
        role="main"
      >
        <Outlet />
      </main>

      {/* Chatbot floating button + widget (present on all pages) */}
      <ChatFab />
      <ChatWidget />
    </div>
  )
}

export { AppShell }
