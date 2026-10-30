import type { CSSProperties } from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Timer } from 'lucide-react';

/*
 * Llamadas a /tarjetas-bbva (consulta de tarjetas de crédito BBVA disponibles).
 * Imágenes oficiales de BBVA en public/images/bbva: tarjetas/<id>.webp (recortadas al borde, verticales),
 * tarjetas-animadas.webp (animación de bbva.pe «Mi primera tarjeta») y el logo.
 * Colores de BBVA solo aquí: azul #004481, marino #070E46, eléctrico #001391, celeste #85C8FF.
 * La tienda no cobra con tarjeta: el texto invita a descubrir la tarjeta, no a pagar con ella.
 * Animaciones en globals.css (.bbva-abanico, .bbva-carrusel, .bbva-giro).
 *   franja  -> aviso compacto con mini tarjeta que gira (carrito, checkout, ficha de producto)
 *   tarjeta -> carrusel de tarjetas (tienda)
 *   hero    -> sección tipo bbva.pe con la animación oficial (home)
 */
export const HREF_BBVA = '/tarjetas-bbva';

/** Nombre de cada nivel de gama (1 = entrada … 5 = exclusiva). */
export const GAMAS = ['', 'Gama de entrada', 'Gama media', 'Gama alta', 'Gama premium', 'Gama exclusiva'] as const;

/** Catálogo de tarjetas de crédito BBVA, de menor a mayor gama por red (gama 1–5, común a ambas redes). */
export const TARJETAS = [
  { id: 'visa-cero', nombre: 'Visa Cero', red: 'visa', gama: 1 },
  { id: 'visa-bfree', nombre: 'Visa Bfree', red: 'visa', gama: 2 },
  { id: 'visa-platinum', nombre: 'Visa Platinum', red: 'visa', gama: 3 },
  { id: 'visa-signature', nombre: 'Visa Signature', red: 'visa', gama: 4 },
  { id: 'visa-infinite', nombre: 'Visa Infinite', red: 'visa', gama: 5 },
  { id: 'mastercard-bfree', nombre: 'Mastercard Bfree', red: 'mastercard', gama: 2 },
  { id: 'mastercard-platinum', nombre: 'Mastercard Platinum', red: 'mastercard', gama: 3 },
  { id: 'mastercard-black', nombre: 'Mastercard Black', red: 'mastercard', gama: 5 },
] as const;
export type IdTarjeta = (typeof TARJETAS)[number]['id'];
const nombre = (id: IdTarjeta) => TARJETAS.find((t) => t.id === id)!.nombre;

/** Tarjeta oficial de BBVA (vertical, proporción de tarjeta real). */
export function TarjetaBbva({ id = 'visa-cero', className = '', style, eager = false }: { id?: IdTarjeta; className?: string; style?: CSSProperties; eager?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/images/bbva/tarjetas/${id}.webp`} alt={`Tarjeta de crédito BBVA ${nombre(id)}`} loading={eager ? 'eager' : 'lazy'} style={style} className={`aspect-[63/100] object-contain drop-shadow-[0_18px_28px_rgba(0,19,145,0.35)] ${className}`} />
  );
}

// Posición final de cada tarjeta en el abanico (de atrás hacia adelante).
const POSICIONES = [
  { '--x': '34%', '--y': '4%', '--r': '13deg' },
  { '--x': '0%', '--y': '-6%', '--r': '0deg' },
  { '--x': '-34%', '--y': '4%', '--r': '-13deg' },
] as unknown as CSSProperties[];

/** Tres tarjetas que se abren en abanico y se vuelven a juntar (se pausa al pasar el cursor). */
export function AbanicoBbva({ ids = ['visa-signature', 'visa-platinum', 'visa-bfree'], className = '' }: { ids?: [IdTarjeta, IdTarjeta, IdTarjeta]; className?: string }) {
  return (
    <div className={`bbva-abanico relative aspect-[5/4] ${className}`}>
      {ids.map((id, i) => (
        <TarjetaBbva key={id} id={id} eager className="w-[40%]" style={POSICIONES[i]} />
      ))}
    </div>
  );
}

/** Carrusel: las tarjetas entran por la derecha y salen por la izquierda, una por una (4 tarjetas, 4 s cada una). */
export function CarruselBbva({ ids = ['visa-cero', 'mastercard-bfree', 'visa-signature', 'mastercard-black'], className = '' }: { ids?: IdTarjeta[]; className?: string }) {
  return (
    <div className={`bbva-carrusel relative ${className}`} style={{ '--total': `${ids.length * 4}s` } as CSSProperties}>
      {ids.map((id, i) => (
        <TarjetaBbva key={id} id={id} eager className="h-full w-auto" style={{ '--retraso': `${i * 4}s` } as CSSProperties} />
      ))}
    </div>
  );
}

export function LogoBbva({ blanco = false, className = 'h-5' }: { blanco?: boolean; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/images/bbva/logo-bbva${blanco ? '-blanco' : ''}.svg`} alt="BBVA" className={`w-auto ${className}`} />;
}

export function BannerBbva({ variante = 'franja', tarjeta = 'visa-cero', className = '' }: { variante?: 'franja' | 'tarjeta' | 'hero'; tarjeta?: IdTarjeta; className?: string }) {
  if (variante === 'franja') {
    return (
      <a
        href={HREF_BBVA}
        className={`group flex items-center gap-4 overflow-hidden rounded-2xl border border-[#004481]/15 bg-gradient-to-r from-[#eaf3fb] to-white py-2.5 pl-3 pr-4 shadow-md shadow-brand-dark/10 transition-all hover:-translate-y-0.5 hover:border-[#004481]/40 ${className}`}
      >
        {/* Mini tarjeta que gira al pasar el cursor y muestra el reverso con el gancho. */}
        <span className="bbva-giro block w-11 shrink-0">
          <div className="relative aspect-[63/100]">
            <TarjetaBbva id={tarjeta} className="absolute inset-0 h-full w-full" />
            <span className="absolute inset-0 flex flex-col items-center justify-center rounded-md bg-gradient-to-b from-[#004481] to-[#001391] text-center text-[9px] font-bold leading-tight text-white">
              <Timer className="mb-0.5 h-3.5 w-3.5 text-[#85C8FF]" strokeWidth={2.2} />1 min
            </span>
          </div>
        </span>
        <span className="min-w-0 flex-1">
          <LogoBbva className="h-3.5" />
          <span className="mt-1 block text-sm font-bold text-[#070E46]">¿Tienes una tarjeta BBVA preaprobada?</span>
          <span className="block text-xs text-ink/65">Consulta con tu DNI en 1 minuto, sin costo.</span>
        </span>
        <span className="hidden shrink-0 items-center gap-1 rounded-lg bg-[#004481] px-3 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-[#001391] sm:inline-flex">
          Consultar <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} />
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-[#004481] sm:hidden" strokeWidth={2} />
      </a>
    );
  }

  if (variante === 'tarjeta') {
    return (
      <a
        href={HREF_BBVA}
        className={`group relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#070E46] via-[#004481] to-[#001391] p-6 text-white shadow-xl shadow-[#001391]/25 transition-transform hover:-translate-y-1 sm:flex-row sm:p-8 ${className}`}
      >
        <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#85C8FF]/25 blur-3xl" />
        <CarruselBbva className="h-44 w-40 shrink-0" />
        <div className="relative flex-1 text-center sm:text-left">
          <LogoBbva blanco className="mx-auto h-5 sm:mx-0" />
          <p className="mt-3 font-display text-2xl font-bold leading-tight">Hay una tarjeta BBVA para cada etapa</p>
          <p className="mt-2 text-sm text-white/80">Desde Visa Cero hasta Visa Infinite y Mastercard Black. Ingresa tu DNI y mira cuáles tienes preaprobadas con su línea de crédito.</p>
        </div>
        <span className="relative inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#85C8FF] px-5 text-sm font-semibold uppercase tracking-wide text-[#070E46] transition-colors group-hover:bg-white">
          Ver mis tarjetas <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.2} />
        </span>
      </a>
    );
  }

  // Hero de la home: mismo lenguaje que la sección «Mi primera tarjeta» de bbva.pe, con su animación oficial.
  return (
    <section className={`bg-paper px-3 py-10 md:px-5 md:py-14 ${className}`}>
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.25rem] bg-[#001391] px-6 py-10 text-white shadow-2xl shadow-[#001391]/30 md:rounded-[2.25rem] md:px-14 md:py-6">
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div className="md:py-8">
            <LogoBbva blanco className="h-6" />
            <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Tu tarjeta de crédito BBVA <span className="text-[#85C8FF]">te está esperando</span>
            </h2>
            <p className="mt-4 max-w-xl text-white/85">
              Consulta con tu DNI qué tarjetas tienes preaprobadas según tu perfil, con su línea de crédito y tasa. Eliges una y la solicitas directo con BBVA.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-white/85 sm:grid-cols-3">
              <li className="flex items-center gap-2"><Timer className="h-4 w-4 text-[#85C8FF]" strokeWidth={2} /> Respuesta al instante</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#85C8FF]" strokeWidth={2} /> Consulta segura</li>
              <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#85C8FF]" strokeWidth={2} /> Sin costo</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`${HREF_BBVA}#consulta`} className="inline-flex h-12 items-center rounded-xl bg-[#85C8FF] px-7 text-sm font-semibold text-[#070E46] transition-colors hover:bg-white">
                Obtenla aquí
              </a>
              <a href={`${HREF_BBVA}#tarjetas`} className="inline-flex h-12 items-center rounded-xl bg-[#070E46] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#004481]">
                Ver todas las tarjetas
              </a>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/bbva/tarjetas-animadas.webp" alt="Tarjetas de crédito BBVA Visa Bfree, Platinum y Signature" loading="lazy" className="mx-auto w-full max-w-md" />
        </div>
      </div>
    </section>
  );
}
