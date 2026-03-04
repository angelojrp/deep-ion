import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LayoutState {
  /** Sidebar collapsed (icon-only mode) on desktop */
  sidebarCollapsed: boolean
  /** Mobile sidebar open as overlay */
  mobileSidebarOpen: boolean
  /** Dark mode enabled */
  darkMode: boolean
  /** Toggle sidebar collapse on desktop */
  toggleSidebar: () => void
  /** Set sidebar collapsed state */
  setSidebarCollapsed: (collapsed: boolean) => void
  /** Open/close mobile sidebar overlay */
  setMobileSidebarOpen: (open: boolean) => void
  /** Toggle dark mode */
  toggleDarkMode: () => void
  /** Set dark mode */
  setDarkMode: (enabled: boolean) => void
}

const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      darkMode: false,

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      setMobileSidebarOpen: (open) =>
        set({ mobileSidebarOpen: open }),

      toggleDarkMode: () =>
        set((state) => {
          const next = !state.darkMode
          if (next) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          return { darkMode: next }
        }),

      setDarkMode: (enabled) =>
        set(() => {
          if (enabled) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          return { darkMode: enabled }
        }),
    }),
    {
      name: 'deep-ion-layout',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        darkMode: state.darkMode,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply dark mode class on hydration
        if (state?.darkMode) {
          document.documentElement.classList.add('dark')
        }
      },
    },
  ),
)

export { useLayoutStore }
export type { LayoutState }
