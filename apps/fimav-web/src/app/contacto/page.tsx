import BannerPagina from '@/components/BannerPagina';
import { MessageCircle, Phone, Mail, Navigation, ExternalLink } from 'lucide-react';
import BotonHex from '@/components/hex/BotonHex';
import Hexagono from '@/components/Hexagono';
import SeccionTitulo from '@/components/SeccionTitulo';
import FormContacto from '@/components/FormContacto';
import Reveal from '@/components/motion/Reveal';
import { getContacto, getPagina, waUrlDe } from '@/lib/cms';

export const metadata = { title: 'Contacto' };


const enlace = 'inline-flex min-h-11 items-center gap-2 font-medium text-carbon underline decoration-rojo decoration-2 underline-offset-4 hover:text-rojo-hondo break-words';
const tarjeta = 'group/card flex flex-col items-center rounded-3xl border border-carbon/15 bg-gris p-8 text-center motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:-translate-y-1 hover:border-rojo/60 hover:bg-white hover:shadow-[0_14px_30px_-12px_rgb(224_36_36/0.35)] focus-within:border-rojo/60';
const numero = 'mt-1 font-display text-2xl font-bold tracking-wide text-carbon';

export default async function ContactoPage() {
  const [c, contacto] = await Promise.all([getPagina('contacto'), getContacto()]);
  const lugar = encodeURIComponent(c.mapa.direccionMapa || contacto.direccion);
  const verMapa = `https://www.google.com/maps/search/?api=1&query=${lugar}`;
  const comoLlegar = `https://www.google.com/maps/dir/?api=1&destination=${lugar}`;
  const incrustado = `https://www.google.com/maps?q=${lugar}&output=embed`;
  const waUrl = (t: string) => waUrlDe(contacto.whatsapp, t);
  return (
    <main>
      <BannerPagina eyebrow={c.banner.eyebrow} titulo={c.banner.titulo} resaltado={c.banner.resaltado} imagen={c.banner.imagen} />

      <section className="bg-white py-16">
        <Reveal className="mx-auto max-w-6xl px-4 sm:px-6">
          <SeccionTitulo nivel="h2" eyebrow={c.datos.eyebrow} claro={c.datos.claro} rojo={c.datos.rojo} />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className={tarjeta}>
              <span className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover/card:scale-110"><Hexagono icono={Phone} tam={72} /></span>
              <h3 className="titulo-menor mt-5 text-xl text-carbon">Teléfono</h3>
              <a href={contacto.telefonoHref} className={`${enlace} ${numero} no-underline`}>{contacto.telefono}</a>
              <p className="mt-1 text-sm text-carbon">Llámanos y te atendemos.</p>
            </div>
            <div className={tarjeta}>
              <span className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover/card:scale-110"><Hexagono icono={MessageCircle} tam={72} /></span>
              <h3 className="titulo-menor mt-5 text-xl text-carbon">WhatsApp</h3>
              <a href={waUrl('Hola, quisiera información sobre una cotización.')} target="_blank" rel="noopener noreferrer" className={`${enlace} ${numero} no-underline`}>{contacto.whatsappVisible}<span className="sr-only"> (se abre en otra pestaña)</span></a>
              <p className="mt-1 text-sm text-carbon">Cotiza y consulta por chat.</p>
            </div>
            <div className={tarjeta}>
              <span className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover/card:scale-110"><Hexagono icono={Mail} tam={72} /></span>
              <h3 className="titulo-menor mt-5 text-xl text-carbon">Correos</h3>
              <p className="mt-2 text-sm text-carbon">Ventas</p>
              <a href={`mailto:${contacto.ventas}`} className={enlace}>{contacto.ventas}</a>
              <p className="mt-1 text-sm text-carbon">Comercial</p>
              <a href={`mailto:${contacto.comercial}`} className={enlace}>{contacto.comercial}</a>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="bg-gris py-16">
        <Reveal className="mx-auto max-w-6xl px-4 sm:px-6">
          <SeccionTitulo nivel="h2" eyebrow={c.mapa.eyebrow} claro={c.mapa.claro} rojo={c.mapa.rojo} />
          {/* Las opciones van DENTRO del mapa (siempre visibles, también en táctil); al pasar el cursor el marco se resalta y los botones suben un poco. */}
          <div className="group/mapa relative mt-8 h-96 overflow-hidden rounded-[2rem] border border-carbon/20 bg-white motion-safe:transition-all motion-safe:duration-300 hover:border-rojo/60 hover:shadow-[0_18px_40px_-16px_rgb(224_36_36/0.4)] focus-within:border-rojo/60 sm:h-[26rem]">
            <iframe src={incrustado} title={`Mapa: ubicación de Fimav Perú, ${c.mapa.direccionMapa || contacto.direccion}`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" className="size-full border-0 motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover/mapa:scale-[1.015]" />
            <div className="absolute inset-x-4 bottom-4 flex flex-col items-start gap-2 motion-safe:transition-transform motion-safe:duration-300 group-hover/mapa:-translate-y-1 group-focus-within/mapa:-translate-y-1 sm:flex-row sm:flex-wrap sm:items-center">
              <BotonHex href={verMapa} icono={ExternalLink} variante="rojo" size="sm">Abrir en Google Maps <span className="text-xs font-normal normal-case tracking-normal">(se abre en otra pestaña)</span></BotonHex>
              <BotonHex href={comoLlegar} icono={Navigation} variante="carbon" size="sm">Cómo llegar <span className="text-xs font-normal normal-case tracking-normal">(se abre en otra pestaña)</span></BotonHex>
            </div>
          </div>
          <p className="mt-3 text-sm text-carbon">Mapa proporcionado por Google.</p>
        </Reveal>
      </section>

      <section className="bg-white py-16">
        <Reveal className="mx-auto max-w-3xl px-4 sm:px-6">
          <SeccionTitulo nivel="h2" eyebrow={c.formulario.eyebrow} claro={c.formulario.claro} rojo={c.formulario.rojo} />
          <div className="mt-8"><FormContacto /></div>
        </Reveal>
      </section>
    </main>
  );
}
