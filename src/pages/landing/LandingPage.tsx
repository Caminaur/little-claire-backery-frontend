import Hero from '@/components/landing/Hero'
import ContactForm from '@/components/landing/ContactForm'
import { useDarkMode } from '@/hooks/useDarkMode'

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  )
}

export default function LandingPage() {
  const { dark, toggle } = useDarkMode()

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 transition-colors duration-200">
      <button
        onClick={toggle}
        aria-label="Alternar modo oscuro"
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors shadow-md"
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>
      <Hero />
      <ContactForm />
      <footer className="py-8 text-center text-sm text-gray-400 dark:text-stone-500 border-t border-gray-100 dark:border-stone-800">
        © {new Date().getFullYear()} Little Claire Bakery
      </footer>
    </div>
  )
}
