import logoUrl from '../assets/logo-senai-hub.png';

interface LogoProps {
  className?: string;
}

/** Logo do SENAI Hub (arquivo em src/assets/logo-senai-hub.png). */
export function LogoMark({ className = 'h-10 w-10' }: LogoProps) {
  return <img src={logoUrl} alt="" aria-hidden="true" className={`${className} object-contain`} width={160} height={160} />;
}

export function Logo() {
  return (
    <a href="#inicio" className="flex items-center gap-2 rounded-lg" aria-label="SENAI Hub Taguatinga, início">
      <LogoMark className="h-11 w-11" />
      <span className="leading-tight">
        <span className="block font-display text-[15px] font-extrabold tracking-tight text-brand-900">
          SENAI <span className="text-accent-600">Hub</span>
        </span>
        <span className="block whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-600 sm:text-[11px] sm:tracking-[0.14em]">
          Taguatinga
        </span>
      </span>
    </a>
  );
}
