interface LogoProps {
  className?: string;
}

/** Monograma próprio do SmartCampus (não é o logo oficial do SENAI). */
export function LogoMark({ className = 'h-9 w-9' }: LogoProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="16" fill="currentColor" className="text-brand-700" />
      <path
        d="M41 21.5c-2.3-2.2-5.6-3.5-9.3-3.5-6 0-10.2 3.2-10.2 8 0 4.4 3.5 6.3 9.4 7.6 4.2.9 5.6 1.8 5.6 3.4 0 1.8-2 3-5 3-3.2 0-6-1.3-8-3.6L19 41.8c2.8 3 7 4.7 11.9 4.7 6.6 0 11.1-3.3 11.1-8.5 0-4.7-3.4-6.7-9.8-8-3.9-.8-5.2-1.6-5.2-3 0-1.6 1.7-2.6 4.3-2.6 2.5 0 4.7.9 6.4 2.5z"
        fill="#fff"
      />
      <circle cx="47" cy="17" r="5" fill="#e30613" />
    </svg>
  );
}

export function Logo() {
  return (
    <a href="#inicio" className="flex items-center gap-2.5 rounded-lg" aria-label="SmartCampus SENAI Taguatinga, início">
      <LogoMark />
      <span className="leading-tight">
        <span className="block font-display text-[15px] font-extrabold tracking-tight text-brand-900">
          SmartCampus
        </span>
        <span className="block whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-600 sm:text-[11px] sm:tracking-[0.14em]">
          SENAI Taguatinga
        </span>
      </span>
    </a>
  );
}
