'use client';

import { useEffect, useState } from 'react';

type Item = { nivel: 2 | 3; texto: string; id: string };

/* Índice del artículo: enlaces a sus títulos y resalta la sección que se está leyendo. */
export function IndiceArticulo({ items }: { items: Item[] }) {
  const [activo, setActivo] = useState(items[0]?.id ?? '');

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entradas) => {
        const visible = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActivo(visible.target.id);
      },
      { rootMargin: '-100px 0px -65% 0px' },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [items]);

  if (items.length < 2) return null;
  return (
    <nav aria-label="Índice del artículo" className="rounded-2xl bg-white p-6 shadow-lg shadow-brand-dark/10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink">
        En este artículo
        <span className="mt-2 block h-0.5 w-8 rounded-full bg-brand-primary" />
      </p>
      <ol className="mt-4 space-y-1 text-sm">
        {items.map((i) => (
          <li key={i.id} className={i.nivel === 3 ? 'pl-4' : ''}>
            <a
              href={`#${i.id}`}
              aria-current={activo === i.id ? 'location' : undefined}
              className={`block rounded-lg px-3 py-1.5 leading-snug transition-colors ${
                activo === i.id ? 'bg-brand-primary/10 font-semibold text-brand-primary' : 'text-ink/65 hover:bg-paper hover:text-brand-primary'
              }`}
            >
              {i.texto}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
