import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export const LandingPage = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">{t('landing.title')}</h1>
      <p>{t('landing.subtitle')}</p>
      <Link className="rounded bg-primary px-3 py-2 text-white" to="/admin">
        Entrar
      </Link>
    </section>
  )
}