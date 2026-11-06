import type { Metadata } from 'next';
import { AtSign, ChevronDown, Landmark, Mail, Phone } from 'lucide-react';
import Banner from '@/components/Banner';
import FormContacto from '@/components/FormContacto';
import Reveal from '@/components/Reveal';
import Titulo from '@/components/Titulo';
import { IconoWhatsApp } from '@/components/WhatsApp';
import JsonLd from '@/components/JsonLd';
import { meta, migas } from '@/lib/seo';
import { getPagina } from '@/lib/cms';
import { contacto, waUrl } from '@/lib/contenido';

export const metadata: Metadata = meta('Contacto', 'Escríbenos por WhatsApp, llámanos o déjanos tu mensaje. Atendemos venta directa y licitaciones públicas y privadas en todo el Perú.', '/contacto');

const contenedor = 'mx-auto max-w-7xl px-5 sm:px-8';

const CANALES = [
  { titulo: 'WhatsApp', valor: contacto.telefono, href: waUrl('Hola Imaninki, quisiera más información.'), externo: true, Icono: null },
  { titulo: 'Teléfono', valor: contacto.telefono, href: contacto.telefonoHref, Icono: Phone },
  { titulo: 'Correo', valor: contacto.correo, href: `mailto:${contacto.correo}`, Icono: Mail },
  { titulo: 'Redes sociales', valor: `${contacto.redes} en redes sociales`, Icono: AtSign },
];

export default async function Contacto() {
  const { banner, preguntas } = await getPagina('contacto');
  const jsonPreguntas = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: preguntas.items.map((q) => ({ '@type': 'Question', name: q.p, acceptedAnswer: { '@type': 'Answer', text: q.r } })) };
  return (
    <main id="contenido">
      <JsonLd datos={[migas([{ nombre: 'Contacto', ruta: '/contacto' }]), jsonPreguntas]} />
      <Banner miga="Contacto" titulo={banner.titulo} acento={banner.acento} texto={banner.texto} foto="/fotos/obrero-casco.webp" />

      <section className="py-20 sm:py-24">
        <div className={`${contenedor} grid gap-12 lg:grid-cols-[0.85fr_1.15fr]`}>
          <Reveal efecto="izquierda">
            <Titulo etiqueta="Canales" solido="Hablemos de" acento="tu proyecto" />
            <ul className="mt-8 grid gap-3">
              {CANALES.map(({ titulo, valor, href, externo, Icono }) => {
                const interior = (
                  <>
                    <span className="icono-caja grid size-12 shrink-0 place-items-center rounded-md bg-rojo text-white shadow-md shadow-rojo-hondo/25">
                      {Icono ? <Icono aria-hidden="true" size={22} /> : <IconoWhatsApp className="size-6" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold uppercase tracking-[0.14em] text-rojo-hondo">{titulo}</span>
                      <span className="block break-words font-semibold text-tinta">{valor}</span>
                    </span>
                  </>
                );
                const clase = 'tarjeta group flex items-center gap-4 rounded-md border border-rojo/10 bg-white p-4 shadow-md shadow-rojo-hondo/5';
                return (
                  <li key={titulo}>
                    {href ? (
                      <a href={href} {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={clase}>{interior}</a>
                    ) : (
                      <div className={clase}>{interior}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex items-start gap-4 rounded-md bg-tinta p-5 text-white">
              <Landmark aria-hidden="true" size={24} className="mt-0.5 shrink-0 text-rojo-claro" />
              <p className="text-sm leading-relaxed text-white/85">
                <b className="text-white">Ventas directas y licitaciones públicas y privadas.</b> Encuentra todas nuestras fichas en Perú Compras.
              </p>
            </div>
          </Reveal>
          <Reveal efecto="derecha" retraso={120}>
            <h2 className="text-2xl font-extrabold">Déjanos tu mensaje</h2>
            <p className="mb-6 mt-2 text-carbon/80">Los campos con <span className="text-rojo">*</span> son obligatorios.</p>
            <FormContacto />
          </Reveal>
        </div>
      </section>

      {/* Preguntas frecuentes (web anterior) */}
      <section className="bg-niebla py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Reveal><Titulo centro etiqueta={preguntas.etiqueta} solido={preguntas.titulo} acento={preguntas.acento} /></Reveal>
          <div className="mt-12 grid gap-3">
            {preguntas.items.map((q, i) => (
              <Reveal key={q.p} retraso={i * 70}>
                <details className="group rounded-md bg-white shadow-md shadow-rojo-hondo/5 ring-1 ring-rojo/10 transition duration-300 open:shadow-lg open:shadow-rojo-hondo/10 open:ring-rojo/25" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center gap-4 p-5 font-titulo font-bold text-tinta transition-colors hover:text-rojo-hondo [&::-webkit-details-marker]:hidden">
                    <span className="flex-1">{q.p}</span>
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-rojo/10 text-rojo-hondo transition duration-300 group-open:rotate-180 group-open:bg-rojo group-open:text-white">
                      <ChevronDown aria-hidden="true" size={18} />
                    </span>
                  </summary>
                  <p className="px-5 pb-5 leading-relaxed text-carbon/85">{q.r}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
