import type { ReactNode } from 'react';

/** Negrito com **texto**, sem interpretar HTML. */
function inline(text: string, keyBase: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
      <strong key={`${keyBase}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  );
}

/**
 * Renderiza o pouco de Markdown que a IA costuma usar (parágrafos, listas e
 * negrito) como elementos React. Nada vira HTML bruto, então não há injeção.
 */
export function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => {
    if (!list) return;
    const items = list.items.map((it, i) => <li key={i}>{inline(it, `li${blocks.length}-${i}`)}</li>);
    blocks.push(
      list.ordered ? (
        <ol key={blocks.length} className="ml-5 list-decimal space-y-0.5">{items}</ol>
      ) : (
        <ul key={blocks.length} className="ml-5 list-disc space-y-0.5">{items}</ul>
      ),
    );
    list = null;
  };
  for (const raw of text.replace(/\r/g, '').split('\n')) {
    const line = raw.trim();
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      if (!list || list.ordered !== ordered) {
        flush();
        list = { ordered, items: [] };
      }
      list.items.push((bullet ?? numbered)![1]);
      continue;
    }
    flush();
    if (!line) continue;
    const heading = line.match(/^#{1,4}\s+(.*)$/);
    blocks.push(
      <p key={blocks.length} className={heading ? 'font-semibold' : undefined}>
        {inline(heading ? heading[1] : line, `p${blocks.length}`)}
      </p>,
    );
  }
  flush();
  return <div className="space-y-2">{blocks}</div>;
}
