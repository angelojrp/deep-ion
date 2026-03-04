import { useParams } from 'react-router-dom'
import { usePendingGates } from '@application/hooks/usePendingGates'
import { ClassificationBadge } from '@presentation/components/ui/ClassificationBadge'

export const TenantHomePage = (): JSX.Element => {
  const { tenant = '' } = useParams()
  const { data } = usePendingGates(tenant)

  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Tenant {tenant}</h2>
      <ul className="space-y-2">
        {data?.map((item) => (
          <li className="rounded border p-3" key={item.id}>
            <div className="mb-2">{item.summary}</div>
            <ClassificationBadge value={item.classification} />
          </li>
        ))}
      </ul>
    </section>
  )
}