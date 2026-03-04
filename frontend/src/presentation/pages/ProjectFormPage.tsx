import { useTranslation } from 'react-i18next'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import { ProjectForm } from '@presentation/components/projects'

function ProjectFormPage() {
  const { t } = useTranslation()

  return (
    <>
      <Header
        title={t('projectsPage.form.createTitle')}
        subtitle={t('projectsPage.form.createSubtitle')}
      />
      <PageContainer>
        <ProjectForm mode="create" />
      </PageContainer>
    </>
  )
}

export { ProjectFormPage }
