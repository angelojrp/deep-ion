import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Search,
  Sun,
  Moon,
  Bell,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@shared/utils/cn'
import { useLayoutStore } from '@application/stores/useLayoutStore'
import { ROUTES } from '@shared/constants/routes'

interface HeaderProps {
  title?: string
  subtitle?: string
}

function Header({ title, subtitle }: HeaderProps) {
  const { t } = useTranslation()
  const darkMode = useLayoutStore((s) => s.darkMode)
  const toggleDarkMode = useLayoutStore((s) => s.toggleDarkMode)
  const setMobileSidebarOpen = useLayoutStore((s) => s.setMobileSidebarOpen)

  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setProfileOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-30',
        'bg-surface border-b border-border',
        'px-4 sm:px-6',
        'h-[72px] flex items-center',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
      )}
    >
      <div className="flex items-center justify-between w-full gap-4">
        {/* Left: Hamburger (mobile) + page title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className={cn(
              'lg:hidden flex items-center justify-center',
              'w-9 h-9 rounded-lg',
              'hover:bg-bg transition-colors',
            )}
            aria-label={t('header.toggleSidebar')}
          >
            <Menu className="w-5 h-5 text-text-secondary" />
          </button>

          {/* Page title (visible when search is closed) */}
          {title && !searchOpen && (
            <div className="hidden sm:block min-w-0">
              <h1 className="text-base font-semibold text-text truncate">{title}</h1>
              {subtitle && (
                <p className="text-xs text-text-muted truncate">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Center: Search bar */}
        <div className={cn(
          'flex-1 max-w-xl',
          searchOpen ? 'block' : 'hidden sm:block',
        )}>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder={t('header.searchPlaceholder')}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              className={cn(
                'w-full h-10 pl-9 pr-16 rounded-lg',
                'bg-bg border border-border',
                'text-sm text-text placeholder:text-text-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                'transition-all duration-150',
              )}
              aria-label={t('common.search')}
            />
            <span
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'hidden sm:inline-flex items-center gap-0.5',
                'px-1.5 py-0.5 rounded text-[10px] font-medium',
                'bg-border text-text-muted',
              )}
              aria-hidden="true"
            >
              ⌘K
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Search toggle (mobile) */}
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className={cn(
              'sm:hidden flex items-center justify-center',
              'w-9 h-9 rounded-lg',
              'hover:bg-bg transition-colors',
            )}
            aria-label={t('common.search')}
          >
            <Search className="w-5 h-5 text-text-secondary" />
          </button>

          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className={cn(
              'flex items-center justify-center',
              'w-9 h-9 rounded-lg',
              'hover:bg-bg transition-colors',
            )}
            aria-label={t('header.toggleDarkMode')}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-warning" />
            ) : (
              <Moon className="w-5 h-5 text-text-secondary" />
            )}
          </button>

          {/* Notifications */}
          <button
            type="button"
            className={cn(
              'relative flex items-center justify-center',
              'w-9 h-9 rounded-lg',
              'hover:bg-bg transition-colors',
            )}
            aria-label={t('header.notifications')}
          >
            <Bell className="w-5 h-5 text-text-secondary" />
            {/* Notification badge */}
            <span
              className={cn(
                'absolute top-1.5 right-1.5',
                'w-2 h-2 rounded-full bg-error',
                'ring-2 ring-surface',
              )}
              aria-label={t('header.newNotifications')}
            />
          </button>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-border mx-1" aria-hidden="true" />

          {/* User profile dropdown */}
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className={cn(
                'flex items-center gap-2 rounded-lg p-1.5',
                'hover:bg-bg transition-colors',
              )}
              aria-expanded={profileOpen}
              aria-haspopup="true"
              aria-label={t('header.userMenu')}
            >
              {/* Avatar */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full',
                  'bg-primary/10 flex items-center justify-center',
                  'ring-2 ring-primary/20',
                )}
              >
                <span className="text-xs font-semibold text-primary">AO</span>
              </div>

              {/* Name (desktop only) */}
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-sm font-medium text-text leading-tight truncate">
                  Angelo Oliveira
                </p>
                <p className="text-xs text-text-muted leading-tight truncate">
                  {t('header.role')}
                </p>
              </div>

              <ChevronDown
                className={cn(
                  'hidden sm:block w-4 h-4 text-text-muted transition-transform',
                  profileOpen && 'rotate-180',
                )}
                aria-hidden="true"
              />
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div
                className={cn(
                  'absolute right-0 mt-2 w-56',
                  'bg-surface border border-border rounded-xl',
                  'shadow-[var(--shadow-dropdown)]',
                  'py-1.5 z-50',
                  'animate-in fade-in slide-in-from-top-2 duration-150',
                )}
                role="menu"
              >
                {/* Profile info in dropdown */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-text">Angelo Oliveira</p>
                  <p className="text-xs text-text-muted truncate">angelo@deep-ion.io</p>
                </div>

                <div className="py-1.5">
                  <Link
                    to={ROUTES.PROFILE}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-text-secondary hover:bg-bg transition-colors"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User className="w-4 h-4" aria-hidden="true" />
                    {t('header.profile')}
                  </Link>
                  <button
                    type="button"
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-text-secondary hover:bg-bg transition-colors"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4" aria-hidden="true" />
                    {t('nav.settings')}
                  </button>
                </div>

                <div className="border-t border-border pt-1.5">
                  <button
                    type="button"
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-error hover:bg-error-light transition-colors"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    {t('header.logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export { Header }
export type { HeaderProps }

/* Backwards compatibility */
type TopBarProps = HeaderProps
const TopBar = Header
export { TopBar }
export type { TopBarProps }
