import { CreditCard, ShieldCheck, Sparkles, Timer } from 'lucide-react';
import Reveal from '@/components/motion/Reveal';
import SeccionTitulo from '@/components/SeccionTitulo';
import BotonHex from '@/components/hex/BotonHex';
import { AbanicoBbva, HREF_BBVA, LogoBbva } from '@/components/bbva/Tarjetas';

/** Bloque del inicio que lleva a /tarjetas-bbva (consulta de tarjetas BBVA preaprobadas). */
export default function TarjetasBbva() {
  return (
    <section className="bg-gris py-16 lg:py-24">
      <Reveal className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#070E46] via-[#001391] to-[#004481] px-6 py-10 text-white sm:px-10 lg:px-14">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 size-96 rounded-full bg-[#85C8FF]/20 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
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
        </div>
      </Reveal>
    </section>
  );
}
