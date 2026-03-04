import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, FileSearch, Building2, FolderKanban, Layers, Settings } from 'lucide-react'
import { cn } from '@shared/utils/cn'
import { ROUTES } from '@shared/constants/routes'

const navItems = [
  { key: 'dashboard', to: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { key: 'baDashboard', to: ROUTES.BA_DASHBOARD, icon: FileSearch },
  { key: 'tenants', to: ROUTES.TENANTS, icon: Building2 },
  { key: 'projects', to: ROUTES.PROJECTS, icon: FolderKanban },
  { key: 'blueprints', to: ROUTES.BLUEPRINTS, icon: Layers },
  { key: 'settings', to: ROUTES.SETTINGS, icon: Settings },
] as const

function BottomNav() {
  const { t } = useTranslation()

  return (
    <nav
      className={cn(
        'lg:hidden fixed bottom-0 inset-x-0 z-40',
        'bg-surface border-t border-border',
        'flex items-center justify-around',
        'h-16 px-2',
        'safe-area-inset-bottom',
      )}
      role="navigation"
      aria-label={t('nav.dashboard')}
    >
      {navItems.map(({ key, to, icon: Icon }) => (
        <NavLink
          key={key}
          to={to}
          end={to === ROUTES.DASHBOARD}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center',
              'gap-0.5 py-1 px-3 rounded-lg min-w-[64px]',
              'text-[11px] font-medium transition-colors duration-150',
              isActive
                ? 'text-primary'
                : 'text-text-muted hover:text-text-secondary',
            )
          }
        >
          <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>{t(`nav.${key}`)}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export { BottomNav }
