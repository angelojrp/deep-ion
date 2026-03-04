import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

export const useTenant = (): { tenantSlug: string } => {
  const { tenant } = useParams()
  return useMemo(() => ({ tenantSlug: tenant ?? '' }), [tenant])
}