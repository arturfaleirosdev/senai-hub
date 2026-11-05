import { useEffect, useState } from 'react';

/**
 * Data/hora atual, atualizada a cada `intervalMs`. O primeiro tique é
 * alinhado ao início do próximo segundo para o relógio não "pular".
 */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let interval: number | undefined;
    const align = intervalMs - (Date.now() % intervalMs);
    const timeout = window.setTimeout(() => {
      setNow(new Date());
      interval = window.setInterval(() => setNow(new Date()), intervalMs);
    }, align);
    return () => {
      window.clearTimeout(timeout);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [intervalMs]);

  return now;
}
