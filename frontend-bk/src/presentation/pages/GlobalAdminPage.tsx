import { useTenants } from '@application/hooks/useTenants'

export const GlobalAdminPage = (): JSX.Element => {
  const { data, isLoading } = useTenants()

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Global Admin</h2>
      <ul className="space-y-2">
        {data?.map((tenant) => (
          <li className="rounded border p-3" key={tenant.id}>
            {tenant.name} ({tenant.slug})
          </li>
        ))}
      </ul>
    </section>
  )
}