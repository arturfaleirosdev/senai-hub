/**
 * Endereço da função do assistente (Supabase Edge Function `assistente`).
 * Não é segredo: a chave do Gemini fica só no servidor.
 * Pode ser trocado no build com a variável VITE_ASSISTENTE_URL.
 * Vazio = assistente ainda não configurado (o chat avisa isso ao aluno).
 */
export const ASSISTENTE_URL: string = import.meta.env.VITE_ASSISTENTE_URL ?? '';

/** Tamanho máximo de uma pergunta (também validado no servidor). */
export const MAX_PERGUNTA = 500;
