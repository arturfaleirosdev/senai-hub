/**
 * Utilitários de data e hora sempre no fuso do campus (America/Sao_Paulo),
 * independentemente do fuso configurado no aparelho do aluno.
 */
export const TZ = 'America/Sao_Paulo';
export const LOCALE = 'pt-BR';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

export interface ZonedParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** Componentes de data/hora de um instante, vistos no fuso do campus. */
export function zonedParts(date: Date): ZonedParts {
  const map: Record<string, number> = {};
  for (const part of partsFormatter.formatToParts(date)) {
    if (part.type !== 'literal') map[part.type] = Number(part.value);
  }
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour === 24 ? 0 : map.hour,
    minute: map.minute,
    second: map.second,
  };
}

/** Diferença (ms) entre o horário de parede do campus e o UTC naquele instante. */
function offsetMs(date: Date): number {
  const p = zonedParts(date);
  const wallAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return wallAsUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** Cria o instante correspondente a uma data/hora de parede no fuso do campus. */
export function fromZoned(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const first = offsetMs(new Date(guess));
  let time = guess - first;
  const second = offsetMs(new Date(time));
  if (second !== first) time = guess - second;
  return new Date(time);
}

/** Data/hora no fuso do campus, `days` dias depois do dia de `base`. */
export function atDayOffset(base: Date, days: number, hour: number, minute = 0): Date {
  const p = zonedParts(base);
  const rolled = new Date(Date.UTC(p.year, p.month - 1, p.day + days));
  return fromZoned(rolled.getUTCFullYear(), rolled.getUTCMonth() + 1, rolled.getUTCDate(), hour, minute);
}

/** Chave AAAA-MM-DD do dia no fuso do campus. */
export function dayKey(date: Date): string {
  const p = zonedParts(date);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/** Quantos dias de calendário (no fuso do campus) separam `from` de `to`. */
export function calendarDayDiff(from: Date, to: Date): number {
  const a = zonedParts(from);
  const b = zonedParts(to);
  return Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / DAY);
}

const timeFmt = new Intl.DateTimeFormat(LOCALE, { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
const clockFmt = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TZ,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});
const longDateFmt = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TZ,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const shortDateFmt = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TZ,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});
const relFmt = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });

export const formatTime = (d: Date) => timeFmt.format(d);
export const formatClock = (d: Date) => clockFmt.format(d);

/** "quinta-feira, 5 de novembro de 2026" com a primeira letra maiúscula. */
export function formatLongDate(d: Date): string {
  const text = longDateFmt.format(d);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "Hoje", "Amanhã" ou "sáb., 7 de nov." */
export function relativeDayLabel(date: Date, now: Date): string {
  const diff = calendarDayDiff(now, date);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Amanhã';
  if (diff === -1) return 'Ontem';
  const text = shortDateFmt.format(date);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Faixa de horário de um evento: "19:00 – 21:00". */
export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/** Contagem regressiva: "02:05:09" (menos de 1 dia) ou "3d 04h 12min". */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (days > 0) return `${days}d ${pad(hours)}h ${pad(minutes)}min`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** "agora", "há 5 minutos", "há 3 horas", "ontem", "há 2 dias". */
export function formatRelativePast(date: Date, now: Date): string {
  const diff = now.getTime() - date.getTime();
  if (diff < MINUTE) return 'agora';
  if (diff < HOUR) return relFmt.format(-Math.floor(diff / MINUTE), 'minute');
  if (diff < DAY) return relFmt.format(-Math.floor(diff / HOUR), 'hour');
  return relFmt.format(-calendarDayDiff(date, now), 'day');
}

/** "encerra hoje", "encerra amanhã", "encerra em 5 dias", "encerrada". */
export function formatDeadline(deadline: Date, now: Date): string {
  if (deadline.getTime() <= now.getTime()) return 'Inscrições encerradas';
  const diff = calendarDayDiff(now, deadline);
  if (diff === 0) return `Encerra hoje às ${formatTime(deadline)}`;
  if (diff === 1) return 'Encerra amanhã';
  return `Encerra em ${diff} dias`;
}

/** Saudação conforme o horário do campus. */
export function greeting(now: Date): string {
  const { hour } = zonedParts(now);
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
