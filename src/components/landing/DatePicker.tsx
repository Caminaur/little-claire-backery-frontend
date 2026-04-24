import { useState, useRef, useEffect } from 'react'
import { useLocale } from '@/hooks/useLocale'

interface Props {
  value: string
  onChange: (v: string) => void
  min?: string
  placeholder?: string
  hasError?: boolean
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  )
}

// Reference Monday: Jan 6 2025 is a Monday
const MONDAY_REF = new Date(2025, 0, 6)

function getDayNames(locale: string): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(MONDAY_REF)
    d.setDate(MONDAY_REF.getDate() + i)
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d)
  })
}

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseISO(iso: string): Date {
  // Parse without timezone shift
  return new Date(iso + 'T00:00:00')
}

export default function DatePicker({ value, onChange, min, placeholder, hasError }: Props) {
  const { locale } = useLocale()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const minDate = min ? parseISO(min) : today

  const initialDate = value ? parseISO(value) : today

  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(initialDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth())
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync view when value changes externally
  useEffect(() => {
    if (value) {
      const d = parseISO(value)
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
    }
  }, [value])

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  const atMinMonth =
    viewYear < minDate.getFullYear() ||
    (viewYear === minDate.getFullYear() && viewMonth <= minDate.getMonth())

  function prevMonth() {
    if (atMinMonth) return
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  function selectDay(day: number) {
    const d = new Date(viewYear, viewMonth, day)
    d.setHours(0, 0, 0, 0)
    if (d < minDate) return
    onChange(toISO(viewYear, viewMonth, day))
    setOpen(false)
  }

  // Build calendar grid (Monday-first)
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array<null>(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const dayNames = getDayNames(locale)
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(viewYear, viewMonth)
  )
  const displayValue = value
    ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(parseISO(value))
    : ''

  const borderColor = hasError ? '#ef4444' : 'var(--border)'

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full border px-3 py-2.5 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-1 transition-colors cursor-pointer"
        style={{
          borderColor,
          backgroundColor: 'var(--card-bg)',
          color: displayValue ? 'var(--coffee)' : 'var(--muted)',
        }}
      >
        <span className="truncate">{displayValue || placeholder}</span>
        <span style={{ color: 'var(--muted)' }}><CalendarIcon /></span>
      </button>

      {/* Calendar popup */}
      {open && (
        <div
          className="absolute z-50 mt-1 shadow-lg"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
            minWidth: '280px',
            width: '100%',
          }}
        >
          {/* Month navigation */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <button
              type="button"
              onClick={prevMonth}
              disabled={atMinMonth}
              className="p-1 transition-opacity"
              style={{ color: 'var(--muted)', opacity: atMinMonth ? 0.3 : 1, cursor: atMinMonth ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft />
            </button>
            <span
              className="text-xs tracking-widest font-medium capitalize"
              style={{ color: 'var(--coffee)' }}
            >
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 cursor-pointer"
              style={{ color: 'var(--muted)' }}
            >
              <ChevronRight />
            </button>
          </div>

          {/* Day name headers */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {dayNames.map((name, i) => (
              <div
                key={i}
                className="text-center text-[10px] tracking-wide pb-1"
                style={{ color: 'var(--muted)' }}
              >
                {name.slice(0, 2).toUpperCase()}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
            {cells.map((day, idx) => {
              if (day === null) return <div key={idx} />

              const cellDate = new Date(viewYear, viewMonth, day)
              cellDate.setHours(0, 0, 0, 0)
              const isDisabled = cellDate < minDate
              const isToday = cellDate.toDateString() === today.toDateString()
              const iso = toISO(viewYear, viewMonth, day)
              const isSelected = iso === value

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => !isDisabled && selectDay(day)}
                  className="text-center text-sm py-1.5 transition-colors rounded-sm"
                  style={{
                    color: isDisabled
                      ? 'var(--border)'
                      : isSelected
                        ? '#fff'
                        : 'var(--coffee)',
                    backgroundColor: isSelected ? 'var(--gold)' : 'transparent',
                    outline: isToday && !isSelected ? '1px solid var(--gold)' : 'none',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={e => {
                    if (!isDisabled && !isSelected)
                      e.currentTarget.style.backgroundColor = 'var(--bg-alt)'
                  }}
                  onMouseLeave={e => {
                    if (!isSelected)
                      e.currentTarget.style.backgroundColor = isSelected ? 'var(--gold)' : 'transparent'
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
