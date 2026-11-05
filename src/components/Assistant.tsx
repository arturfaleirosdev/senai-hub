import { Bot, Loader2, RotateCcw, SendHorizontal, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ASSISTENTE_URL, MAX_PERGUNTA } from '../config';
import { askAssistant, type ChatMessage } from '../lib/assistant';
import { RichText } from './RichText';

const STORAGE_KEY = 'senai-hub:chat';

const SUGGESTIONS = [
  'O que tenho amanhã?',
  'Tem estágio para Desenvolvimento de Sistemas?',
  'Onde fica o Laboratório de Automação?',
];

const WELCOME: ChatMessage = {
  role: 'model',
  system: true,
  text: 'Oi! Sou o assistente do **SENAI Hub Taguatinga**. Posso ajudar com a sua agenda, vagas de estágio e emprego, locais do campus e dúvidas de estudo e carreira.',
};

function loadHistory(): ChatMessage[] {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as ChatMessage[]) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : [WELCOME];
  } catch {
    return [WELCOME];
  }
}

function saveHistory(messages: ChatMessage[]) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
  } catch {
    // Armazenamento indisponível: a conversa vale só enquanto a página estiver aberta.
  }
}

interface AssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Momento em que os dados de exemplo foram gerados (o servidor gera os mesmos). */
  openedAt: Date;
}

export function Assistant({ open, onOpenChange, openedAt }: AssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const configured = Boolean(ASSISTENTE_URL);

  useEffect(() => saveHistory(messages), [messages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const close = () => {
    onOpenChange(false);
    launcherRef.current?.focus();
  };

  const send = async (text: string) => {
    const question = text.trim().slice(0, MAX_PERGUNTA);
    if (!question || loading) return;
    const next: ChatMessage[] = [...messages, { role: 'user', text: question }];
    setMessages(next);
    setDraft('');
    setLoading(true);
    const result = await askAssistant(next, openedAt);
    setLoading(false);
    if (result.ok) {
      setMessages((cur) => [...cur, { role: 'model', text: result.texto }]);
      setRemaining(result.restantes);
    } else {
      setMessages((cur) => [...cur, { role: 'model', text: result.mensagem, system: true }]);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(draft);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send(draft);
    }
  };

  const reset = () => {
    setMessages([WELCOME]);
    inputRef.current?.focus();
  };

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls="assistente-painel"
        className={`fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-brand-800 py-3 pl-3.5 pr-4 text-sm font-semibold text-white shadow-lg shadow-brand-900/30 ring-2 ring-white transition hover:bg-brand-900 lg:bottom-6 lg:right-6 ${
          open ? 'max-sm:hidden' : ''
        }`}
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Sparkles className="h-5 w-5" aria-hidden="true" />}
        {open ? 'Fechar' : 'Assistente'}
      </button>

      {open && (
        <div
          id="assistente-painel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="assistente-titulo"
          onKeyDown={(e) => e.key === 'Escape' && close()}
          className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl ring-1 ring-slate-200 sm:inset-x-auto sm:bottom-24 sm:right-6 sm:top-auto sm:h-[min(600px,calc(100vh-8rem))] sm:w-[390px] sm:rounded-2xl lg:bottom-24"
        >
          <header className="flex items-center gap-3 bg-brand-800 px-4 py-3 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="assistente-titulo" className="font-display text-[15px] font-bold leading-tight">
                Assistente SENAI Hub
              </h2>
              <p className="text-xs text-brand-100">
                {remaining !== null ? `${remaining} ${remaining === 1 ? 'mensagem restante' : 'mensagens restantes'} hoje` : 'IA com Google Gemini'}
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/15"
              aria-label="Começar nova conversa"
              title="Nova conversa"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={close}
              className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/15"
              aria-label="Fechar assistente"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-br-md bg-brand-700 text-white'
                      : m.system && i > 0
                        ? 'rounded-bl-md bg-amber-50 text-amber-900 ring-1 ring-amber-200'
                        : 'rounded-bl-md bg-white text-slate-800 shadow-sm ring-1 ring-slate-200'
                  }`}
                >
                  {m.role === 'user' ? <p className="whitespace-pre-wrap">{m.text}</p> : <RichText text={m.text} />}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Pensando…
              </div>
            )}
            {messages.length === 1 && !loading && (
              <div className="pt-1">
                <p className="mb-2 text-xs font-semibold text-slate-500">Experimente perguntar:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void send(s)}
                      disabled={!configured}
                      className="rounded-full bg-white px-3 py-1.5 text-left text-xs font-semibold text-brand-700 ring-1 ring-brand-200 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!configured && (
              <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 ring-1 ring-amber-200">
                O assistente ainda está sendo conectado ao servidor. Em breve você poderá conversar por aqui.
              </p>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-end gap-2">
              <label className="flex-1">
                <span className="sr-only">Sua pergunta</span>
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value.slice(0, MAX_PERGUNTA))}
                  onKeyDown={onKeyDown}
                  rows={1}
                  maxLength={MAX_PERGUNTA}
                  disabled={!configured}
                  placeholder={configured ? 'Pergunte sobre agenda, vagas, campus…' : 'Assistente indisponível'}
                  className="max-h-28 min-h-[44px] w-full resize-none rounded-xl border-0 bg-slate-100 px-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed"
                />
              </label>
              <button
                type="submit"
                disabled={!configured || loading || !draft.trim()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-600 text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="Enviar pergunta"
              >
                <SendHorizontal className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-1.5 flex justify-between gap-2 text-[11px] text-slate-400">
              <span>A IA pode errar. Confira informações importantes com a secretaria. Não envie dados pessoais.</span>
              <span className="tabular shrink-0">
                {draft.length}/{MAX_PERGUNTA}
              </span>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
