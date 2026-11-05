import { useCallback, useMemo, useState } from 'react';
import type { CampusNotification } from '../data/sample';

const STORAGE_KEY = 'smartcampus:notificacoes-lidas';

function loadStored(): Record<string, boolean> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : null;
  } catch {
    return null;
  }
}

function save(state: Record<string, boolean>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Navegação anônima ou armazenamento bloqueado: segue só em memória.
  }
}

/**
 * Estado "lida/não lida" das notificações. Na demonstração estática fica
 * salvo no navegador (localStorage); com back-end, virá do banco.
 */
export function useReadNotifications(notifications: CampusNotification[]) {
  const [readMap, setReadMap] = useState<Record<string, boolean>>(() => {
    const stored = loadStored() ?? {};
    const initial: Record<string, boolean> = {};
    for (const n of notifications) initial[n.id] = stored[n.id] ?? n.initiallyRead;
    return initial;
  });

  const update = useCallback((next: Record<string, boolean>) => {
    setReadMap(next);
    save(next);
  }, []);

  const markRead = useCallback(
    (id: string, read = true) => update({ ...readMap, [id]: read }),
    [readMap, update],
  );

  const markAllRead = useCallback(() => {
    const next = { ...readMap };
    for (const n of notifications) next[n.id] = true;
    update(next);
  }, [notifications, readMap, update]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !readMap[n.id]).length,
    [notifications, readMap],
  );

  return { isRead: (id: string) => Boolean(readMap[id]), markRead, markAllRead, unreadCount };
}
