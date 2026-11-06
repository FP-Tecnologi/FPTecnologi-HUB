import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgePercent, Headset, ShieldCheck, Truck } from 'lucide-react';
import Reveal from '@/components/Reveal';
import Titulo from '@/components/Titulo';
import { CtaContacto, Listos, Quienes } from '@/components/Bloques';
import { lineas, razones, waUrl } from '@/lib/contenido';
import { getPagina } from '@/lib/cms';
import { IconoWhatsApp } from '@/components/WhatsApp';

export const metadata: Metadata = {
  title: { absolute: 'Imaninki — Pinturas, mobiliario y construcción en Perú' },
  description: 'Imaninki ofrece pinturas, mobiliario corporativo y productos para construcción y emergencia en todo el Perú. Venta directa, licitaciones y fichas en Perú Compras.',
  alternates: { canonical: '/', languages: { 'es-PE': '/' } },
};

const ICONOS_RAZON = [ShieldCheck, BadgePercent, Truck, Headset];
const contenedor = 'mx-auto max-w-7xl px-5 sm:px-8';
const retraso = (ms: number) => ({ '--retraso': `${ms}ms` }) as React.CSSProperties;

export default async function Inicio() {
  const { hero, quienes, porque, canales } = await getPagina('inicio');
  // «construcción e industria» → «construcción» en blanco y «e industria» en rojo, como la portada del brochure.
  const [a1, a2] = hero.acento.split(/ (?=e )/);
  return (
    <main id="contenido">
      {/* PORTADA */}
      <section id="inicio" className="fondo-negro relative isolate overflow-hidden text-white">
        <img loading="lazy" decoding="async" src="/icon.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -left-24 top-32 -z-10 w-[30rem] opacity-[0.06]" />
        <div className={`${contenedor} pt-28 text-center sm:pt-32`}>
          <img fetchPriority="high" decoding="async" src="/icon.svg" alt="" aria-hidden="true" className="entrada flotar mx-auto w-24 drop-shadow-[0_0_38px_rgb(225_29_46/0.6)] sm:w-32" />
          <img decoding="async" src="/brand/marca.svg" alt="Imaninki" width="400" height="100" className="entrada mx-auto mt-6 h-12 w-auto sm:h-16" style={retraso(100)} />
          <p className="entrada mt-10 text-xl font-bold uppercase tracking-[0.12em] sm:text-3xl" style={retraso(200)}>{hero.titulo}</p>
          <h1 className="entrada mt-1 text-[clamp(2.4rem,9.5vw,6.5rem)] font-black uppercase leading-[0.98] tracking-tight !text-white" style={retraso(280)}>{a1}</h1>
          {a2 && <p className="entrada text-[clamp(2.2rem,8.5vw,5.8rem)] font-black uppercase leading-[0.98] tracking-tight text-rojo-claro [text-shadow:0_4px_30px_rgb(225_29_46/0.35)]" style={retraso(360)}>{a2}</p>}
          <p className="entrada mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/85" style={retraso(440)}>{hero.texto}</p>
          <p className="entrada mt-4 text-sm font-bold uppercase tracking-[0.2em] text-rojo-claro" style={retraso(480)}>Hecho en Perú, hecho para durar</p>
          <div className="entrada mt-9 flex flex-wrap justify-center gap-3" style={retraso(520)}>
            <a href={waUrl('Hola Imaninki, quisiera cotizar productos para mi proyecto.')} target="_blank" rel="noopener noreferrer" className="boton inline-flex h-13 items-center gap-2 rounded-md bg-rojo px-7 font-bold uppercase tracking-wide text-white shadow-lg shadow-rojo/30 hover:bg-rojo-hondo">
              <IconoWhatsApp className="icono-sacude size-5"/>Cotizar ahora
            </a>
            <a href="#lineas" className="boton inline-flex h-13 items-center gap-2 rounded-md border border-white/35 px-7 font-bold uppercase tracking-wide text-white hover:bg-white hover:text-tinta">
              Ver líneas <ArrowRight aria-hidden="true" size={18} className="icono-avanza" />
            </a>
          </div>
        </div>
        {/* Collage diagonal con filetes plata y rojo, como la portada del brochure. */}
        <div className="collage relative mt-14 h-[17rem] sm:h-[26rem]" aria-hidden="true">
          <img loading="lazy" decoding="async" src="/fotos/obra.webp" alt="" className="foto-a size-full object-cover" />
          <div className="filete-r rojo-filete" />
          <div className="filete-p metal" />
          <img loading="lazy" decoding="async" src="/fotos/trafico-banner.webp" alt="" className="foto-b size-full object-cover object-[50%_65%]" />
        </div>
        <div aria-hidden="true" className="metal h-1.5" /><div aria-hidden="true" className="rojo-filete h-1.5" />
      </section>

      {/* QUIÉNES SOMOS */}
      <Quienes texto={quienes.texto} texto2={quienes.texto2} />

      {/* LÍNEAS: portadas de línea a foto completa */}
      <section id="lineas" className="py-20 sm:py-24">
        <div className={contenedor}>
          <Reveal><Titulo etiqueta="Nuestras líneas" solido="Soluciones para" acento="cada proyecto" /></Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {lineas.map((l, i) => (
              <Reveal key={l.id} retraso={i * 110}>
                <Link href={`/lineas/${l.id}`} id={l.id} className="group relative isolate flex min-h-[30rem] flex-col justify-end overflow-hidden bg-tinta p-7 text-white">
                  <img loading="lazy" decoding="async" src={l.foto} alt="" className="foto-zoom absolute inset-0 -z-20 size-full object-cover" />
                  <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(13_13_14/0.95)_8%,rgb(13_13_14/0.35)_55%,rgb(13_13_14/0.1))]" />
                  <span className="absolute left-0 top-0 rounded-br-md bg-rojo px-4 py-2 text-sm font-black tracking-wider">0{i + 1}</span>
                  <h3 className="text-2xl font-extrabold leading-tight !text-white">{l.nombre}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">{l.lema}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-rojo-claro">{l.productos.map((p) => p.nombre.replace(/^(Línea|Pintura) /, '')).join(' · ')}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide">Ver línea <ArrowRight aria-hidden="true" size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" /></span>
                  <span aria-hidden="true" className="rojo-filete absolute inset-x-0 bottom-0 h-1.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TRÁFICO: banner de la línea vial */}
      <section className="relative isolate overflow-hidden text-white">
        <img loading="lazy" decoding="async" src="/fotos/vial-obra.webp" alt="" className="absolute inset-0 -z-20 size-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(13_13_14/0.92)_20%,rgb(13_13_14/0.45)_100%)]" />
        <div className={`${contenedor} grid items-center gap-8 py-20 md:grid-cols-[1.2fr_0.8fr]`}>
          <Reveal efecto="izquierda">
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-[1.02] tracking-tight !text-white">Imaninki <span className="text-[#ffc400]">Tráfico</span>:<br />la línea que define <span className="text-rojo-claro">tu camino</span></h2>
            <p className="mt-5 max-w-lg text-white/90">Máxima visibilidad, gran adherencia y brillo duradero para carreteras, estacionamientos y zonas urbanas.</p>
            <Link href="/lineas/pinturas" className="boton mt-7 inline-flex h-12 items-center gap-2 rounded-md bg-rojo px-6 font-bold uppercase tracking-wide hover:bg-rojo-hondo">Ver pinturas <ArrowRight aria-hidden="true" size={18} className="icono-avanza" /></Link>
          </Reveal>
          <Reveal efecto="zoom" className="justify-self-center">
            <img loading="lazy" decoding="async" src="/fotos/trafico.webp" alt="Pintura vial Imaninki Tráfico" className="max-h-80 w-auto drop-shadow-[0_24px_30px_rgb(0_0_0/0.6)]" />
          </Reveal>
        </div>
      </section>

      {/* POR QUÉ */}
      <section className="py-20 sm:py-24">
        <div className={contenedor}>
          <Reveal><Titulo etiqueta={porque.etiqueta} solido={porque.titulo} acento={porque.acento} /></Reveal>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed">{porque.texto}</p>
          <ul className="mt-12 grid gap-px bg-carbon/15 sm:grid-cols-2 lg:grid-cols-4">
            {razones.map((r, i) => {
              const Icono = ICONOS_RAZON[i];
              return (
                <Reveal as="li" key={r.titulo} retraso={i * 90} className="bg-white">
                  <div className="group h-full border-t-4 border-rojo p-7 transition-colors duration-300 hover:bg-tinta hover:text-white">
                    <Icono aria-hidden="true" size={30} className="text-rojo" />
                    <h3 className="mt-5 text-lg font-extrabold transition-colors group-hover:!text-white">{r.titulo}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-carbon/85 transition-colors group-hover:text-white/80">{r.texto}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* CANALES DE VENTA: banda roja */}
      <section className="banda-roja relative isolate overflow-hidden text-white">
        <img loading="lazy" decoding="async" src="/icon.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 -z-10 w-96 opacity-[0.12] brightness-[3] grayscale" />
        <div className={`${contenedor} grid items-center gap-8 py-16 md:grid-cols-[1.4fr_0.6fr]`}>
          <Reveal efecto="izquierda">
            <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-white/85"><span aria-hidden="true" className="cubito" />{canales.etiqueta}</p>
            <h2 className="mt-3 text-[clamp(1.9rem,4.4vw,3rem)] font-extrabold leading-tight !text-white">{canales.titulo} {canales.acento}</h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/90">{canales.texto}</p>
          </Reveal>
          <Reveal efecto="derecha" className="md:justify-self-end">
            <a href={waUrl('Hola Imaninki, represento a una entidad y quisiera información sobre licitaciones o Perú Compras.')} target="_blank" rel="noopener noreferrer" className="boton inline-flex h-13 items-center gap-2 rounded-md bg-white px-7 font-bold uppercase tracking-wide text-rojo-hondo shadow-xl shadow-black/30">
              <IconoWhatsApp className="icono-sacude size-5"/>{canales.boton}
            </a>
          </Reveal>
        </div>
        <div aria-hidden="true" className="metal h-1.5" />
      </section>

      <Listos />
      <CtaContacto id="contacto" />
    </main>
  );
}
