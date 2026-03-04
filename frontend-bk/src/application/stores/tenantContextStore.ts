import { create } from 'zustand'

interface TenantContextState {
  activeTenantSlug: string | null
  setActiveTenantSlug: (slug: string | null) => void
}

export const useTenantContextStore = create<TenantContextState>((set) => ({
  activeTenantSlug: null,
  setActiveTenantSlug: (slug) => set({ activeTenantSlug: slug })
}))