import { describe, expect, it } from 'vitest';
import { buildIcs, escapeIcsText, foldLine, slugify, toIcsDate } from './ics';

describe('exportação .ics', () => {
  const event = {
    id: 'evt-1',
    title: 'Prova: Eletricidade Básica, módulo 2; turma A',
    description: 'Traga calculadora\ne documento',
    location: 'Bloco B · Sala 12',
    start: new Date('2026-11-06T11:00:00Z'),
    end: new Date('2026-11-06T13:00:00Z'),
  };

  it('gera datas em UTC no formato iCalendar', () => {
    expect(toIcsDate(event.start)).toBe('20261106T110000Z');
  });

  it('escapa vírgula, ponto e vírgula e quebra de linha', () => {
    expect(escapeIcsText('a, b; c\nd')).toBe(String.raw`a\, b\; c\nd`);
  });

  it('monta um VCALENDAR válido com alarme de 1 hora', () => {
    const ics = buildIcs(event, new Date('2026-11-05T12:00:00Z'));
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('DTSTART:20261106T110000Z');
    expect(ics).toContain('DTEND:20261106T130000Z');
    expect(ics).toContain('UID:evt-1@smartcampus-senai-taguatinga');
    expect(ics).toContain('TRIGGER:-PT1H');
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
  });

  it('dobra linhas longas em até 75 octetos', () => {
    const folded = foldLine('DESCRIPTION:' + 'ção'.repeat(60));
    for (const line of folded.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });

  it('cria nome de arquivo sem acentos', () => {
    expect(slugify('Prova: Eletricidade Básica')).toBe('prova-eletricidade-basica');
  });
});
