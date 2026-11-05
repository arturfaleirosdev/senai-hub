import type { ReactNode } from 'react';

interface SectionHeaderProps {
  id: string;
  eyebrow: string;
  title: string;
  action?: ReactNode;
}

export function SectionHeader({ id, eyebrow, title, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-600">{eyebrow}</p>
        <h2 id={id} className="mt-1 font-display text-xl font-extrabold tracking-tight text-brand-950 sm:text-2xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
