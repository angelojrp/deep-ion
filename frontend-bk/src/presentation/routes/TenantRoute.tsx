import { Outlet, useParams } from 'react-router-dom'
import { useTenantContextStore } from '@application/stores/tenantContextStore'
import { useEffect } from 'react'

export const TenantRoute = (): JSX.Element => {
  const { tenant } = useParams()
  const setActiveTenantSlug = useTenantContextStore((state) => state.setActiveTenantSlug)

  useEffect(() => {
    setActiveTenantSlug(tenant ?? null)
  }, [setActiveTenantSlug, tenant])

  return <Outlet />
}