import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ptBr from './pt-BR.json'
import en from './en.json'

void i18n.use(initReactI18next).init({
  lng: 'pt-BR',
  fallbackLng: 'pt-BR',
  resources: {
    'pt-BR': { translation: ptBr },
    en: { translation: en }
  },
  interpolation: {
    escapeValue: false
  }
})

export { i18n }