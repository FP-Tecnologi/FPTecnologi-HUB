import { getContacto, waUrlDe } from '@/lib/cms';
import { Mail, Phone } from 'lucide-react';
import Reveal from './Reveal';
import { mision, propuesta, vision, type Producto } from '@/lib/contenido';
import { IconoWhatsApp } from './WhatsApp';

const contenedor = 'mx-auto max-w-7xl px-5 sm:px-8';

/** «¿Quiénes somos?»: página negra del brochure con dos columnas justificadas y la ciudad en rojo al pie. */
export function Quienes({ texto, texto2 }: { texto: string; texto2: string }) {
  return (
    <section id="nosotros" className="fondo-negro relative isolate overflow-hidden pt-20 text-white sm:pt-24">
      <div className={contenedor}>
        <Reveal>
          <h2 className="text-[clamp(2rem,5vw,3.25rem)] font-extrabold tracking-tight !text-white">¿Quiénes somos?</h2>
          <span aria-hidden="true" className="rojo-filete mt-4 block h-1.5 w-24" />
        </Reveal>
        <div className="mt-10 grid gap-x-12 gap-y-6 text-justify text-[15px] leading-relaxed text-white/90 md:grid-cols-2">
          <Reveal efecto="izquierda"><p>{texto}</p><p className="mt-5">{propuesta[1]}</p></Reveal>
          <Reveal efecto="derecha" retraso={100}><p>{texto2}</p><p className="mt-5">{propuesta[2]}</p></Reveal>
        </div>
      </div>
      <img loading="lazy" decoding="async" src="/fotos/cumbre.webp" alt="" aria-hidden="true" className="mascara-sube mt-14 h-64 w-full object-cover opacity-80 sm:h-80" />
      <div aria-hidden="true" className="metal h-1.5" />
    </section>
  );
}

/** Misión y visión a dos columnas con títulos rojos en mayúsculas (página 2 del brochure). */
export function MisionVision({ mision: m = mision, vision: v = vision }: { mision?: string; vision?: string } = {}) {
  return (
    <section className="py-20 sm:py-24">
      <div className={`${contenedor} grid gap-14 md:grid-cols-2`}>
        {[['Misión', m], ['Visión', v]].map(([t, d], i) => (
          <Reveal key={t} efecto={i ? 'derecha' : 'izquierda'}>
            <h2 className="text-4xl font-black uppercase tracking-tight !text-rojo-hondo sm:text-5xl">{t}</h2>
            <span aria-hidden="true" className="rojo-filete mt-4 block h-1.5 w-20" />
            <p className="mt-6 text-justify leading-relaxed text-carbon">{d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** «¡Estamos listos!»: el cierre negro del brochure con barra roja y el mensaje de servicio. */
export function Listos({ textos = propuesta }: { textos?: string[] } = {}) {
  return (
    <section className="fondo-negro relative isolate overflow-hidden text-white">
      <img loading="lazy" decoding="async" src="/icon.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -right-20 top-10 -z-10 w-[26rem] opacity-[0.06]" />
      <div className={`${contenedor} grid items-end gap-6 pt-16 md:grid-cols-[0.8fr_1.2fr]`}>
        <Reveal efecto="izquierda" className="order-2 md:order-1">
          <img loading="lazy" decoding="async" src="/fotos/ejecutivo.webp" alt="Asesor comercial de Imaninki con tablet" className="mx-auto max-h-[26rem] w-auto" />
        </Reveal>
        <Reveal efecto="derecha" className="order-1 pb-6 md:order-2 md:pb-16">
          <h2 className="text-[clamp(2.4rem,6.5vw,4.75rem)] font-black uppercase leading-[0.95] tracking-tight !text-rojo-claro">¡Estamos<br />listos!</h2>
          <p className="mt-6 max-w-xl text-justify leading-relaxed text-white/90">{textos[0]}</p>
        </Reveal>
      </div>
      <div className="banda-roja h-5" />
      <div className="bg-black">
        <p className={`${contenedor} py-8 text-justify text-sm leading-relaxed text-white/90`}>{textos[1]} {textos[2]}</p>
      </div>
    </section>
  );
}

/** Producto en banda roja con el envase saliéndose de ella, como las páginas de pinturas del brochure. */
export function BandaProducto({ p, i }: { p: Producto; i: number }) {
  const inv = i % 2 === 1;
  return (
    <Reveal efecto={inv ? 'derecha' : 'izquierda'} className="relative py-8 md:py-10">
      <article className="group relative">
        <div aria-hidden="true" className={`${inv ? 'banda-roja-inv' : 'banda-roja'} absolute inset-x-0 inset-y-8 md:inset-y-6`} />
        <div className={`relative grid items-center gap-4 px-6 sm:px-10 md:grid-cols-[1.15fr_0.85fr] ${inv ? 'md:[&>*:first-child]:order-2' : ''}`}>
          <div className="pt-10 text-white md:py-12">
            <span className="text-sm font-bold text-white/70">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="mt-1 text-2xl font-extrabold !text-white sm:text-3xl">{p.nombre}</h3>
            <p className="mt-4 text-justify text-[15px] leading-relaxed text-white/90">{p.descripcion}</p>
          </div>
          <div className="relative z-10 -mt-4 grid place-items-center md:mt-0">
            <img decoding="async" loading="lazy" src={p.img} alt={p.nombre} className="max-h-72 w-auto max-w-full object-contain drop-shadow-[0_24px_30px_rgb(0_0_0/0.45)] transition-transform duration-700 group-hover:-translate-y-2 group-hover:scale-105 md:max-h-80 md:scale-[1.15]" />
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/** Cierre: bloque negro con la etiqueta CONTACTO roja y los canales de atención comercial. */
export async function CtaContacto({ id }: { id?: string }) {
  const contacto = await getContacto();
  const waUrl = (t: string) => waUrlDe(contacto.whatsapp, t);
  const item = 'boton inline-flex min-h-13 items-center gap-3 border border-white/25 px-5 py-3 font-semibold text-white hover:border-rojo hover:bg-rojo';
  return (
    <section id={id} className="fondo-negro relative isolate overflow-hidden text-white">
      <div aria-hidden="true" className="metal h-1.5" />
      <img loading="lazy" decoding="async" src="/icon.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -left-16 -top-10 -z-10 w-80 opacity-[0.07]" />
      <div className={`${contenedor} grid items-center gap-10 py-16 md:grid-cols-[auto_1fr]`}>
        <Reveal efecto="zoom">
          <div className="inline-block rounded-md bg-rojo px-8 py-7 text-center shadow-2xl shadow-black/40">
            <img src="/brand/imaninki-blanco.svg" alt="" aria-hidden="true" className="mx-auto h-9 w-auto" />
            <p className="mt-4 rounded-sm bg-white px-6 py-1.5 text-lg font-black uppercase tracking-wide text-rojo-hondo">Contacto</p>
          </div>
        </Reveal>
        <Reveal retraso={100}>
          <h2 className="text-[clamp(1.8rem,4.5vw,3rem)] font-extrabold !text-white">Atención <span className="text-rojo-claro">comercial</span></h2>
          <p className="mt-3 max-w-xl text-white/85">Cuéntanos tu proyecto y te proponemos la solución precisa. Escríbenos y te atendemos de inmediato.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={waUrl('Hola Imaninki, quisiera más información.')} target="_blank" rel="noopener noreferrer" className={`${item} border-rojo bg-rojo`}><IconoWhatsApp className="size-5"/>WhatsApp</a>
            <a href={contacto.telefonoHref} className={item}><Phone aria-hidden="true" size={18} />{contacto.telefono}</a>
            <a href={`mailto:${contacto.correo}`} className={item}><Mail aria-hidden="true" size={18} />{contacto.correo}</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
