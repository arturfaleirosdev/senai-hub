import { ArrowRight, Bell, Bot, Briefcase, CalendarDays, Map, type LucideIcon } from 'lucide-react';

interface Service {
  title: string;
  description: string;
  metric: string;
  icon: LucideIcon;
  tone: string;
  /** Âncora na própria página; sem href = módulo ainda em construção. */
  href?: string;
}

interface QuickAccessProps {
  eventsThisWeek: number;
  unreadCount: number;
  openJobs: number;
}

export function QuickAccess({ eventsThisWeek, unreadCount, openJobs }: QuickAccessProps) {
  const services: Service[] = [
    {
      title: 'Meu Calendário',
      description: 'Aulas, provas, palestras e prazos, com lembretes.',
      metric: `${eventsThisWeek} ${eventsThisWeek === 1 ? 'evento' : 'eventos'} nos próximos 7 dias`,
      icon: CalendarDays,
      tone: 'bg-brand-700 text-white',
      href: '#eventos',
    },
    {
      title: 'Notificações',
      description: 'Avisos do campus, vagas e candidaturas em tempo real.',
      metric: unreadCount === 0 ? 'Tudo em dia' : `${unreadCount} não ${unreadCount === 1 ? 'lida' : 'lidas'}`,
      icon: Bell,
      tone: 'bg-accent-600 text-white',
      href: '#notificacoes',
    },
    {
      title: 'Vagas e estágios',
      description: 'Oportunidades compatíveis com o seu curso.',
      metric: `${openJobs} ${openJobs === 1 ? 'vaga aberta' : 'vagas abertas'}`,
      icon: Briefcase,
      tone: 'bg-emerald-600 text-white',
      href: '#vagas',
    },
    {
      title: 'Mapa do campus',
      description: 'Blocos, laboratórios, secretaria e acessibilidade.',
      metric: 'Mapa interativo',
      icon: Map,
      tone: 'bg-sky-600 text-white',
    },
    {
      title: 'Assistente IA',
      description: 'Pergunte sobre agenda, vagas e locais do campus.',
      metric: 'Tire dúvidas rápidas',
      icon: Bot,
      tone: 'bg-violet-600 text-white',
    },
  ];

  return (
    <section aria-labelledby="servicos-title" id="servicos" className="relative z-10 -mt-6 md:-mt-8">
      <h2 id="servicos-title" className="sr-only">
        Serviços do campus
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {services.map((service, index) => {
          const Icon = service.icon;
          const body = (
            <>
              <div className="flex items-start justify-between gap-2">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${service.tone}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                {service.href ? (
                  <ArrowRight
                    className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600"
                    aria-hidden="true"
                  />
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Em breve
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-display text-[15px] font-bold text-brand-950">{service.title}</h3>
              <p className="mt-1 hidden text-sm leading-snug text-slate-500 sm:block">{service.description}</p>
              <p className="mt-2 text-xs font-semibold text-brand-700">{service.metric}</p>
            </>
          );
          const base =
            'group flex h-full flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80';
          return (
            <li key={service.title} className={index === services.length - 1 ? 'col-span-2 sm:col-span-1' : ''}>
              {service.href ? (
                <a href={service.href} className={`${base} transition hover:-translate-y-0.5 hover:shadow-md hover:ring-brand-200`}>
                  {body}
                </a>
              ) : (
                <div className={base} aria-label={`${service.title}: em breve`}>
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
