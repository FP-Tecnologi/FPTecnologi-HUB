import { Mail, MessageCircle, Phone } from 'lucide-react';
import Reveal from './Reveal';
import { contacto, waUrl } from '@/lib/contenido';

/** Cierre de página: «¡Estamos listos!» con WhatsApp, teléfono y correo. */
export function CtaContacto({ id }: { id?: string }) {
  return (
    <section id={id} className="px-5 pb-24 sm:px-8">
      <Reveal efecto="zoom" className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-rojo to-rojo-hondo px-8 py-14 text-center text-white sm:px-14">
        <img loading="lazy" decoding="async" src="/fotos/silla-presidencial.webp" alt="" aria-hidden="true" className="pointer-events-none absolute right-6 top-1/2 -z-10 hidden w-48 -translate-y-1/2 rotate-6 drop-shadow-2xl lg:block" />
        <img loading="lazy" decoding="async" src="/fotos/trafico.webp" alt="" aria-hidden="true" className="pointer-events-none absolute -left-6 top-1/2 -z-10 -mt-5 -translate-y-1/2 hidden w-80 -rotate-12 lg:block" />
        <h2 className="text-[clamp(2rem,5vw,3.25rem)] font-extrabold text-white">¡Estamos listos!</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">Cuéntanos tu proyecto y te proponemos la solución precisa. Escríbenos y te atendemos de inmediato.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={waUrl('Hola Imaninki, quisiera más información.')} target="_blank" rel="noopener noreferrer" className="boton inline-flex h-13 items-center gap-2 rounded-xl bg-white px-6 font-semibold text-rojo-hondo shadow-lg shadow-tinta/25 hover:shadow-xl hover:shadow-tinta/35">
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
