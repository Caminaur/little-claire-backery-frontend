import es from './es'
import en from './en'
import de from './de'
import ja from './ja'
import ko from './ko'
import zh from './zh'

export const locales = { es, en, de, ja, ko, zh } as const
export type Locale = keyof typeof locales
export type Translations = typeof es
export const defaultLocale: Locale = 'es'

export const localeLabels: Record<Locale, string> = {
  es: 'ES',
  en: 'EN',
  de: 'DE',
  ja: 'JA',
  ko: 'KO',
  zh: 'ZH',
}
