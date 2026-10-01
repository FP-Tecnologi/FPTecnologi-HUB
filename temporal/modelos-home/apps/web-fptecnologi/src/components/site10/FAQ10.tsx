import { COTIZADOR_URL } from '@/lib/content';

/* Preguntas genéricas de proceso (garantía, cotización, envíos) -- no
   inventan cifras ni políticas puntuales que no estén ya confirmadas en
   content.ts (distribución autorizada, cotización sin compromiso, stock
   local). Usa <details>/<summary> nativo: acordeón sin JS. */
const FAQS = [
  { q: '¿Cómo elijo el equipo correcto para mi empresa?', a: 'Contanos qué necesitás y un especialista te arma una propuesta según tu presupuesto y operación.' },
  { q: '¿Los equipos son originales y con garantía?', a: 'Sí, trabajamos con distribución autorizada de las principales marcas del mercado, no gris.' },
  { q: '¿Puedo cotizar antes de comprar?', a: 'Sí, la cotización es sin compromiso — vos decidís cuándo avanzar.' },
  { q: '¿Tienen stock local?', a: 'Sí, buena parte del catálogo está listo para despachar sin depender de importación por pedido.' },
  { q: '¿Cómo los contacto para una cotización?', a: 'Por WhatsApp, correo o el cotizador — el equipo comercial responde directo.' },
];

export function FAQ10() {
  return (
    <section id="soporte" className="mx-auto max-w-5xl px-6 py-20">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">¿Tenés una pregunta?</h2>
          <p className="mt-2 text-ink/60">Estamos para ayudarte.</p>
        </div>
        <a href={COTIZADOR_URL} target="_blank" rel="noreferrer" className="btn-sweep inline-flex shrink-0 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white before:bg-brand-dark">
          Contactar
        </a>
      </div>

      <div className="mt-10 divide-y divide-black/5 border-t border-black/5">
        {FAQS.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink marker:content-none">
              {f.q}
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/10 text-ink/50 transition-transform duration-300 group-open:rotate-45">
                <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
              </span>
            </summary>
            <p className="mt-3 max-w-2xl text-sm text-ink/60">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
