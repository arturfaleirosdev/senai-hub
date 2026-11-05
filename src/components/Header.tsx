import { Bell } from 'lucide-react';
import { useNow } from '../hooks/useNow';
import { formatClock, zonedParts } from '../lib/datetime';
import { Logo } from './Logo';

const NAV = [
  { href: '#servicos', label: 'Serviços' },
  { href: '#eventos', label: 'Próximos eventos' },
  { href: '#notificacoes', label: 'Notificações' },
  { href: '#vagas', label: 'Vagas' },
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function LiveClock() {
  const now = useNow(1000);
  const p = zonedParts(now);
  const weekday = WEEKDAYS[new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay()];
  return (
    <div className="text-right leading-tight" aria-label="Data e hora atuais em Brasília">
      <time
        dateTime={now.toISOString()}
        className="tabular block font-display text-base font-bold text-brand-900 sm:text-lg"
        aria-hidden="true"
      >
        {formatClock(now)}
      </time>
      <span className="block whitespace-nowrap text-[11px] font-medium text-slate-500" aria-hidden="true">
        {weekday}, {p.day} {MONTHS[p.month - 1]}
        <span className="hidden sm:inline"> · Brasília</span>
      </span>
    </div>
  );
}

interface HeaderProps {
  unreadCount: number;
}

export function Header({ unreadCount }: HeaderProps) {
  const bellLabel =
    unreadCount === 0
      ? 'Notificações: nenhuma não lida'
      : `Notificações: ${unreadCount} não ${unreadCount === 1 ? 'lida' : 'lidas'}`;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Seções da página" className="ml-6 hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-800"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          <LiveClock />
          <a
            href="#notificacoes"
            aria-label={bellLabel}
            className="relative grid h-10 w-10 place-items-center rounded-full text-brand-800 ring-1 ring-slate-200 transition hover:bg-brand-50"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="tabular absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent-600 px-1 text-[11px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </a>
        </div>
      </div>
    </header>
  );
}
