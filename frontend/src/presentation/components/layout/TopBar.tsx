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
  Check,
} from 'lucide-react'
import { cn } from '@shared/utils/cn'
import { useLayoutStore } from '@application/stores/useLayoutStore'
import { ROUTES } from '@shared/constants/routes'
import { SUPPORTED_LANGUAGES, normalizeLanguageTag, type SupportedLanguage } from '@shared/i18n/index'

function FlagBR({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="480" fill="#009b3a" />
      <polygon points="320,39.6 588,240 320,440.4 52,240" fill="#fedf00" />
      <circle cx="320" cy="240" r="115" fill="#002776" />
      <path d="M195,240 Q320,160 445,240 Q320,200 195,240Z" fill="#fff" />
    </svg>
  )
}

function FlagUS({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="480" fill="#fff" />
      <g fill="#b22234">
        {[0, 2, 4, 6, 8, 10, 12].map((i) => (
          <rect key={i} y={i * 36.92} width="640" height="36.92" />
        ))}
      </g>
      <rect width="256" height="258.5" fill="#3c3b6e" />
      <g fill="#fff" fontSize="20" fontFamily="serif">
        {[
          [20,20],[60,20],[100,20],[140,20],[180,20],[220,20],
          [40,42],[80,42],[120,42],[160,42],[200,42],
          [20,64],[60,64],[100,64],[140,64],[180,64],[220,64],
          [40,86],[80,86],[120,86],[160,86],[200,86],
          [20,108],[60,108],[100,108],[140,108],[180,108],[220,108],
          [40,130],[80,130],[120,130],[160,130],[200,130],
          [20,152],[60,152],[100,152],[140,152],[180,152],[220,152],
          [40,174],[80,174],[120,174],[160,174],[200,174],
          [20,196],[60,196],[100,196],[140,196],[180,196],[220,196],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="6" />
        ))}
      </g>
    </svg>
  )
}

function FlagDE({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="160" fill="#000" />
      <rect y="160" width="640" height="160" fill="#d00" />
      <rect y="320" width="640" height="160" fill="#ffce00" />
    </svg>
  )
}

function FlagES({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="480" fill="#c60b1e" />
      <rect y="120" width="640" height="240" fill="#ffc400" />
    </svg>
  )
}

function FlagFR({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="213.3" height="480" fill="#002395" />
      <rect x="213.3" width="213.4" height="480" fill="#fff" />
      <rect x="426.7" width="213.3" height="480" fill="#ed2939" />
    </svg>
  )
}

const LANGUAGE_FLAGS: Record<SupportedLanguage, ({ className }: { className?: string }) => JSX.Element> = {
  'pt-BR': FlagBR,
  en: FlagUS,
  de: FlagDE,
  es: FlagES,
  fr: FlagFR,
}

interface HeaderProps {
  title?: string
  subtitle?: string
}

function Header({ title, subtitle }: HeaderProps) {
  const { t, i18n } = useTranslation()
  const darkMode = useLayoutStore((s) => s.darkMode)
  const toggleDarkMode = useLayoutStore((s) => s.toggleDarkMode)
  const setMobileSidebarOpen = useLayoutStore((s) => s.setMobileSidebarOpen)

  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const langRef = useRef<HTMLDivElement>(null)
  const currentLanguage = normalizeLanguageTag(i18n.resolvedLanguage ?? i18n.language)

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
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
        setLangOpen(false)
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

          {/* Language switcher */}
          <div ref={langRef} className="relative">
            <button
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className={cn(
                'flex items-center justify-center',
                'w-9 h-9 rounded-lg',
                'hover:bg-bg transition-colors',
              )}
              aria-label={t('header.changeLanguage')}
              aria-expanded={langOpen}
              aria-haspopup="true"
            >
              {(() => { const Flag = LANGUAGE_FLAGS[currentLanguage]; return <Flag className="w-5 h-5 rounded-sm" />; })()}
            </button>

            {langOpen && (
              <div
                className={cn(
                  'absolute right-0 mt-2 w-48',
                  'bg-surface border border-border rounded-xl',
                  'shadow-[var(--shadow-dropdown)]',
                  'py-1.5 z-50',
                  'animate-in fade-in slide-in-from-top-2 duration-150',
                )}
                role="menu"
              >
                {SUPPORTED_LANGUAGES.map((lng) => (
                  <button
                    key={lng}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      i18n.changeLanguage(lng)
                      setLangOpen(false)
                    }}
                    className={cn(
                      'flex items-center justify-between w-full px-4 py-2 text-sm',
                      'hover:bg-bg transition-colors',
                      currentLanguage === lng
                        ? 'text-primary font-medium'
                        : 'text-text-secondary',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {(() => { const Flag = LANGUAGE_FLAGS[lng]; return <Flag className="w-5 h-5 rounded-sm" />; })()}
                      {t(`header.languages.${lng}`)}
                    </span>
                    {currentLanguage === lng && (
                      <Check className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

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
