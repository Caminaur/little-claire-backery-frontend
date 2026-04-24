import { useState, useRef, useEffect } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  startHour?: number
  endHour?: number
  step?: number
  hasError?: boolean
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function generateSlots(start: number, end: number, step: number): string[] {
  const slots: string[] = []
  for (let h = start; h <= end; h++) {
    for (let m = 0; m < 60; m += step) {
      if (h === end && m > 0) break
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
}

export default function TimePicker({
  value,
  onChange,
  placeholder,
  startHour = 7,
  endHour = 22,
  step = 5,
  hasError,
}: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)

  const slots = generateSlots(startHour, endHour, step)

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  // Scroll selected slot into view when dropdown opens
  useEffect(() => {
    if (open && selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'center', behavior: 'instant' })
    }
  }, [open])

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
          color: value ? 'var(--coffee)' : 'var(--muted)',
        }}
      >
        <span>{value || placeholder}</span>
        <span style={{ color: 'var(--muted)' }}><ClockIcon /></span>
      </button>

      {/* Dropdown list */}
      {open && (
        <div
          className="absolute z-50 mt-1 w-full shadow-lg overflow-y-auto"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
            maxHeight: '200px',
          }}
        >
          {slots.map(slot => {
            const isSelected = slot === value
            return (
              <button
                key={slot}
                ref={isSelected ? selectedRef : undefined}
                type="button"
                onClick={() => { onChange(slot); setOpen(false) }}
                className="w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer"
                style={{
                  backgroundColor: isSelected ? 'var(--gold)' : 'transparent',
                  color: isSelected ? '#fff' : 'var(--coffee)',
                }}
                onMouseEnter={e => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-alt)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = isSelected ? 'var(--gold)' : 'transparent'
                }}
              >
                {slot}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
