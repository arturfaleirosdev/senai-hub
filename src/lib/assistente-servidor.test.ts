import { describe, expect, it } from 'vitest';
import {
  LIMITES,
  limparTexto,
  montarContexto,
  origemDosDados,
  promptDeSistema,
  validarEntrada,
} from '../../supabase/functions/assistente/contexto.ts';
import { fromZoned } from './datetime';

const agora = fromZoned(2026, 11, 5, 10, 0);

describe('contexto do assistente', () => {
  const ctx = montarContexto(agora, agora);

  it('traz data atual, eventos com local do mapa, vagas e locais', () => {
    expect(ctx).toContain('Data e hora atuais em Brasília: Quinta-feira, 5 de novembro de 2026, 10:00.');
    expect(ctx).toMatch(/Amanhã, 08:00 – 10:00 · \[Prova\] Prova: Eletricidade Básica · Local: Blocos E e F · Sala 12 \(no mapa: Blocos E e F/);
    expect(ctx).toContain('Estágio em Desenvolvimento Web · Cerrado Code Software');
    expect(ctx).toContain('Requisitos: a partir do 2º semestre, 16 anos ou mais, matrícula ativa');
    expect(ctx).toContain('Blocos E e F · Automação, TI, Telecom e Refrigeração [Laboratórios]: Laboratório de Automação (CLP)');
    expect(ctx).toContain('Biblioteca SENAI [Secretaria e biblioteca]');
  });

  it('o prompt de sistema exige português, só dados do portal e admitir quando não sabe', () => {
    const prompt = promptDeSistema(ctx);
    expect(prompt).toContain('português do Brasil');
    expect(prompt).toContain('use SOMENTE os DADOS DO PORTAL');
    expect(prompt).toContain('diga claramente que não sabe');
    expect(prompt).toContain('Nunca peça senhas');
  });

  it('não aceita origem dos dados absurda', () => {
    expect(origemDosDados('lixo', agora)).toBe(agora);
    expect(origemDosDados('2020-01-01T00:00:00Z', agora)).toBe(agora);
    const ok = new Date(agora.getTime() - 3600_000);
    expect(origemDosDados(ok.toISOString(), agora).getTime()).toBe(ok.getTime());
  });
});

describe('validação da entrada', () => {
  it('aceita conversa normal e remove caracteres de controle', () => {
    const r = validarEntrada({ mensagens: [{ papel: 'user', texto: 'Oi\u0000, tudo bem?' }] });
    expect(r).toEqual({ ok: true, mensagens: [{ role: 'user', text: 'Oi, tudo bem?' }], abertoEm: undefined });
  });

  it('recusa pergunta longa demais e conversa que não termina no aluno', () => {
    expect(validarEntrada({ mensagens: [{ papel: 'user', texto: 'a'.repeat(LIMITES.pergunta + 1) }] }).ok).toBe(false);
    expect(validarEntrada({ mensagens: [{ papel: 'model', texto: 'oi' }] }).ok).toBe(false);
    expect(validarEntrada({ mensagens: 'x' }).ok).toBe(false);
    expect(validarEntrada(null).ok).toBe(false);
  });

  it('descarta abertura da IA, limita o histórico e junta papéis repetidos', () => {
    const muitas = Array.from({ length: 30 }, (_, i) => ({ papel: i % 2 ? 'model' : 'user', texto: `m${i}` }));
    muitas.push({ papel: 'user', texto: 'final' });
    const r = validarEntrada({ mensagens: [{ papel: 'model', texto: 'boas-vindas' }, ...muitas] });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.mensagens[0].role).toBe('user');
      expect(r.mensagens.length).toBeLessThanOrEqual(LIMITES.historicoQtd);
      expect(r.mensagens.at(-1)?.text).toContain('final');
      for (let i = 1; i < r.mensagens.length; i++) expect(r.mensagens[i].role).not.toBe(r.mensagens[i - 1].role);
    }
  });

  it('limparTexto encurta espaços repetidos', () => {
    expect(limparTexto('  a      b  ')).toBe('a  b');
  });
});
