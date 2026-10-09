'use client';

import { useState } from 'react';
import { FlipCatalogo } from './FlipCatalogo';

const CATALOGOS = [
  { id: 'videoconferencia', titulo: 'Videoconferencia', src: '/catalogos/videoconferencia.pdf' },
  { id: 'stock-fp', titulo: 'Stock FP', src: '/catalogos/stock-fp.pdf' },
] as const;

export function CatalogosVisor() {
  const [activo, setActivo] = useState<(typeof CATALOGOS)[number]>(CATALOGOS[0]);
  return (
    <section className="px-4 py-12 sm:py-16">
      <div className="mb-8 flex flex-wrap justify-center gap-2" role="tablist">
        {CATALOGOS.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={activo.id === c.id}
            onClick={() => setActivo(c)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${activo.id === c.id ? 'bg-brand-primary text-white' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'}`}
          >
            {c.titulo}
          </button>
        ))}
      </div>
      <FlipCatalogo key={activo.id} src={activo.src} titulo={`Catálogo ${activo.titulo}`} />
    </section>
  );
}
