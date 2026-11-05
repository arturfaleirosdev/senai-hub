/**
 * Supabase Edge Function `assistente`: chat do SENAI Hub com o Google Gemini.
 *
 * Variáveis de ambiente (Supabase → Edge Functions → Secrets):
 *   GEMINI_API_KEY      (obrigatória) chave gratuita do Google AI Studio
 *   GEMINI_MODEL        (opcional) modelos da família Flash, separados por vírgula,
 *                       testados em ordem. Padrão: gemini-flash-latest,gemini-2.5-flash
 *   LIMITE_DIARIO       (opcional) mensagens por aparelho por dia. Padrão: 20
 *   LIMITE_GLOBAL       (opcional) mensagens de todos os alunos por dia. Padrão: 300
 *   ORIGENS_PERMITIDAS  (opcional) sites que podem chamar a função, separados por vírgula
 * SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já existem em toda Edge Function.
 *
 * A chave do Gemini NUNCA vai para o navegador. À IA só vão a pergunta, o
 * histórico curto da conversa e os dados públicos do portal (sem IP nem dados pessoais).
 */
import { LIMITES, montarContexto, origemDosDados, promptDeSistema, validarEntrada } from './contexto.ts';

const env = (k: string) => Deno.env.get(k)?.trim() ?? '';

const ORIGENS = (
  env('ORIGENS_PERMITIDAS') ||
  'https://arturfaleirosdev.github.io,https://alexandrebezerracs.github.io,http://localhost:5173,http://localhost:4173,null'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const MODELOS = (env('GEMINI_MODEL') || 'gemini-flash-latest,gemini-2.5-flash')
  .split(',')
  .map((m) => m.trim())
  .filter((m) => /^[\w.-]+$/.test(m));

const LIMITE_DIARIO = Number(env('LIMITE_DIARIO')) || 20;
const LIMITE_GLOBAL = Number(env('LIMITE_GLOBAL')) || 300;

function cors(origin: string | null): Record<string, string> {
  const h: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  if (origin && ORIGENS.includes(origin)) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(origin) },
  });
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Conta uma mensagem no banco. Retorna restantes (>= 0), -1 (aparelho) ou -2 (global). */
async function consumirLimite(ip: string): Promise<number> {
  const url = env('SUPABASE_URL');
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Supabase não configurado');
  const res = await fetch(`${url}/rest/v1/rpc/ai_consume`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      p_key: await sha256(`senai-hub:${url}:${ip}`),
      p_limit: LIMITE_DIARIO,
      p_global_limit: LIMITE_GLOBAL,
    }),
  });
  if (!res.ok) throw new Error(`ai_consume ${res.status}: ${await res.text()}`);
  return Number(await res.json());
}

type Gemini =
  | { ok: true; texto: string }
  | { ok: false; erro: 'cota' | 'config' | 'bloqueado' | 'falha'; detalhe: string };

async function perguntarGemini(sistema: string, mensagens: { role: 'user' | 'model'; text: string }[]): Promise<Gemini> {
  const chave = env('GEMINI_API_KEY');
  if (!chave) return { ok: false, erro: 'config', detalhe: 'GEMINI_API_KEY ausente' };

  const corpo = JSON.stringify({
    systemInstruction: { parts: [{ text: sistema }] },
    contents: mensagens.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
  });

  let ultimo = 'nenhum modelo configurado';
  for (const modelo of MODELOS) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25_000);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chave },
        body: corpo,
        signal: ctrl.signal,
      });
      const texto = await res.text();
      if (res.status === 404) {
        ultimo = `${modelo}: 404`;
        continue; // modelo indisponível: tenta o próximo da lista
      }
      if (res.status === 429) return { ok: false, erro: 'cota', detalhe: `${modelo}: 429` };
      if (res.status === 400 && /API_KEY_INVALID|API key not valid/i.test(texto)) {
        return { ok: false, erro: 'config', detalhe: 'chave do Gemini inválida' };
      }
      if (res.status === 401 || res.status === 403) return { ok: false, erro: 'config', detalhe: `${modelo}: ${res.status}` };
      if (!res.ok) {
        ultimo = `${modelo}: ${res.status} ${texto.slice(0, 300)}`;
        continue;
      }
      const data = JSON.parse(texto);
      if (data?.promptFeedback?.blockReason) return { ok: false, erro: 'bloqueado', detalhe: data.promptFeedback.blockReason };
      const cand = data?.candidates?.[0];
      const resposta = (cand?.content?.parts ?? [])
        .filter((p: { thought?: boolean }) => !p.thought)
        .map((p: { text?: string }) => p.text ?? '')
        .join('')
        .trim();
      if (!resposta) {
        if (cand?.finishReason === 'SAFETY') return { ok: false, erro: 'bloqueado', detalhe: 'SAFETY' };
        ultimo = `${modelo}: resposta vazia (${cand?.finishReason ?? '?'})`;
        continue;
      }
      return { ok: true, texto: resposta };
    } catch (e) {
      ultimo = `${modelo}: ${e instanceof Error ? e.message : String(e)}`;
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, erro: 'falha', detalhe: ultimo };
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  if (origin && !ORIGENS.includes(origin)) return json({ erro: 'origem', mensagem: 'Origem não permitida.' }, 403, null);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== 'POST') return json({ erro: 'metodo', mensagem: 'Use POST.' }, 405, origin);

  const bruto = await req.text();
  if (bruto.length > LIMITES.corpo) return json({ erro: 'entrada', mensagem: 'Mensagem grande demais.' }, 413, origin);
  let corpo: unknown;
  try {
    corpo = JSON.parse(bruto);
  } catch {
    return json({ erro: 'entrada', mensagem: 'JSON inválido.' }, 400, origin);
  }
  const entrada = validarEntrada(corpo);
  if (!entrada.ok) return json({ erro: 'entrada', mensagem: entrada.motivo }, 400, origin);

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'desconhecido';
  let restantes: number;
  try {
    restantes = await consumirLimite(ip);
  } catch (e) {
    console.error('limite', e);
    return json({ erro: 'falha', mensagem: 'O assistente está indisponível agora. Tente novamente em instantes.' }, 503, origin);
  }
  if (restantes === -1) return json({ erro: 'limite_usuario' }, 429, origin);
  if (restantes === -2) return json({ erro: 'limite_global' }, 429, origin);

  const agora = new Date();
  const sistema = promptDeSistema(montarContexto(agora, origemDosDados(entrada.abertoEm, agora)));
  const resposta = await perguntarGemini(sistema, entrada.mensagens);
  if (!resposta.ok) {
    console.error('gemini', resposta.erro, resposta.detalhe);
    const status = resposta.erro === 'cota' ? 429 : resposta.erro === 'bloqueado' ? 422 : 503;
    return json({ erro: resposta.erro }, status, origin);
  }
  return json({ texto: resposta.texto, restantes }, 200, origin);
});
