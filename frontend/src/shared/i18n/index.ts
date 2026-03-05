import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import ptBRCommon from './locales/pt-BR/common.json'
import enCommon from './locales/en/common.json'
import deCommon from './locales/de/common.json'
import esCommon from './locales/es/common.json'
import frCommon from './locales/fr/common.json'

const resources = {
  'pt-BR': { common: ptBRCommon },
  en: { common: enCommon },
  de: { common: deCommon },
  es: { common: esCommon },
  fr: { common: frCommon },
} as const

const SUPPORTED_LANGUAGES = Object.keys(resources) as Array<keyof typeof resources>
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

function normalizeLanguageTag(language: string): SupportedLanguage {
  if (SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)) {
    return language as SupportedLanguage
  }

  const normalizedInput = language.toLowerCase()
  const match = SUPPORTED_LANGUAGES.find((locale) => {
    const normalizedLocale = locale.toLowerCase()
    return (
      normalizedInput.startsWith(`${normalizedLocale}-`) ||
      normalizedLocale.startsWith(`${normalizedInput}-`)
    )
  })

  return match ?? 'pt-BR'
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    defaultNS: 'common',
    ns: ['common'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['navigator', 'htmlTag'],
      caches: [],
    },
  })

export { i18n, SUPPORTED_LANGUAGES, normalizeLanguageTag }
export type { SupportedLanguage }
