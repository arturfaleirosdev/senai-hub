import { CalendarPlus, MapPin, Users } from 'lucide-react';
import type { CampusEvent } from '../data/sample';
import { useNow } from '../hooks/useNow';
import { EVENT_CATEGORIES } from '../lib/categories';
import { dayKey, formatTimeRange, relativeDayLabel } from '../lib/datetime';
import { downloadIcs } from '../lib/ics';
import { SectionHeader } from './SectionHeader';

interface UpcomingEventsProps {
  events: CampusEvent[];
  limit?: number;
}

export function UpcomingEvents({ events, limit = 6 }: UpcomingEventsProps) {
  const now = useNow(30_000);
  const upcoming = events.filter((e) => e.end.getTime() > now.getTime()).slice(0, limit);

  const groups: { key: string; label: string; items: CampusEvent[] }[] = [];
  for (const event of upcoming) {
    const key = dayKey(event.start);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(event);
    else groups.push({ key, label: relativeDayLabel(event.start, now), items: [event] });
  }

  return (
    <section aria-labelledby="eventos-title" id="eventos">
      <SectionHeader id="eventos-title" eyebrow="Meu Calendário" title="Próximos eventos" />

      {groups.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-200">
          Nenhum evento programado por enquanto.
        </p>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.key}>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                {group.label}
                {group.label === 'Hoje' && <span className="h-1.5 w-1.5 rounded-full bg-accent-600" aria-hidden="true" />}
              </h3>
              <ul className="space-y-2.5">
                {group.items.map((event) => {
                  const meta = EVENT_CATEGORIES[event.category];
                  const Icon = meta.icon;
                  const live = event.start.getTime() <= now.getTime();
                  return (
                    <li
                      key={event.id}
                      className="flex gap-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200/80 sm:gap-4 sm:p-4"
                    >
                      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ${meta.tone}`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold">
                          <span className="tabular text-brand-700">{formatTimeRange(event.start, event.end)}</span>
                          <span className="text-slate-300" aria-hidden="true">•</span>
                          <span className="text-slate-500">{meta.label}</span>
                          {live && (
                            <span className="rounded-full bg-accent-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              Agora
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-semibold leading-snug text-brand-950">{event.title}</p>
                        <div className="mt-1.5 flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:gap-4">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {event.audience}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => downloadIcs(event)}
                        className="grid h-10 w-10 shrink-0 place-items-center self-center rounded-xl text-slate-500 ring-1 ring-slate-200 transition hover:bg-brand-50 hover:text-brand-700"
                        aria-label={`Adicionar "${event.title}" à agenda (.ics)`}
                        title="Adicionar à agenda (.ics)"
                      >
                        <CalendarPlus className="h-4.5 w-4.5" aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
