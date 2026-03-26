import { useLocale } from '@/hooks/useLocale'
import { localeLabels, type Locale } from '@/i18n'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <select
      value={locale}
      onChange={e => setLocale(e.target.value as Locale)}
      aria-label="Seleccionar idioma"
      className="fixed top-4 left-4 z-50 text-xs tracking-widest px-2 py-2 shadow-md transition-colors cursor-pointer focus:outline-none"
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border)',
        color: 'var(--muted)',
      }}
    >
      {(Object.entries(localeLabels) as [Locale, string][]).map(([code, label]) => (
        <option key={code} value={code}>{label}</option>
      ))}
    </select>
  )
}
