import { useTranslation } from 'react-i18next'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'

function TenantsPage() {
  const { t } = useTranslation()

  return (
    <>
      <Header
        title={t('pages.tenants.title')}
        subtitle={t('pages.tenants.subtitle')}
      />
      <PageContainer>
        <div className="rounded-[var(--radius-lg)] bg-surface p-8 shadow-[var(--shadow-card)] border border-border">
          <p className="text-text-secondary text-sm">
            {t('pages.tenants.subtitle')}
          </p>
        </div>
      </PageContainer>
    </>
  )
}

export { TenantsPage }
