export const formatDate = (value: string, locale = 'pt-BR'): string =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))