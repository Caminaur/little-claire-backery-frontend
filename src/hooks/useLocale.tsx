import { createContext, useContext, useState, type ReactNode } from 'react'
import { locales, defaultLocale, type Locale, type Translations } from '@/i18n'

type LocaleContextType = {
  locale: Locale
  t: Translations
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('locale') as Locale
    return saved && saved in locales ? saved : defaultLocale
  })

  function setLocale(l: Locale) {
    setLocaleState(l)
    localStorage.setItem('locale', l)
  }

  return (
    <LocaleContext.Provider value={{ locale, t: locales[locale], setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
