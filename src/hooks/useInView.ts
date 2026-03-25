import { useEffect, useRef } from 'react'

/**
 * Attaches an IntersectionObserver to the returned ref.
 * Adds "in-view" when the element enters the viewport and
 * removes it when it leaves, so CSS transitions play in both directions.
 */
export function useInView(options?: IntersectionObserverInit) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null)

  useEffect(() => {
    const el = ref.current as Element | null
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view')
        } else {
          el.classList.remove('in-view')
        }
      },
      { threshold: 0.1, ...options },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}
