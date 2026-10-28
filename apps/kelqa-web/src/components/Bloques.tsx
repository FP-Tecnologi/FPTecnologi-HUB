import { Mail, MessageCircle, Phone } from 'lucide-react';
import Reveal from './Reveal';
import { clientes, contacto, waUrl } from '@/lib/contenido';

/** Franja de logos de clientes. */
export function Clientes({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-center text-sm font-semibold text-carbon/70">Empresas que confían en Kelqa</p>
      <ul className="mt-6 grid grid-cols-2 items-center gap-4 sm:grid-cols-4">
        {clientes.map((c, i) => (
          <Reveal as="li" efecto="zoom" key={c.nombre} retraso={i * 90}>
            <div className="tarjeta group grid h-24 place-items-center rounded-2xl border border-kelqa/10 bg-white px-6 shadow-md shadow-kelqa-hondo/5">
              <img src={c.logo} alt={c.nombre} loading="lazy" className="max-h-14 w-auto max-w-full object-contain opacity-70 grayscale transition duration-500 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0" />
            </div>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

/** Cierre de página: «¡Estamos listos!» con WhatsApp, teléfono y correo. */
export function CtaContacto({ id }: { id?: string }) {
  return (
    <section id={id} className="px-5 pb-24 sm:px-8">
      <Reveal efecto="zoom" className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-kelqa to-kelqa-hondo px-8 py-14 text-center text-white sm:px-14">
        <img src="/fotos/silla-presidencial.webp" alt="" aria-hidden="true" className="flotar pointer-events-none absolute right-6 top-1/2 -z-10 hidden w-48 -translate-y-1/2 rotate-6 drop-shadow-2xl lg:block" style={{ animationDelay: '-3s' }} />
        <img src="/fotos/trafico.webp" alt="" aria-hidden="true" className="flotar pointer-events-none absolute -left-6 top-1/2 -z-10 -mt-5 -translate-y-1/2 hidden w-80 -rotate-12 lg:block" />
        <h2 className="text-[clamp(2rem,5vw,3.25rem)] font-extrabold text-white">¡Estamos listos!</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">Cuéntanos tu proyecto y te proponemos la solución precisa. Escríbenos y te atendemos de inmediato.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={waUrl('Hola Kelqa, quisiera más información.')} target="_blank" rel="noopener noreferrer" className="boton inline-flex h-13 items-center gap-2 rounded-xl bg-white px-6 font-semibold text-kelqa-hondo shadow-lg shadow-tinta/25 hover:shadow-xl hover:shadow-tinta/35">
            <MessageCircle aria-hidden="true" size={20} className="icono-sacude" />WhatsApp
          </a>
          <a href={contacto.telefonoHref} className="boton inline-flex h-13 items-center gap-2 rounded-xl border border-white/40 px-6 font-semibold hover:bg-white/10">
            <Phone aria-hidden="true" size={18} className="icono-sacude" />{contacto.telefono}
          </a>
          <a href={`mailto:${contacto.correo}`} className="boton inline-flex h-13 items-center gap-2 rounded-xl border border-white/40 px-6 font-semibold hover:bg-white/10">
            <Mail aria-hidden="true" size={18} className="icono-sacude" />{contacto.correo}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
