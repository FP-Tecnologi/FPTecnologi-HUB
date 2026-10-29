import { ArrowRight, ShieldCheck, Sparkles, Timer } from 'lucide-react';

/*
 * Llamadas a /tarjetas-bbva (consulta de tarjetas de crédito BBVA disponibles).
 * Imágenes oficiales en public/images/bbva: portadas de cardcovers.caasbbva.com (las mismas que
 * devuelve la API Cards offer, verticales 188×304) y el logo de bbva.pe.
 * Colores de BBVA solo aquí: azul #004481, marino #070E46, eléctrico #001391, celeste #85C8FF.
 * La tienda no cobra con tarjeta: el texto invita a descubrir la tarjeta, no a pagar con ella.
 *   franja  -> aviso compacto (carrito, checkout, ficha de producto)
 *   tarjeta -> bloque mediano (tienda)
 *   hero    -> sección grande antes del footer (home)
 */
const HREF = '/tarjetas-bbva';

const MODELOS = {
  'visa-cero': 'Tarjeta de crédito BBVA Visa Cero',
  'mastercard-bfree': 'Tarjeta de crédito BBVA Mastercard Bfree',
} as const;

/** Tarjeta oficial de BBVA (vertical). */
export function TarjetaBbva({ modelo = 'visa-cero', className = '' }: { modelo?: keyof typeof MODELOS; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/images/bbva/${modelo}.svg`} alt={MODELOS[modelo]} className={`aspect-[188/304] object-contain drop-shadow-[0_18px_30px_rgba(0,19,145,0.35)] ${className}`} />
  );
}

/** Las dos tarjetas en abanico. `ancho` = ancho de cada tarjeta (clase Tailwind). */
export function TarjetasAbanico({ ancho = 'w-36', className = '' }: { ancho?: string; className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <TarjetaBbva modelo="mastercard-bfree" className={`${ancho} -mr-[18%] -rotate-[10deg] transition-transform duration-500 group-hover:-rotate-[14deg]`} />
      <TarjetaBbva modelo="visa-cero" className={`${ancho} relative mt-[12%] rotate-[8deg] transition-transform duration-500 group-hover:rotate-[12deg]`} />
    </div>
  );
}

export function LogoBbva({ blanco = false, className = 'h-5' }: { blanco?: boolean; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/images/bbva/logo-bbva${blanco ? '-blanco' : ''}.svg`} alt="BBVA" className={`w-auto ${className}`} />;
}

export function BannerBbva({ variante = 'franja', className = '' }: { variante?: 'franja' | 'tarjeta' | 'hero'; className?: string }) {
  if (variante === 'franja') {
    return (
      <a
        href={HREF}
        className={`group flex items-center gap-4 overflow-hidden rounded-2xl border border-[#004481]/15 bg-gradient-to-r from-[#eaf3fb] to-white py-2 pl-3 pr-4 shadow-md shadow-brand-dark/10 transition-all hover:-translate-y-0.5 hover:border-[#004481]/40 ${className}`}
      >
        <TarjetasAbanico ancho="w-9" className="w-16 shrink-0 py-1" />
        <span className="min-w-0 flex-1">
          <LogoBbva className="h-3.5" />
          <span className="mt-1 block text-sm font-bold text-[#070E46]">¿Tienes una tarjeta BBVA preaprobada?</span>
          <span className="block text-xs text-ink/65">Consulta con tu DNI en 1 minuto, sin costo.</span>
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-[#004481] transition-transform group-hover:translate-x-1" strokeWidth={2} />
      </a>
    );
  }

  if (variante === 'tarjeta') {
    return (
      <a
        href={HREF}
        className={`group relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#070E46] via-[#004481] to-[#001391] p-6 text-white shadow-xl shadow-[#001391]/25 transition-transform hover:-translate-y-1 sm:flex-row sm:p-8 ${className}`}
      >
        <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#85C8FF]/25 blur-3xl" />
        <TarjetasAbanico ancho="w-24" className="relative w-44 shrink-0" />
        <div className="relative flex-1 text-center sm:text-left">
          <LogoBbva blanco className="mx-auto h-5 sm:mx-0" />
          <p className="mt-3 font-display text-2xl font-bold leading-tight">Descubre qué tarjeta de crédito tienes disponible</p>
          <p className="mt-2 text-sm text-white/80">Ingresa tu DNI y mira tus ofertas preaprobadas con su línea de crédito. La solicitas directo con BBVA.</p>
        </div>
        <span className="relative inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold uppercase tracking-wide text-[#004481] transition-colors group-hover:bg-[#85C8FF]">
          Ver mis tarjetas <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </a>
    );
  }

  return (
    <section className={`group bg-paper px-3 py-10 md:px-5 md:py-14 ${className}`}>
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-[#070E46] via-[#004481] to-[#001391] px-6 py-12 text-white shadow-2xl shadow-[#001391]/30 md:rounded-[2.25rem] md:px-14 md:py-14">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#85C8FF]/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#1973e8]/30 blur-3xl" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <LogoBbva blanco className="h-6" />
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#85C8FF] backdrop-blur">Nuevo · Aliado BBVA</span>
            </div>
            <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Tu tarjeta de crédito BBVA <span className="text-[#85C8FF]">te está esperando</span>
            </h2>
            <p className="mt-4 max-w-xl text-white/80">
              Consulta con tu DNI qué tarjetas tienes preaprobadas según tu perfil, con su línea de crédito y tasa. Eliges una y la solicitas directo con BBVA.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-white/85 sm:grid-cols-3">
              <li className="flex items-center gap-2"><Timer className="h-4 w-4 text-[#85C8FF]" strokeWidth={2} /> Respuesta al instante</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#85C8FF]" strokeWidth={2} /> Consulta segura</li>
              <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#85C8FF]" strokeWidth={2} /> Sin costo</li>
            </ul>
            <a href={HREF} className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold uppercase tracking-wide text-[#004481] transition-colors hover:bg-[#85C8FF]">
              Ver mis tarjetas disponibles <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </a>
          </div>
          <TarjetasAbanico ancho="w-36 sm:w-44" className="mx-auto" />
        </div>
      </div>
    </section>
  );
}
