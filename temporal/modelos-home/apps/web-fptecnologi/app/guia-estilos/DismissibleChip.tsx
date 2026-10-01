'use client';

import { useState } from 'react';

/** Chip de filtro descartable (propuesta) — clic en la X lo saca de la
 * lista. No existe en el sitio todavía (no hay filtros de catálogo con
 * chips activos), pero es un patrón real de Vireo (Badges.tsx). */
export function DismissibleChip({ initialLabels }: { initialLabels: string[] }) {
  const [labels, setLabels] = useState(initialLabels);

  if (labels.length === 0) {
    return (
      <button type="button" onClick={() => setLabels(initialLabels)} className="text-xs font-semibold text-brand-primary hover:underline">
        Restablecer filtros
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => (
        <span key={label} className="flex items-center gap-1.5 rounded-full bg-brand-primary/10 py-1.5 pl-3 pr-2 text-xs font-semibold text-brand-primary">
          {label}
          <button
            type="button"
            onClick={() => setLabels((prev) => prev.filter((l) => l !== label))}
            aria-label={`Quitar filtro ${label}`}
            className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-brand-primary/20"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </span>
      ))}
    </div>
  );
}
