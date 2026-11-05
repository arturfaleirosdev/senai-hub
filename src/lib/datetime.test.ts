// Os testes rodam com TZ=Asia/Tokyo (veja package.json) para garantir que
// tudo é calculado no fuso do campus, e não no fuso do computador.
import { describe, expect, it } from 'vitest';
import {
  atDayOffset,
  calendarDayDiff,
  dayKey,
  formatCountdown,
  formatDeadline,
  formatTime,
  fromZoned,
  greeting,
  relativeDayLabel,
  zonedParts,
} from './datetime';

describe('fuso America/Sao_Paulo', () => {
  it('converte horário de parede de Brasília para UTC (UTC-3)', () => {
    expect(fromZoned(2026, 11, 5, 19, 0).toISOString()).toBe('2026-11-05T22:00:00.000Z');
  });

  it('lê os componentes no fuso do campus, não no do aparelho', () => {
    const p = zonedParts(new Date('2026-11-06T02:30:00Z'));
    expect(p).toMatchObject({ year: 2026, month: 11, day: 5, hour: 23, minute: 30 });
    expect(dayKey(new Date('2026-11-06T02:30:00Z'))).toBe('2026-11-05');
  });

  it('soma dias atravessando virada de mês e ano', () => {
    const base = fromZoned(2026, 12, 30, 10, 0);
    expect(atDayOffset(base, 3, 8, 15).toISOString()).toBe('2027-01-02T11:15:00.000Z');
  });

  it('formata hora no padrão brasileiro', () => {
    expect(formatTime(fromZoned(2026, 11, 5, 8, 5))).toBe('08:05');
  });
});

describe('rótulos relativos', () => {
  const now = fromZoned(2026, 11, 5, 23, 50);

  it('Hoje / Amanhã pelo calendário de Brasília', () => {
    expect(relativeDayLabel(fromZoned(2026, 11, 5, 23, 59), now)).toBe('Hoje');
    expect(relativeDayLabel(fromZoned(2026, 11, 6, 0, 5), now)).toBe('Amanhã');
    expect(calendarDayDiff(now, fromZoned(2026, 11, 9, 1, 0))).toBe(4);
  });

  it('prazos de vagas', () => {
    expect(formatDeadline(fromZoned(2026, 11, 5, 23, 59), now)).toBe('Encerra hoje às 23:59');
    expect(formatDeadline(fromZoned(2026, 11, 6, 18, 0), now)).toBe('Encerra amanhã');
    expect(formatDeadline(fromZoned(2026, 11, 10, 18, 0), now)).toBe('Encerra em 5 dias');
    expect(formatDeadline(fromZoned(2026, 11, 5, 12, 0), now)).toBe('Inscrições encerradas');
  });

  it('saudação conforme a hora de Brasília', () => {
    expect(greeting(fromZoned(2026, 11, 5, 9, 0))).toBe('Bom dia');
    expect(greeting(fromZoned(2026, 11, 5, 14, 0))).toBe('Boa tarde');
    expect(greeting(now)).toBe('Boa noite');
  });
});

describe('contagem regressiva', () => {
  it('menos de um dia em HH:MM:SS', () => {
    expect(formatCountdown(((2 * 60 + 5) * 60 + 9) * 1000)).toBe('02:05:09');
  });
  it('mais de um dia em dias/horas/minutos', () => {
    expect(formatCountdown(((3 * 24 + 4) * 60 + 12) * 60_000)).toBe('3d 04h 12min');
  });
  it('nunca fica negativa', () => {
    expect(formatCountdown(-5000)).toBe('00:00:00');
  });
});
