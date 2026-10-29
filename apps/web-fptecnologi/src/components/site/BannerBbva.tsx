import { ArrowRight, Nfc, ShieldCheck, Sparkles, Timer } from 'lucide-react';

/*
 * Llamadas a /tarjetas-bbva (consulta de tarjetas de crédito BBVA disponibles).
 * Colores de BBVA solo aquí: azul eléctrico #001391, marino #070E46, celeste #85C8FF.
 * La tienda no cobra con tarjeta: el texto invita a descubrir la tarjeta, no a pagar con ella.
 *   franja  -> aviso compacto (carrito, checkout, ficha de producto)
 *   tarjeta -> bloque mediano (tienda)
 *   hero    -> sección grande antes del footer (home)
 */
const HREF = '/tarjetas-bbva';

/** Tarjeta dibujada con CSS (no es la imagen oficial: esas llegan de BBVA al consultar). */
export function TarjetaBbva({ className = '', tono = 'electrico' }: { className?: string; tono?: 'electrico' | 'marino' | 'celeste' }) {
  const fondo = {
    electrico: 'from-[#001391] via-[#0a2bd6] to-[#1973e8]',
    marino: 'from-[#070E46] via-[#0b1f78] to-[#001391]',
    celeste: 'from-[#5aa9f5] via-[#85C8FF] to-[#c9e6ff]',
  }[tono];
  const texto = tono === 'celeste' ? 'text-[#070E46]' : 'text-white';
  return (
    <div aria-hidden className={`relative aspect-[1.586] overflow-hidden [container-type:inline-size] rounded-xl bg-gradient-to-br ${fondo} shadow-xl shadow-[#001391]/30 ${className}`}>
      <div className="absolute -right-1/4 -top-1/3 h-[120%] w-[70%] rounded-full bg-white/10" />
      <div className={`absolute inset-0 flex flex-col justify-between p-[7%] ${texto}`}>
        <div className="flex items-start justify-between">
          <span className="font-display text-[clamp(0.55rem,11cqw,1.5rem)] font-extrabold tracking-[0.08em]">BBVA</span>
          <Nfc className="h-[14%] w-auto opacity-80" strokeWidth={1.8} />
        </div>
        <div className="h-[18%] w-[16%] rounded-[4px] bg-gradient-to-br from-amber-200 to-amber-400/80" />
        <div className="flex items-end justify-between text-[clamp(0.4rem,6cqw,0.8rem)] font-semibold tracking-widest opacity-90">
          <span>•••• 4829</span>
          <span>CRÉDITO</span>
        </div>
      </div>
    </div>
  );
}

export function BannerBbva({ variante = 'franja', className = '' }: { variante?: 'franja' | 'tarjeta' | 'hero'; className?: string }) {
  if (variante === 'franja') {
    return (
      <a
        href={HREF}
        className={`group flex items-center gap-4 rounded-2xl border border-[#001391]/15 bg-gradient-to-r from-[#eef2ff] to-white p-3 pr-4 shadow-md shadow-brand-dark/10 transition-all hover:-translate-y-0.5 hover:border-[#001391]/40 ${className}`}
      >
        <TarjetaBbva className="w-20 shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-[#070E46]">¿Tienes una tarjeta BBVA preaprobada?</span>
          <span className="block text-xs text-ink/65">Consulta con tu DNI en 1 minuto, sin costo.</span>
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-[#001391] transition-transform group-hover:translate-x-1" strokeWidth={2} />
      </a>
    );
  }

  if (variante === 'tarjeta') {
    return (
      <a
        href={HREF}
        className={`group relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#070E46] to-[#001391] p-6 text-white shadow-xl shadow-[#001391]/25 transition-transform hover:-translate-y-1 sm:flex-row sm:p-8 ${className}`}
      >
        <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#85C8FF]/25 blur-3xl" />
        <div className="relative flex w-56 shrink-0">
          <TarjetaBbva tono="celeste" className="absolute left-6 top-0 w-full -rotate-6 opacity-90" />
          <TarjetaBbva className="relative mt-6 w-full rotate-3 transition-transform group-hover:rotate-0" />
        </div>
        <div className="relative flex-1 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#85C8FF]">Tarjetas de crédito BBVA</p>
          <p className="mt-2 font-display text-2xl font-bold leading-tight">Descubre qué tarjeta tienes disponible</p>
          <p className="mt-2 text-sm text-white/80">Ingresa tu DNI y mira tus ofertas preaprobadas con su línea de crédito. La solicitas directo con BBVA.</p>
        </div>
        <span className="relative inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold uppercase tracking-wide text-[#001391] transition-colors group-hover:bg-[#85C8FF]">
          Ver mis tarjetas <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </a>
    );
  }

  return (
    <section className={`bg-paper px-3 py-10 md:px-5 md:py-14 ${className}`}>
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-[#070E46] via-[#001391] to-[#0a2bd6] px-6 py-12 text-white shadow-2xl shadow-[#001391]/30 md:rounded-[2.25rem] md:px-14 md:py-16">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#85C8FF]/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#1973e8]/30 blur-3xl" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#85C8FF] backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} /> Nuevo · Aliado BBVA
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
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
            <a href={HREF} className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold uppercase tracking-wide text-[#001391] transition-colors hover:bg-[#85C8FF]">
              Ver mis tarjetas disponibles <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </a>
          </div>
          <div className="relative mx-auto h-56 w-full max-w-sm sm:h-64">
            <TarjetaBbva tono="celeste" className="absolute left-0 top-0 w-[64%] -rotate-12" />
            <TarjetaBbva tono="marino" className="absolute right-0 top-6 w-[64%] rotate-6 ring-1 ring-white/20" />
            <TarjetaBbva className="absolute bottom-2 left-[18%] w-[64%] -rotate-2" />
          </div>
        </div>
      </div>
    </section>
  );
}
