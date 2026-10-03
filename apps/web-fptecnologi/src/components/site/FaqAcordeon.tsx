'use client';

import { useState } from 'react';

type Item = { title: string; text: string };

/* Acordeón de preguntas frecuentes (un panel abierto a la vez). Los textos
   vienen del CMS (dashboard → Cotizador → Formulario). */
export function FaqAcordeon({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="flex flex-col divide-y divide-ink/5 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-lg shadow-brand-dark/5">
      {items.map((it, i) => {
        const abierto = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              aria-expanded={abierto}
              aria-controls={`faq-${i}`}
              onClick={() => setOpen(abierto ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold text-ink transition-colors hover:text-brand-700"
            >
              {it.title}
              <svg viewBox="0 0 24 24" fill="none" aria-hidden className={`h-5 w-5 shrink-0 text-brand-dark transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}>
                <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div id={`faq-${i}`} role="region" className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: abierto ? '1fr' : '0fr' }}>
              <div className="overflow-hidden">
                <p className="px-6 pb-5 leading-relaxed text-ink/60">{it.text}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
