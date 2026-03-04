import { useQuery } from '@tanstack/react-query'
import { tenantAdapter } from '@infrastructure/api/adapters/tenantAdapter'
import { queryKeys } from '@infrastructure/http/queryKeys'

export const useTenants = () =>
  useQuery({
    queryKey: queryKeys.tenants,
    queryFn: tenantAdapter.list
  })