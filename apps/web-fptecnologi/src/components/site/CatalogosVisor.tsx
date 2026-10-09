'use client';

import { useState } from 'react';
import { FlipCatalogo } from './FlipCatalogo';

type Catalogo = { titulo: string; src: string };

export function CatalogosVisor({ catalogos }: { catalogos: Catalogo[] }) {
  const [activo, setActivo] = useState(0);
  const actual = catalogos[activo];
  if (!actual) return <p className="px-4 py-16 text-center text-ink/65">Pronto publicaremos nuestros catálogos.</p>;
  return (
    <section className="px-4 py-12 sm:py-16">
      {catalogos.length > 1 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2" role="tablist">
          {catalogos.map((c, i) => (
            <button
              key={c.src}
              role="tab"
              aria-selected={activo === i}
              onClick={() => setActivo(i)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${activo === i ? 'bg-brand-primary text-white' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'}`}
            >
              {c.titulo}
            </button>
          ))}
        </div>
      )}
      <FlipCatalogo key={actual.src} src={actual.src} titulo={`Catálogo ${actual.titulo}`} />
    </section>
  );
}
