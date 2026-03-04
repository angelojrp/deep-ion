export interface Tenant {
  id: string
  slug: string
  name: string
  status: 'active' | 'suspended'
  plan: 'starter' | 'pro' | 'enterprise'
  createdAt: string
}