import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgePercent, Headset, MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import Reveal from '@/components/Reveal';
import Titulo from '@/components/Titulo';
import { CtaContacto } from '@/components/Bloques';
import { lineas, razones, valores, waUrl } from '@/lib/contenido';
import { getPagina } from '@/lib/cms';

export const metadata: Metadata = {
  title: { absolute: 'Imaninki — Soluciones en construcción e industria: pinturas, mobiliario y más' },
  description: 'Imaninki ofrece pinturas, mobiliario corporativo y productos para construcción y emergencia en todo el Perú. Venta directa, licitaciones y fichas en Perú Compras.',
  alternates: { canonical: '/', languages: { 'es-PE': '/' } },
};

const ICONOS_RAZON = [ShieldCheck, BadgePercent, Truck, Headset];
const contenedor = 'mx-auto max-w-7xl px-5 sm:px-8';
const botonPrimario = 'boton inline-flex h-13 items-center gap-2 rounded-xl bg-rojo px-6 font-semibold text-white shadow-lg shadow-rojo-hondo/35 hover:bg-rojo-hondo hover:shadow-xl hover:shadow-rojo-hondo/45';
const retraso = (ms: number) => ({ '--retraso': `${ms}ms` }) as React.CSSProperties;

export default async function Inicio() {
  const { hero, quienes, porque, canales } = await getPagina('inicio');
  return (
    <main id="contenido">
      {/* HERO */}
      <section id="inicio" className="relative isolate overflow-hidden bg-tinta text-white">
        <img fetchPriority="high" decoding="async" src="/fotos/cumbre.webp" alt="" className="absolute inset-0 -z-20 size-full -scale-x-100 object-cover object-[35%_center]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--color-tinta)_10%,rgb(13_13_14/0.82)_45%,rgb(140_14_26/0.45)_100%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-tinta to-transparent" />
        {/* Marca de agua: el ícono del logo, como en la portada del brochure. */}
        <img loading="lazy" decoding="async" src="/icon.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 -z-10 w-[26rem] opacity-[0.07] grayscale brightness-[3]" />

        <div className={`${contenedor} grid min-h-[100svh] grid-cols-1 items-center gap-12 pb-20 pt-32 lg:grid-cols-[1.15fr_0.85fr]`}>
          <div>
            <p className="entrada inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-rojo-claro backdrop-blur">
              <span aria-hidden="true" className="size-2 rounded-[3px] bg-current" />{hero.etiqueta}
            </p>
            <h1 className="entrada mt-6 text-[clamp(2.6rem,7vw,5rem)] font-extrabold leading-[1.02] tracking-tight text-white" style={retraso(120)}>
              {hero.titulo} <span className="titulo-brillo titulo-brillo-claro">{hero.acento}</span>
            </h1>
            <p className="entrada mt-6 max-w-xl text-lg leading-relaxed text-white/85" style={retraso(240)}>
              {hero.texto}
            </p>
            <div className="entrada mt-9 flex flex-wrap gap-3" style={retraso(360)}>
              <a href={waUrl('Hola Imaninki, quisiera cotizar productos para mi proyecto.')} target="_blank" rel="noopener noreferrer" className={botonPrimario}>
                <MessageCircle aria-hidden="true" size={20} className="icono-sacude" />Cotizar ahora
              </a>
              <a href="#lineas" className="boton inline-flex h-13 items-center gap-2 rounded-xl border border-white/30 px-6 font-semibold text-white backdrop-blur hover:bg-white hover:text-tinta">
                Ver líneas <ArrowRight aria-hidden="true" size={18} className="icono-avanza" />
              </a>
            </div>
            <ul className="entrada mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75" style={retraso(480)}>
              {['Venta directa', 'Licitaciones públicas y privadas', 'Fichas en Perú Compras'].map((t) => (
                <li key={t} className="flex items-center gap-2"><span aria-hidden="true" className="size-1.5 rounded-[2px] bg-rojo-claro" />{t}</li>
              ))}
            </ul>
          </div>

          {/* Acceso rápido a las tres líneas. */}
          <nav aria-label="Líneas de producto" className="entrada self-end rounded-[2rem] border border-white/15 bg-white/[0.07] p-3 backdrop-blur-md" style={retraso(420)}>
            <p className="px-3 pb-2 pt-2 text-xs font-bold uppercase tracking-[0.18em] text-white/70">Tres líneas, un mismo estándar</p>
            <ul className="grid gap-2">
              {lineas.map((l, i) => (
                <li key={l.id} className="entrada" style={retraso(560 + i * 110)}>
                  <Link href={`/lineas/${l.id}`} className="group flex items-center gap-4 rounded-2xl bg-white/[0.06] p-3 transition duration-300 hover:translate-x-1 hover:bg-white hover:text-tinta">
                    <span className="icono-caja grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-white to-niebla">
                      <img loading="lazy" decoding="async" src={l.productos[0].img} alt="" className="h-16 w-16 object-contain transition-transform duration-500 group-hover:scale-110" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-rojo-claro group-hover:text-rojo-hondo">0{i + 1}</span>
                      <b className="block font-titulo text-lg leading-tight">{l.nombre}</b>
                      <span className="block truncate text-sm text-white/70 group-hover:text-carbon">{l.productos.map((p) => p.nombre.replace(/^(Línea|Pintura) /, '')).join(' · ')}</span>
                    </span>
                    <span className="mr-1 grid size-9 shrink-0 place-items-center rounded-full border border-white/20 transition duration-300 group-hover:border-rojo group-hover:bg-rojo group-hover:text-white">
                      <ArrowRight aria-hidden="true" size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* NOSOTROS */}
      <section id="nosotros" className="py-24 sm:py-28">
        <div className={`${contenedor} grid items-center gap-14 lg:grid-cols-2`}>
          <Reveal efecto="izquierda" className="group relative">
            <div className="overflow-hidden rounded-[2rem] rounded-tr-[6rem] shadow-2xl shadow-rojo-hondo/25">
              <img loading="lazy" decoding="async" src="/fotos/equipo.webp" alt="Equipo de obra revisando planos de un proyecto" className="foto-zoom aspect-[4/3.4] w-full object-cover" />
            </div>
            <div className="absolute -bottom-8 left-6 right-6 rounded-2xl bg-tinta p-5 text-white shadow-xl shadow-tinta/30 sm:left-auto sm:w-72">
              <p className="font-titulo text-lg font-bold leading-snug">Aliado estratégico en cada etapa de tu proyecto</p>
              <span aria-hidden="true" className="mt-3 block h-1 w-12 rounded-full bg-rojo transition-all duration-500 group-hover:w-24" />
            </div>
          </Reveal>
          <Reveal efecto="derecha" retraso={120} className="pt-6 lg:pt-0">
            <Titulo etiqueta={quienes.etiqueta} solido={quienes.titulo} acento={quienes.acento} />
            <p className="mt-6 text-lg leading-relaxed">
              {quienes.texto}
            </p>
            <p className="mt-4 leading-relaxed text-carbon/85">
              {quienes.texto2}
            </p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {valores.map((v, i) => (
                <Reveal as="li" efecto="zoom" key={v} retraso={200 + i * 80} className="group inline-flex cursor-default items-center gap-2 rounded-xl border border-rojo/20 bg-rojo/5 px-4 py-2 text-sm font-semibold text-rojo-hondo transition-colors hover:border-rojo hover:bg-rojo hover:text-white">
                  <span aria-hidden="true" className="size-2 rounded-[3px] bg-rojo transition duration-500 group-hover:rotate-45 group-hover:bg-white" />{v}
                </Reveal>
              ))}
            </ul>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ['Misión', quienes.mision],
                ['Visión', quienes.vision],
              ].map(([t, d]) => (
                <div key={t} className="group rounded-2xl bg-niebla p-5 ring-1 ring-transparent transition duration-500 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-rojo-hondo/10 hover:ring-rojo/15">
                  <h3 className="text-base font-bold transition-colors duration-500 group-hover:text-rojo-hondo">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-carbon/85">{d}</p>
                </div>
              ))}
            </div>
            <Link href="/nosotros" className="boton mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-rojo/10 px-5 font-semibold text-rojo-hondo hover:bg-rojo/20">
              Conoce más de Imaninki <ArrowRight aria-hidden="true" size={18} className="icono-avanza" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* LÍNEAS */}
      <section id="lineas" className="bg-niebla py-24 sm:py-28">
        <div className={contenedor}>
          <Reveal>
            <Titulo centro etiqueta="Nuestras líneas" solido="Soluciones para" acento="cada proyecto" />
          </Reveal>
          <div className="mt-14 grid gap-10">
            {lineas.map((l, i) => (
              <Reveal key={l.id} efecto={i % 2 ? 'derecha' : 'izquierda'}>
                <article id={l.id} className={`grid overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-rojo-hondo/10 transition-shadow duration-500 hover:shadow-2xl hover:shadow-rojo-hondo/25 ${i % 2 ? 'lg:grid-cols-[1.25fr_0.75fr]' : 'lg:grid-cols-[0.75fr_1.25fr]'}`}>
                  <div className={`group relative isolate flex min-h-80 flex-col justify-end overflow-hidden p-8 text-white ${i % 2 ? 'lg:order-2' : ''}`}>
                    <img loading="lazy" decoding="async" src={l.foto} alt="" className="foto-zoom absolute inset-0 -z-20 size-full object-cover" />
                    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-tinta via-tinta/55 to-tinta/0" />
                    <span className="font-titulo text-6xl font-extrabold text-white/25 transition duration-500 group-hover:-translate-y-1 group-hover:text-rojo-claro/60">0{i + 1}</span>
                    <h3 className="mt-1 text-3xl font-extrabold text-white">{l.nombre}</h3>
                    <p className="mt-2 max-w-sm text-white/85">{l.lema}</p>
                  </div>
                  <div className="p-6 sm:p-10">
                    <p className="leading-relaxed text-carbon/90">{l.texto}</p>
                    <ul className="mt-7 grid gap-4 sm:grid-cols-2">
                      {l.productos.slice(0, 4).map((p, j) => (
                        <Reveal as="li" efecto="zoom" key={p.nombre} retraso={150 + j * 90} className="group sm:[&:last-child:nth-child(odd)]:col-span-2">
                          <div className="tarjeta flex h-full items-center gap-4 rounded-2xl bg-niebla p-3 hover:bg-white">
                            <span className="icono-caja grid size-24 shrink-0 place-items-center rounded-xl bg-white">
                              <img decoding="async" src={p.img} alt="" loading="lazy" className="max-h-20 max-w-20 object-contain drop-shadow-lg transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110" />
                            </span>
                            <span>
                              <h4 className="font-titulo font-bold leading-tight text-tinta transition-colors group-hover:text-rojo-hondo">{p.nombre}</h4>
                              <p className="mt-1 text-sm leading-snug text-carbon/80">{p.detalle}</p>
                            </span>
                          </div>
                        </Reveal>
                      ))}
                    </ul>
                    <div className="mt-7 flex flex-wrap gap-3">
                      <Link href={`/lineas/${l.id}`} className="boton inline-flex h-11 items-center gap-2 rounded-xl bg-rojo px-5 font-semibold text-white shadow-md shadow-rojo-hondo/25 hover:bg-rojo-hondo">
                        Ver línea completa <ArrowRight aria-hidden="true" size={18} className="icono-avanza" />
                      </Link>
                      <a href={waUrl(`Hola Imaninki, quisiera cotizar productos de la ${l.nombre}.`)} target="_blank" rel="noopener noreferrer" className="boton inline-flex h-11 items-center gap-2 rounded-xl bg-rojo/10 px-5 font-semibold text-rojo-hondo hover:bg-rojo/20">
                        <MessageCircle aria-hidden="true" size={18} className="icono-sacude" />Cotizar
                      </a>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUÉ */}
      <section className="py-24 sm:py-28">
        <div className={`${contenedor} grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]`}>
          <Reveal efecto="izquierda" className="group">
            <Titulo etiqueta={porque.etiqueta} solido={porque.titulo} acento={porque.acento} />
            <p className="mt-6 text-lg leading-relaxed">
              {porque.texto}
            </p>
            <div className="mt-8 hidden overflow-hidden rounded-[2rem] rounded-bl-[5rem] shadow-xl shadow-rojo-hondo/20 lg:block">
              <img decoding="async" src="/fotos/obrero-casco.webp" alt="Trabajador de obra con su casco de seguridad" loading="lazy" className="foto-zoom aspect-[16/9] w-full object-cover" />
            </div>
          </Reveal>
          <ul className="grid gap-5 sm:grid-cols-2">
            {razones.map((r, i) => {
              const Icono = ICONOS_RAZON[i];
              return (
                <Reveal as="li" key={r.titulo} retraso={i * 110}>
                  <div className="tarjeta group relative h-full overflow-hidden rounded-[1.75rem] border border-rojo/10 bg-white p-7 shadow-lg shadow-rojo-hondo/10">
                    <span aria-hidden="true" className="absolute -right-10 -top-10 size-32 rounded-[2rem] bg-rojo/5 transition duration-700 group-hover:rotate-45 group-hover:scale-125 group-hover:bg-rojo/10" />
                    <span className="icono-caja relative grid size-14 place-items-center rounded-2xl bg-rojo text-white shadow-lg shadow-rojo-hondo/30 group-hover:bg-rojo-hondo"><Icono aria-hidden="true" size={26} /></span>
                    <h3 className="relative mt-5 text-xl font-bold">{r.titulo}</h3>
                    <p className="relative mt-2 leading-relaxed text-carbon/85">{r.texto}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* CANALES DE VENTA */}
      <section className="px-5 sm:px-8">
        <Reveal efecto="zoom" className="group relative isolate mx-auto grid max-w-7xl items-center overflow-hidden rounded-[2.5rem] rounded-tr-[7rem] bg-tinta text-white lg:grid-cols-2">
          <img loading="lazy" decoding="async" src="/icon.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 -z-10 w-80 opacity-10 transition duration-1000 group-hover:rotate-12" />
          <div className="p-8 sm:p-14">
            <Titulo oscuro etiqueta={canales.etiqueta} solido={canales.titulo} acento={canales.acento} />
            <p className="mt-6 text-lg leading-relaxed text-white/80">
              {canales.texto}
            </p>
            <a href={waUrl('Hola Imaninki, represento a una entidad y quisiera información sobre licitaciones o Perú Compras.')} target="_blank" rel="noopener noreferrer" className={`${botonPrimario} mt-8`}>
              <MessageCircle aria-hidden="true" size={20} className="icono-sacude" />{canales.boton}
            </a>
          </div>
          <div className="h-full min-h-72 overflow-hidden">
            <img decoding="async" src="/fotos/almacen.webp" alt="Almacén con productos listos para despacho" loading="lazy" className="foto-zoom size-full object-cover" />
          </div>
        </Reveal>
      </section>

      <CtaContacto id="contacto" />
    </main>
  );
}
