import { CreditCard, ShieldCheck, Sparkles, Timer } from 'lucide-react';
import Reveal from '@/components/motion/Reveal';
import SeccionTitulo from '@/components/SeccionTitulo';
import BotonHex from '@/components/hex/BotonHex';
import { AbanicoBbva, HREF_BBVA, LogoBbva } from '@/components/bbva/Tarjetas';

/** Bloque de BBVA del inicio: de ancho completo y en azul BBVA, al final de la página, pegado al pie (sin hueco blanco).
 *  Debe ser el último hijo de <main>: el CSS del pie (globals.css) detecta `.banner-bbva:last-child` para quitar el margen. */
export default function TarjetasBbva() {
  return (
    <section aria-label="Tarjetas de crédito BBVA" className="banner-bbva relative overflow-hidden bg-gradient-to-r from-[#070E46] via-[#001391] to-[#004481] py-14 text-white lg:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 size-96 rounded-full bg-[#85C8FF]/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-[#1973e8]/30 blur-3xl" />
      <Reveal className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <LogoBbva blanco className="h-5" />
              <span className="rounded-full border border-white/25 px-3 py-1 font-display text-sm font-semibold uppercase tracking-[0.14em] text-[#85C8FF]">Fimav Perú · Aliado BBVA</span>
            </div>
            <SeccionTitulo nivel="h2" tam="md" claroSobreOscuro className="mt-6" eyebrow="Tarjetas de crédito" claro="Tu tarjeta BBVA" rojo="te está esperando" />
            <p className="mt-6 max-w-xl leading-relaxed text-white/90">
              Consulta con tu DNI qué tarjetas tienes preaprobadas según tu perfil, con su línea de crédito y tasa. Eliges una y la solicitas directo con BBVA.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-white/90">
              <li className="flex items-center gap-2"><Timer aria-hidden="true" size={18} className="text-[#85C8FF]" /> Respuesta al instante</li>
              <li className="flex items-center gap-2"><ShieldCheck aria-hidden="true" size={18} className="text-[#85C8FF]" /> Consulta segura</li>
              <li className="flex items-center gap-2"><Sparkles aria-hidden="true" size={18} className="text-[#85C8FF]" /> Sin costo</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-4">
              <BotonHex href={`${HREF_BBVA}#consulta`} variante="contorno" size="lg" icono={CreditCard}>Obtenla aquí</BotonHex>
            </div>
          </div>
          <AbanicoBbva className="mx-auto w-full max-w-sm" />
        </div>
      </Reveal>
    </section>
  );
}
