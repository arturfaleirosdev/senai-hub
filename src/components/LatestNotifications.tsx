import { CheckCheck } from 'lucide-react';
import { useState } from 'react';
import type { CampusNotification, NotificationCategory } from '../data/sample';
import { useNow } from '../hooks/useNow';
import { NOTIFICATION_CATEGORIES } from '../lib/categories';
import { formatRelativePast } from '../lib/datetime';
import { SectionHeader } from './SectionHeader';

interface LatestNotificationsProps {
  notifications: CampusNotification[];
  isRead: (id: string) => boolean;
  markRead: (id: string, read?: boolean) => void;
  markAllRead: () => void;
  unreadCount: number;
}

type Filter = 'todas' | NotificationCategory;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'avisos', label: 'Avisos' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'vagas', label: 'Vagas' },
  { value: 'candidaturas', label: 'Candidaturas' },
];

export function LatestNotifications({
  notifications,
  isRead,
  markRead,
  markAllRead,
  unreadCount,
}: LatestNotificationsProps) {
  const now = useNow(60_000);
  const [filter, setFilter] = useState<Filter>('todas');
  const visible = notifications.filter((n) => filter === 'todas' || n.category === filter);

  return (
    <section aria-labelledby="notificacoes-title" id="notificacoes">
      <SectionHeader
        id="notificacoes-title"
        eyebrow="Notificações"
        title="Últimas notificações"
        action={
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Marcar todas como lidas
          </button>
        }
      />

      <div role="group" aria-label="Filtrar por categoria" className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition ${
              filter === f.value
                ? 'bg-brand-800 text-white ring-brand-800'
                : 'bg-white text-slate-600 ring-slate-200 hover:ring-brand-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
        {visible.length === 0 && (
          <li className="p-6 text-center text-sm text-slate-500">Nenhuma notificação nesta categoria.</li>
        )}
        {visible.map((n) => {
          const meta = NOTIFICATION_CATEGORIES[n.category];
          const Icon = meta.icon;
          const read = isRead(n.id);
          return (
            <li key={n.id} className={read ? '' : 'bg-brand-50/60'}>
              <button
                type="button"
                onClick={() => markRead(n.id, !read)}
                className="flex w-full gap-3 p-4 text-left transition hover:bg-slate-50"
                aria-label={`${n.title}. ${read ? 'Lida' : 'Não lida'}. Clique para marcar como ${read ? 'não lida' : 'lida'}.`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1 ${meta.tone}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className={`leading-snug text-brand-950 ${read ? 'font-medium' : 'font-bold'}`}>{n.title}</span>
                    {!read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-600" aria-hidden="true" />}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-slate-600">{n.body}</span>
                  <span className="mt-1.5 block text-xs text-slate-400">
                    {meta.label} · {formatRelativePast(n.createdAt, now)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
