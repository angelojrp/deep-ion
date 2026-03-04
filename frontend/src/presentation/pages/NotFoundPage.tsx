import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@shared/constants/routes'

function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-xl font-semibold text-text mb-2">
        {t('pages.notFound.title')}
      </h2>
      <p className="text-text-muted mb-8 max-w-md">
        {t('pages.notFound.description')}
      </p>
      <Link
        to={ROUTES.DASHBOARD}
        className="inline-flex items-center px-4 py-2 rounded-[var(--radius-md)] bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
      >
        {t('pages.notFound.backHome')}
      </Link>
    </div>
  )
}

export { NotFoundPage }
