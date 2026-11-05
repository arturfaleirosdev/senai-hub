import { ASSISTENTE_URL } from '../config';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  /** Mensagem de erro/aviso do sistema (não é enviada à IA). */
  system?: boolean;
}

export interface AssistantReply {
  ok: true;
  texto: string;
  restantes: number | null;
}

export interface AssistantError {
  ok: false;
  mensagem: string;
}

const FRIENDLY: Record<string, string> = {
  limite_usuario: 'Você atingiu o limite de mensagens de hoje. Volte amanhã!',
  limite_global: 'O assistente atingiu o limite de uso gratuito de hoje. Tente novamente amanhã.',
  cota: 'O limite gratuito da IA acabou por agora. Tente de novo em alguns minutos.',
  config: 'O assistente está temporariamente indisponível (configuração do servidor).',
  entrada: 'Não consegui entender a mensagem. Tente escrever de outro jeito.',
  bloqueado: 'Não posso responder a isso. Que tal perguntar sobre agenda, vagas ou o campus?',
};

/** Envia a conversa para a função do assistente e devolve a resposta. */
export async function askAssistant(history: ChatMessage[], openedAt: Date): Promise<AssistantReply | AssistantError> {
  if (!ASSISTENTE_URL) return { ok: false, mensagem: FRIENDLY.config };
  const mensagens = history
    .filter((m) => !m.system)
    .slice(-10)
    .map((m) => ({ papel: m.role, texto: m.text }));
  try {
    const res = await fetch(ASSISTENTE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagens, abertoEm: openedAt.toISOString() }),
    });
    const data = (await res.json().catch(() => null)) as
      | { texto?: string; restantes?: number; erro?: string; mensagem?: string }
      | null;
    if (res.ok && data?.texto) return { ok: true, texto: data.texto, restantes: data.restantes ?? null };
    const code = data?.erro ?? '';
    return { ok: false, mensagem: FRIENDLY[code] ?? data?.mensagem ?? 'Algo deu errado. Tente de novo em instantes.' };
  } catch {
    return { ok: false, mensagem: 'Sem conexão com o assistente. Verifique sua internet e tente de novo.' };
  }
}
