import Hero from "@/components/landing/Hero";
import HistoriaSection from "@/components/landing/HistoriaSection";
import ExperienciaSection from "@/components/landing/ExperienciaSection";
import PropuestaSection from "@/components/landing/PropuestaSection";
import MenuDestacadosSection from "@/components/landing/MenuDestacadosSection";
import EspacioSection from "@/components/landing/EspacioSection";
import CTAFinalSection from "@/components/landing/CTAFinalSection";
import ContactForm from "@/components/landing/ContactForm";
import LanguageSwitcher from "@/components/landing/LanguageSwitcher";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useLocale } from "@/hooks/useLocale";

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
      />
    </svg>
  );
}

export default function LandingPage() {
  const { dark, toggle } = useDarkMode();
  const { t } = useLocale();

  return (
    <div>
      <LanguageSwitcher />

      <button
        onClick={toggle}
        aria-label="Alternar modo oscuro"
        className="fixed top-4 right-4 z-50 p-2 shadow-md transition-colors"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border)",
          color: "var(--muted)",
        }}
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>

      <Hero />
      <HistoriaSection />
      <ExperienciaSection />
      <PropuestaSection />
      <MenuDestacadosSection />
      <EspacioSection />
      <CTAFinalSection />
      <ContactForm />

      <footer
        className="py-8 text-center text-xs tracking-widest"
        style={{
          borderTop: "1px solid var(--border)",
          color: "var(--muted)",
          backgroundColor: "var(--bg)",
        }}
      >
        <p>© {new Date().getFullYear()} LITTLE CLAIRE BAKERY</p>
        <p className="mt-2 font-bold" style={{ color: "var(--subtle)" }}>
          {t.footer.codedBy}{" "}
          <a
            href="https://julian-caminaur.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer transition-all hover:brightness-[1.04]"
            style={{ color: "var(--muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            Caminaur
          </a>
        </p>
      </footer>
    </div>
  );
}
