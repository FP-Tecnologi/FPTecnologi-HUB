import Link from 'next/link';
import { ArrowRight, BadgePercent, Headset, MessageCircle, Quote, ShieldCheck, Truck } from 'lucide-react';
import Reveal from '@/components/Reveal';
import Titulo from '@/components/Titulo';
import { Clientes, CtaContacto } from '@/components/Bloques';
import { lineas, razones, testimonios, valores, waUrl } from '@/lib/contenido';

const ICONOS_RAZON = [ShieldCheck, BadgePercent, Truck, Headset];
const contenedor = 'mx-auto max-w-7xl px-5 sm:px-8';
const botonPrimario = 'boton inline-flex h-13 items-center gap-2 rounded-xl bg-kelqa px-6 font-semibold text-white shadow-lg shadow-kelqa-hondo/35 hover:bg-kelqa-hondo hover:shadow-xl hover:shadow-kelqa-hondo/45';
const retraso = (ms: number) => ({ '--retraso': `${ms}ms` }) as React.CSSProperties;

export default function Inicio() {
  return (
    <main>
      {/* HERO */}
      <section id="inicio" className="relative isolate overflow-hidden bg-tinta text-white">
        <img src="/fotos/cumbre.webp" alt="" className="hero-foto absolute inset-0 -z-20 size-full -scale-x-100 object-cover object-[35%_center]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--color-tinta)_10%,rgb(14_28_30/0.82)_45%,rgb(19_106_111/0.25)_100%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-tinta to-transparent" />
        {/* Marca de agua: el ícono del logo, como en la portada del brochure. */}
        <img src="/icon.svg" alt="" aria-hidden="true" className="flotar pointer-events-none absolute -bottom-24 -left-24 -z-10 w-[26rem] opacity-[0.07] grayscale brightness-[3]" />

        <div className={`${contenedor} grid min-h-[100svh] grid-cols-1 items-center gap-12 pb-20 pt-32 lg:grid-cols-[1.15fr_0.85fr]`}>
          <div>
            <p className="entrada inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-kelqa-claro backdrop-blur">
              <span aria-hidden="true" className="latir size-2 rounded-[3px] bg-current" />Industria · Construcción · Corporativo
            </p>
            <h1 className="entrada mt-6 text-[clamp(2.6rem,7vw,5rem)] font-extrabold leading-[1.02] tracking-tight text-white" style={retraso(120)}>
              Hecha para <span className="titulo-brillo titulo-brillo-claro">avanzar contigo</span>
            </h1>
            <p className="entrada mt-6 max-w-xl text-lg leading-relaxed text-white/85" style={retraso(240)}>
              Soluciones confiables y de alto valor para tus proyectos: pinturas, mobiliario corporativo y productos para construcción y emergencia, con cobertura a nivel nacional.
            </p>
            <div className="entrada mt-9 flex flex-wrap gap-3" style={retraso(360)}>
              <a href={waUrl('Hola Kelqa, quisiera cotizar productos para mi proyecto.')} target="_blank" rel="noopener noreferrer" className={botonPrimario}>
                <MessageCircle aria-hidden="true" size={20} className="icono-sacude" />Cotizar ahora
              </a>
              <a href="#lineas" className="boton inline-flex h-13 items-center gap-2 rounded-xl border border-white/30 px-6 font-semibold text-white backdrop-blur hover:bg-white hover:text-tinta">
                Ver líneas <ArrowRight aria-hidden="true" size={18} className="icono-avanza" />
              </a>
            </div>
            <ul className="entrada mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75" style={retraso(480)}>
              {['Venta directa', 'Licitaciones públicas y privadas', 'Fichas en Perú Compras'].map((t) => (
                <li key={t} className="flex items-center gap-2"><span aria-hidden="true" className="size-1.5 rounded-[2px] bg-kelqa-claro" />{t}</li>
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
                      <img src={l.productos[0].img} alt="" className="h-16 w-16 object-contain transition-transform duration-500 group-hover:scale-110" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-kelqa-claro group-hover:text-kelqa-hondo">0{i + 1}</span>
                      <b className="block font-titulo text-lg leading-tight">{l.nombre}</b>
                      <span className="block truncate text-sm text-white/70 group-hover:text-carbon">{l.productos.map((p) => p.nombre.replace(/^(Línea|Pintura) /, '')).join(' · ')}</span>
                    </span>
                    <span className="mr-1 grid size-9 shrink-0 place-items-center rounded-full border border-white/20 transition duration-300 group-hover:border-kelqa group-hover:bg-kelqa group-hover:text-white">
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
            <div className="overflow-hidden rounded-[2rem] rounded-tr-[6rem] shadow-2xl shadow-kelqa-hondo/25">
              <img src="/fotos/equipo.webp" alt="Equipo de obra revisando planos de un proyecto" className="foto-zoom aspect-[4/3.4] w-full object-cover" />
            </div>
            <div className="flotar absolute -bottom-8 left-6 right-6 rounded-2xl bg-tinta p-5 text-white shadow-xl shadow-tinta/30 sm:left-auto sm:w-72">
              <p className="font-titulo text-lg font-bold leading-snug">Aliado estratégico en cada etapa de tu proyecto</p>
              <span aria-hidden="true" className="mt-3 block h-1 w-12 rounded-full bg-kelqa transition-all duration-500 group-hover:w-24" />
            </div>
          </Reveal>
          <Reveal efecto="derecha" retraso={120} className="pt-6 lg:pt-0">
            <Titulo etiqueta="Quiénes somos" solido="Más que productos," acento="soluciones que generan impacto" />
            <p className="mt-6 text-lg leading-relaxed">
              Desarrollamos y ofrecemos soluciones confiables, eficientes y de alto valor para los sectores industrial y construcción, con productos que integran calidad, rendimiento, durabilidad y precios competitivos.
            </p>
            <p className="mt-4 leading-relaxed text-carbon/85">
              Creemos en el trabajo bien hecho y en relaciones comerciales basadas en la confianza, la responsabilidad, la transparencia y un servicio oportuno.
            </p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {valores.map((v, i) => (
                <Reveal as="li" efecto="zoom" key={v} retraso={200 + i * 80} className="group inline-flex cursor-default items-center gap-2 rounded-xl border border-kelqa/20 bg-kelqa/5 px-4 py-2 text-sm font-semibold text-kelqa-hondo transition-colors hover:border-kelqa hover:bg-kelqa hover:text-white">
                  <span aria-hidden="true" className="size-2 rounded-[3px] bg-kelqa transition duration-500 group-hover:rotate-45 group-hover:bg-white" />{v}
                </Reveal>
              ))}
            </ul>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ['Misión', 'Brindar soluciones confiables y de alta calidad que impulsen proyectos en diversos sectores, con cobertura nacional y un servicio cercano.'],
                ['Visión', 'Ser una marca reconocida por su excelencia, cercanía y compromiso, aliada de nuestros clientes en cada etapa de sus proyectos.'],
              ].map(([t, d]) => (
                <div key={t} className="group rounded-2xl bg-niebla p-5 ring-1 ring-transparent transition duration-500 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-kelqa-hondo/10 hover:ring-kelqa/15">
                  <h3 className="text-base font-bold transition-colors duration-500 group-hover:text-kelqa-hondo">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-carbon/85">{d}</p>
                </div>
              ))}
            </div>
            <Link href="/nosotros" className="boton mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-kelqa/10 px-5 font-semibold text-kelqa-hondo hover:bg-kelqa/20">
              Conoce más de Kelqa <ArrowRight aria-hidden="true" size={18} className="icono-avanza" />
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
                <article id={l.id} className={`grid overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-kelqa-hondo/10 transition-shadow duration-500 hover:shadow-2xl hover:shadow-kelqa-hondo/25 ${i % 2 ? 'lg:grid-cols-[1.25fr_0.75fr]' : 'lg:grid-cols-[0.75fr_1.25fr]'}`}>
                  <div className={`group relative isolate flex min-h-80 flex-col justify-end overflow-hidden p-8 text-white ${i % 2 ? 'lg:order-2' : ''}`}>
                    <img src={l.foto} alt="" className="foto-zoom absolute inset-0 -z-20 size-full object-cover" />
                    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-tinta via-tinta/55 to-tinta/0" />
                    <span className="font-titulo text-6xl font-extrabold text-white/25 transition duration-500 group-hover:-translate-y-1 group-hover:text-kelqa-claro/60">0{i + 1}</span>
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
                              <img src={p.img} alt={p.nombre} loading="lazy" className="max-h-20 max-w-20 object-contain drop-shadow-lg transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110" />
                            </span>
                            <span>
                              <h4 className="font-titulo font-bold leading-tight text-tinta transition-colors group-hover:text-kelqa-hondo">{p.nombre}</h4>
                              <p className="mt-1 text-sm leading-snug text-carbon/80">{p.detalle}</p>
                            </span>
                          </div>
                        </Reveal>
                      ))}
                    </ul>
                    <div className="mt-7 flex flex-wrap gap-3">
                      <Link href={`/lineas/${l.id}`} className="boton inline-flex h-11 items-center gap-2 rounded-xl bg-kelqa px-5 font-semibold text-white shadow-md shadow-kelqa-hondo/25 hover:bg-kelqa-hondo">
                        Ver línea completa <ArrowRight aria-hidden="true" size={18} className="icono-avanza" />
                      </Link>
                      <a href={waUrl(`Hola Kelqa, quisiera cotizar productos de la ${l.nombre}.`)} target="_blank" rel="noopener noreferrer" className="boton inline-flex h-11 items-center gap-2 rounded-xl bg-kelqa/10 px-5 font-semibold text-kelqa-hondo hover:bg-kelqa/20">
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
            <Titulo etiqueta="¿Por qué Kelqa?" solido="Construimos" acento="relaciones que duran" />
            <p className="mt-6 text-lg leading-relaxed">
              Buen servicio es acompañarte de cerca, entender los desafíos de tu proyecto y proponer alternativas eficientes, oportunas y alineadas a tus objetivos.
            </p>
            <div className="mt-8 hidden overflow-hidden rounded-[2rem] rounded-bl-[5rem] shadow-xl shadow-kelqa-hondo/20 lg:block">
              <img src="/fotos/obrero-casco.webp" alt="Trabajador de obra con su casco de seguridad" loading="lazy" className="foto-zoom aspect-[16/9] w-full object-cover" />
            </div>
          </Reveal>
          <ul className="grid gap-5 sm:grid-cols-2">
            {razones.map((r, i) => {
              const Icono = ICONOS_RAZON[i];
              return (
                <Reveal as="li" key={r.titulo} retraso={i * 110}>
                  <div className="tarjeta group relative h-full overflow-hidden rounded-[1.75rem] border border-kelqa/10 bg-white p-7 shadow-lg shadow-kelqa-hondo/10">
                    <span aria-hidden="true" className="absolute -right-10 -top-10 size-32 rounded-[2rem] bg-kelqa/5 transition duration-700 group-hover:rotate-45 group-hover:scale-125 group-hover:bg-kelqa/10" />
                    <span className="icono-caja relative grid size-14 place-items-center rounded-2xl bg-kelqa text-white shadow-lg shadow-kelqa-hondo/30 group-hover:bg-kelqa-hondo"><Icono aria-hidden="true" size={26} /></span>
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
          <img src="/icon.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 -z-10 w-80 opacity-10 transition duration-1000 group-hover:rotate-12" />
          <div className="p-8 sm:p-14">
            <Titulo oscuro etiqueta="Sector público y privado" solido="Venta directa y" acento="licitaciones" />
            <p className="mt-6 text-lg leading-relaxed text-white/80">
              Atendemos ventas directas y licitaciones públicas y privadas. Encuentra todas nuestras fichas en <b className="text-white">Perú Compras</b>.
            </p>
            <a href={waUrl('Hola Kelqa, represento a una entidad y quisiera información sobre licitaciones o Perú Compras.')} target="_blank" rel="noopener noreferrer" className={`${botonPrimario} mt-8`}>
              <MessageCircle aria-hidden="true" size={20} className="icono-sacude" />Consultar disponibilidad
            </a>
          </div>
          <div className="h-full min-h-72 overflow-hidden">
            <img src="/fotos/almacen.webp" alt="Almacén con productos listos para despacho" loading="lazy" className="foto-zoom size-full object-cover" />
          </div>
        </Reveal>
      </section>

      {/* TESTIMONIOS */}
      <section id="clientes" className="py-24 sm:py-28">
        <div className={contenedor}>
          <Reveal><Titulo centro etiqueta="Clientes" solido="Nuestra experiencia" acento="habla por nosotros" /></Reveal>
          <Clientes className="mt-12" />
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonios.map((t, i) => (
              <Reveal as="li" key={t.empresa} retraso={i * 110}>
                <div className="tarjeta group flex h-full flex-col rounded-[1.75rem] bg-niebla p-8 hover:bg-white">
                  <span className="icono-caja grid size-12 place-items-center rounded-xl bg-kelqa/10 text-kelqa group-hover:bg-kelqa group-hover:text-white">
                    <Quote aria-hidden="true" size={24} />
                  </span>
                  <blockquote className="mt-5 flex-1 leading-relaxed text-carbon/90">«{t.texto}»</blockquote>
                  <p className="mt-6 border-t border-kelqa/15 pt-4 text-sm"><b className="block font-titulo text-tinta">{t.empresa}</b>{t.autor}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaContacto id="contacto" />
    </main>
  );
}
