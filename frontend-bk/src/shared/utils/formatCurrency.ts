export const formatCurrency = (value: number, locale = 'pt-BR'): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(value)