import { CalendarPlus, Clock, MapPin, Radio } from 'lucide-react';
import type { CampusEvent } from '../data/sample';
import { useNow } from '../hooks/useNow';
import { EVENT_CATEGORIES } from '../lib/categories';
import {
  formatCountdown,
  formatLongDate,
  formatTimeRange,
  greeting,
  relativeDayLabel,
} from '../lib/datetime';
import { downloadIcs } from '../lib/ics';

interface HeroProps {
  events: CampusEvent[];
}

export function Hero({ events }: HeroProps) {
  const now = useNow(1000);
  const next = events.find((e) => e.end.getTime() > now.getTime());
  const happening = next ? next.start.getTime() <= now.getTime() : false;

  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-brand-800 text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-brand-500/40 blur-3xl"
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-accent-600" />

      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-8 sm:px-6 md:grid-cols-[1.1fr_1fr] md:items-center md:pb-16 md:pt-12">
        <div>
          <p className="text-sm font-medium text-brand-100">{formatLongDate(now)}</p>
          <h1 id="hero-title" className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {greeting(now)}, estudante!
          </h1>
          <p className="mt-3 max-w-md text-base leading-relaxed text-brand-100">
            Agenda, avisos, vagas, mapa do campus e assistente: tudo o que você precisa no
            SENAI Taguatinga, em um só lugar.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#eventos"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-800 shadow-sm transition hover:bg-brand-50"
            >
              Ver minha agenda
            </a>
            <a
              href="#vagas"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
            >
              Vagas abertas
            </a>
          </div>
        </div>

        {next ? (
          <article
            aria-labelledby="next-event-title"
            className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur-sm sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-100">
                {happening ? 'Acontecendo agora' : 'Próximo evento'}
              </p>
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
                {EVENT_CATEGORIES[next.category].label}
              </span>
            </div>

            <h2 id="next-event-title" className="mt-3 font-display text-xl font-bold leading-snug">
              {next.title}
            </h2>

            <dl className="mt-3 space-y-1.5 text-sm text-brand-100">
              <div className="flex items-center gap-2">
                <dt className="sr-only">Quando</dt>
                <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                <dd>
                  {relativeDayLabel(next.start, now)} · {formatTimeRange(next.start, next.end)}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="sr-only">Onde</dt>
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                <dd>{next.location}</dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-white/15 pt-4">
              {happening ? (
                <p className="flex items-center gap-2 font-display text-lg font-bold">
                  <Radio className="h-5 w-5 animate-pulse text-accent-200" aria-hidden="true" />
                  Termina em <span className="tabular">{formatCountdown(next.end.getTime() - now.getTime())}</span>
                </p>
              ) : (
                <div>
                  <p className="text-xs font-medium text-brand-100">Começa em</p>
                  <p className="tabular font-display text-3xl font-extrabold tracking-tight">
                    {formatCountdown(next.start.getTime() - now.getTime())}
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={() => downloadIcs(next)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2 text-sm font-semibold ring-1 ring-white/25 transition hover:bg-white/25"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                Adicionar à agenda
              </button>
            </div>
          </article>
        ) : (
          <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/20">
            <p className="font-display text-lg font-bold">Nenhum evento à vista</p>
            <p className="mt-1 text-sm text-brand-100">Quando houver novidades no calendário, elas aparecem aqui.</p>
          </div>
        )}
      </div>
    </section>
  );
}
