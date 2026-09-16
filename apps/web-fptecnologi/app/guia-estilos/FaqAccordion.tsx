'use client';

import { useState } from 'react';

const ITEMS = [
  { q: '¿Tienen stock disponible o hay que esperar importación?', a: 'Sin depender de importación por pedido — despacho inmediato.' },
  { q: '¿Las marcas que venden son originales?', a: 'Distribución autorizada: marcas originales con garantía oficial, no gris.' },
  { q: '¿Tengo que comprometerme al pedir una cotización?', a: 'Un especialista te arma la propuesta, vos decidís — sin compromiso.' },
  { q: '¿Dónde están ubicados?', a: 'Jr. Huaraz 1841, Breña — Lima, Perú.' },
] as const;

/** Acordeón de un solo panel abierto a la vez (propuesta — no existe una
 * sección de preguntas frecuentes en el sitio todavía). Contenido real:
 * cada respuesta reusa texto ya existente de WHY_CHOOSE_US/CONTACT_INFO en
 * `content.ts`, reformulado como pregunta — no hay copy inventado. */
export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      {ITEMS.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-ink"
            >
              {item.q}
              <svg viewBox="0 0 24 24" fill="none" className={`h-4 w-4 shrink-0 text-ink/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm text-ink/60">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
