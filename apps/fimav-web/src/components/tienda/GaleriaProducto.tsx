'use client';
import { useState } from 'react';

/** Foto principal y miniaturas de un producto. */
export default function GaleriaProducto({ imagenes, nombre }: { imagenes: string[]; nombre: string }) {
  const [i, setI] = useState(0);
  const lista = imagenes.length ? imagenes : ['/brand/og.jpg'];
  return (
    <div>
      <div className="aspect-square rounded-2xl border border-carbon/15 bg-white p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={lista[i]} alt={nombre} className="size-full object-contain" />
      </div>
      {lista.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {lista.map((src, n) => (
            <li key={src}>
              <button type="button" onClick={() => setI(n)} aria-label={`Ver foto ${n + 1}`} aria-current={n === i} className={`size-16 rounded-lg border bg-white p-1 ${n === i ? 'border-boton ring-2 ring-boton' : 'border-carbon/30'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" className="size-full object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
