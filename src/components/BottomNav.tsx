import { Bell, Briefcase, CalendarDays, Home } from 'lucide-react';

interface BottomNavProps {
  unreadCount: number;
}

/** Navegação inferior para celular (some em telas grandes). */
export function BottomNav({ unreadCount }: BottomNavProps) {
  const items = [
    { href: '#inicio', label: 'Início', icon: Home },
    { href: '#eventos', label: 'Agenda', icon: CalendarDays },
    { href: '#notificacoes', label: 'Avisos', icon: Bell, badge: unreadCount },
    { href: '#vagas', label: 'Vagas', icon: Briefcase },
  ];
  return (
    <nav
      aria-label="Navegação rápida"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ href, label, icon: Icon, badge }) => (
          <li key={href}>
            <a
              href={href}
              className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold text-slate-500 transition hover:text-brand-700"
            >
              <span className="relative">
                <Icon className="h-5 w-5" aria-hidden="true" />
                {badge ? (
                  <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent-600 px-1 text-[9px] font-bold text-white">
                    <span className="sr-only">, não lidas: </span>
                    {badge > 9 ? '9+' : badge}
                  </span>
                ) : null}
              </span>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
