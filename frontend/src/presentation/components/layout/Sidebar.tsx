import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  FileSearch,
  Palette,
  Building2,
  FolderKanban,
  Layers,
  Settings,
  ChevronLeft,
  X,
  MessageCircle,
  Users,
} from 'lucide-react'
import { cn } from '@shared/utils/cn'
import { ROUTES } from '@shared/constants/routes'
import { useLayoutStore } from '@application/stores/useLayoutStore'

const navItems = [
  { key: 'dashboard', to: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { key: 'baDashboard', to: ROUTES.BA_DASHBOARD, icon: FileSearch },
  { key: 'raDashboard', to: ROUTES.RA_DASHBOARD, icon: FileSearch },
  { key: 'uxDashboard', to: ROUTES.UX_DASHBOARD, icon: Palette },
  { key: 'tenants', to: ROUTES.TENANTS, icon: Building2 },
  { key: 'projects', to: ROUTES.PROJECTS, icon: FolderKanban },
  { key: 'blueprints', to: ROUTES.BLUEPRINTS, icon: Layers },
  { key: 'users', to: ROUTES.USERS, icon: Users },
  { key: 'chatbot', to: ROUTES.CHATBOT, icon: MessageCircle },
  { key: 'settings', to: ROUTES.SETTINGS, icon: Settings },
] as const

/** Desktop sidebar — collapsible */
function Sidebar() {
  const { t } = useTranslation()
  const collapsed = useLayoutStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useLayoutStore((s) => s.toggleSidebar)

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col',
        'min-h-screen fixed inset-y-0 left-0 z-40',
        'bg-[#1c2434] text-white sidebar-transition',
        collapsed
          ? 'w-[var(--sidebar-width-collapsed)]'
          : 'w-[var(--sidebar-width)]',
      )}
      role="navigation"
      aria-label={t('nav.sidebar')}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div
            className={cn(
              'flex items-center justify-center shrink-0',
              'w-8 h-8 rounded-lg bg-primary text-sm font-bold text-white',
            )}
          >
            di
          </div>
          {!collapsed && (
            <span className="text-base font-semibold tracking-tight whitespace-nowrap">
              {t('app.name')}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          className={cn(
            'flex items-center justify-center',
            'w-7 h-7 rounded-md hover:bg-white/10 transition-colors',
            collapsed && 'rotate-180',
          )}
          aria-label={t('header.toggleSidebar')}
        >
          <ChevronLeft className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Section label */}
      {!collapsed && (
        <div className="px-5 mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
            {t('nav.menu')}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto" role="menubar">
        {navItems.map(({ key, to, icon: Icon }) => (
          <NavLink
            key={key}
            to={to}
            end={to === ROUTES.DASHBOARD}
            role="menuitem"
            title={collapsed ? t(`nav.${key}`) : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-md transition-colors duration-150',
                'text-sm font-medium',
                'hover:bg-white/10 focus-visible:bg-white/10',
                collapsed
                  ? 'justify-center px-2.5 py-3'
                  : 'gap-3 px-3 py-2.5',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/70',
              )
            }
          >
            <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
            {!collapsed && <span>{t(`nav.${key}`)}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn(
        'border-t border-white/10 py-4',
        collapsed ? 'px-2 text-center' : 'px-5',
      )}>
        {collapsed ? (
          <p className="text-[10px] text-white/30">&copy;</p>
        ) : (
          <p className="text-xs text-white/40">&copy; 2026 deep-ion</p>
        )}
      </div>
    </aside>
  )
}

/** Mobile sidebar overlay */
function MobileSidebar() {
  const { t } = useTranslation()
  const open = useLayoutStore((s) => s.mobileSidebarOpen)
  const setOpen = useLayoutStore((s) => s.setMobileSidebarOpen)

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50',
          'w-[var(--sidebar-width)] bg-[#1c2434] text-white',
          'transform transition-transform duration-300 ease-in-out',
          'flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        role="navigation"
        aria-label={t('nav.sidebar')}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'flex items-center justify-center',
                'w-8 h-8 rounded-lg bg-primary text-sm font-bold text-white',
              )}
            >
              di
            </div>
            <span className="text-base font-semibold tracking-tight">
              {t('app.name')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/10 transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Section label */}
        <div className="px-5 mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
            {t('nav.menu')}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto" role="menubar">
          {navItems.map(({ key, to, icon: Icon }) => (
            <NavLink
              key={key}
              to={to}
              end={to === ROUTES.DASHBOARD}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md',
                  'text-sm font-medium transition-colors duration-150',
                  'hover:bg-white/10 focus-visible:bg-white/10',
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70',
                )
              }
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{t(`nav.${key}`)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-xs text-white/40">&copy; 2026 deep-ion</p>
        </div>
      </aside>
    </>
  )
}

export { Sidebar, MobileSidebar }
