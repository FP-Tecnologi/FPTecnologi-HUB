import Link from 'next/link';
import { ArrowRight, BadgeCheck, ClipboardList, ShieldCheck, Wrench, MessageCircle, PackageCheck, Gauge, MousePointerClick } from 'lucide-react';
import PcEscena from '@/components/PcEscena';
import Reveal from '@/components/Reveal';
import ComparaLineas from '@/components/ComparaLineas';
import Faq from '@/components/Faq';
import ImgPieza from '@/components/ImgPieza';
import SelectorUso from '@/components/SelectorUso';
import { BUILDS, porId, seleccionDe } from '@/lib/piezas';

const SELLOS = [
  { i: Gauge, t: 'Fuentes 80 Plus', d: 'Eficiencia energética certificada' },
  { i: BadgeCheck, t: 'Repuestos originales', d: 'Soporte post-venta de confianza' },
  { i: Wrench, t: 'Armado riguroso', d: 'Estándares para flujos de alta demanda' },
  { i: ShieldCheck, t: 'Garantía de continuidad', d: 'Respaldo para que tu operación no se detenga' },
];

const PASOS_COMPRA = [
  { i: MousePointerClick, t: 'Elige o arma', d: 'Parte de una configuración lista o arma la tuya pieza por pieza en 3D.' },
  { i: MessageCircle, t: 'Confirma con un especialista', d: 'Te llega tu configuración por WhatsApp y confirmamos precio final, stock y entrega.' },
  { i: PackageCheck, t: 'Recibe tu equipo', d: 'Lo armamos bajo estándares rigurosos y te acompañamos con soporte post-venta.' },
];

const DESTACADOS = ['c2', 'r2', 'v3', 's2'];

// Posiciones (en % de la foto) de las llamadas numeradas del gabinete Turing.
const LLAMADAS = [
  { t: 'Ventilación lateral', d: 'Ventilador visible en el panel para mover el aire dentro del equipo.', x: 21, y: 28 },
  { t: 'Frente con rejilla', d: 'Diseño calado Turing que deja respirar al hardware bajo carga.', x: 68, y: 47 },
  { t: 'Marca Quamtu', d: 'Identificación de la línea en el panel superior del gabinete.', x: 82, y: 8 },
];

const CALIDAD = [
  { t: 'Fuentes 80 Plus', d: 'Eficiencia energética superior al 85%: menos calor y menor consumo eléctrico para tu infraestructura.' },
  { t: 'Arquitectura de flujo de aire', d: 'Elimina el estrés térmico y mantiene el hardware a máxima potencia incluso en entornos de misión crítica.' },
  { t: 'Mantenimiento simplificado', d: 'Los gabinetes permiten una limpieza ágil para sostener un entorno impecable.' },
];

const CASOS = [
  'Universidad Nacional Micaela Bastidas',
  'Superintendencia de Banca, Seguros y AFP',
  'Programa Nacional Faustino Sánchez Carrión',
  'Municipalidad de Santa María - Huacho',
  'PRONIS',
  'Municipalidad Provincial del Santa',
];

export default function Home() {
  const hero = seleccionDe(BUILDS[2].ids);
  return (
    <main>
      {/* HERO */}
      <section className="relative isolate flex min-h-screen items-center overflow-hidden pt-16">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-60" style={{ backgroundImage: 'url(/brand/fondo-red.jpg)' }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-bg via-bg/70 to-transparent" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-4 px-5 lg:grid-cols-2">
          <div>
            <p style={{ ["--i" as string]: 0 }} className="entra mb-5 inline-block border border-claro/40 px-4 py-1 font-display text-xs tracking-[0.3em] text-claro">
              CONFIGURACIÓN DE PRECISIÓN
            </p>
            <h1 style={{ ["--i" as string]: 1 }} className="entra titulo-neon font-display text-5xl font-bold leading-[1.05] md:text-7xl">
              Equipos a la medida de tu trabajo.
            </h1>
            <p style={{ ["--i" as string]: 2 }} className="entra mt-6 max-w-lg text-xl text-slate-300">
              No construimos hardware convencional: diseñamos herramientas de ingeniería a la medida. Arma tu equipo en 3D o cotiza para tu organización.
            </p>
            <div style={{ ["--i" as string]: 3 }} className="entra mt-9 flex flex-wrap gap-4">
              <Link href="/armar" className="btn-neon inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-sm">
                ARMA TU PC <ArrowRight size={18} />
              </Link>
              <Link href="/cotizar" className="btn-borde inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-sm">
                <ClipboardList size={18} /> COTIZA PARA TU EMPRESA
              </Link>
            </div>
          </div>
          <PcEscena sel={hero} poster="/brand/hero-poster.webp" diferir className="h-[420px] md:h-[640px]" />
        </div>
      </section>

      {/* ¿PARA QUÉ USARÁS TU PC? */}
      <section id="uso" className="mx-auto max-w-7xl px-5 py-20">
        <Reveal>
          <h2 data-r className="font-display text-3xl font-bold md:text-5xl">
            ¿Para qué usarás <span className="titulo-neon">tu PC?</span>
          </h2>
          <p data-r className="mt-4 max-w-2xl text-slate-400">Elige tu uso y te recomendamos una configuración. Luego la puedes personalizar pieza por pieza.</p>
          <div data-r><SelectorUso /></div>
        </Reveal>
      </section>

      {/* SELLOS DE CONFIANZA */}
      <section className="border-y border-line bg-panel/50">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {SELLOS.map(({ i: Icono, t, d }) => (
            <div key={t} className="flex items-start gap-3">
              <Icono size={26} className="mt-0.5 shrink-0 text-claro" />
              <p><b className="block font-display text-sm text-white">{t}</b><span className="text-sm text-slate-400">{d}</span></p>
            </div>
          ))}
        </div>
      </section>

      {/* LÍNEAS TURING: figura técnica con llamadas numeradas */}
      <section id="lineas" className="mx-auto max-w-7xl px-5 py-28">
        <Reveal className="grid gap-14 lg:grid-cols-[1fr_minmax(0,400px)] lg:gap-20">
          <div>
            <h2 data-r className="font-display text-3xl font-bold md:text-5xl">
              Soluciones de <span className="titulo-neon">rendimiento</span>
            </h2>
            <dl className="mt-10 divide-y divide-line border-y border-line">
              <div data-r className="grid gap-1 py-7 sm:grid-cols-[11rem_1fr] sm:gap-8">
                <dt>
                  <span className="block font-display text-2xl font-bold"><span className="text-claro">Línea</span> TURING</span>
                  <span className="text-sm text-slate-400">PC de escritorio</span>
                </dt>
                <dd className="text-lg text-slate-200">Diseñadas para la productividad diaria sin interrupciones.</dd>
              </div>
              <div data-r className="grid gap-1 py-7 sm:grid-cols-[11rem_1fr] sm:gap-8">
                <dt>
                  <span className="block font-display text-2xl font-bold"><span className="text-claro">Línea</span> TURING WS</span>
                  <span className="text-sm text-slate-400">Workstations</span>
                </dt>
                <dd className="text-lg text-slate-200">Alta potencia configurada para los profesionales más exigentes.</dd>
              </div>
            </dl>
            <ol data-r className="mt-8 space-y-3 text-slate-300">
              {LLAMADAS.map((l, i) => (
                <li key={l.t} className="flex items-baseline gap-3">
                  <span className="grid h-6 w-6 shrink-0 translate-y-1 place-items-center rounded-full border border-claro/70 font-display text-xs text-claro">{i + 1}</span>
                  <span><b className="text-white">{l.t}.</b> {l.d}</span>
                </li>
              ))}
            </ol>
          </div>

          <figure data-r className="relative mx-auto w-full max-w-[400px] lg:mx-0">
            <div className="absolute -inset-10 -z-10 rounded-full bg-cyan/15 blur-[90px]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/gabinete-turing.jpg" alt="Gabinete Quamtu Turing con rejilla de flujo de aire" width={390} height={620} className="h-auto w-full rounded-sm border border-line" />
            {LLAMADAS.map((l, i) => (
              <span
                key={l.t}
                aria-hidden
                style={{ top: `${l.y}%`, left: `${l.x}%` }}
                className="absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-claro bg-bg/80 font-display text-xs text-claro shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
              >
                {i + 1}
              </span>
            ))}
            <figcaption className="mt-3 flex items-center justify-between border-t border-line pt-2 text-xs text-slate-500">
              <span>Fig. 1: gabinete Turing</span>
              <span>Vista frontal</span>
            </figcaption>
          </figure>

          <div data-r className="lg:col-span-2">
            <h3 className="font-display text-xl font-bold text-white sm:text-2xl">¿Cuál es la tuya? <span className="text-claro">Compáralas</span></h3>
            <ComparaLineas />
          </div>
        </Reveal>
      </section>

      {/* COMPONENTES DESTACADOS */}
      <section className="bg-panel/50 py-20">
        <Reveal className="mx-auto max-w-7xl px-5">
          <div data-r className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-bold md:text-5xl">
              Componentes <span className="titulo-neon">destacados</span>
            </h2>
            <Link href="/tienda" className="btn-borde inline-flex items-center gap-2 rounded-full px-6 py-3 font-display text-xs">
              VER TODA LA TIENDA <ArrowRight size={15} />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {DESTACADOS.map((id) => {
              const o = porId(id)!;
              return (
                <Link key={id} data-r href={`/producto/${id}`} className="hud group flex flex-col overflow-hidden transition hover:-translate-y-1">
                  <ImgPieza id={o.id} cat={o.cat} color={o.color} className="h-44 w-full bg-gradient-to-br from-panel to-bg" />
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-base font-bold normal-case text-white">{o.nombre}</h3>
                    <p className="mt-1 flex-1 text-sm text-slate-400">{o.spec}</p>
                    <p className="mt-4 font-display text-xl font-bold text-claro">S/ {o.precio.toLocaleString('es-PE')}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* CALIDAD: 80 PLUS + REFRIGERACIÓN */}
      <section className="relative overflow-hidden py-32">
        <div className="absolute inset-y-0 left-0 -z-10 hidden w-1/2 bg-gradient-to-r from-cyan/10 to-transparent lg:block" />
        <Reveal className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div data-r className="relative mx-auto max-w-xl lg:mx-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/interior-rtx.jpg" alt="Interior de un equipo Quamtu con tarjeta de video" width={620} height={650} className="w-[78%] rounded-sm border border-line" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/gabinete-fans.jpg" alt="Gabinete Quamtu con ventiladores" width={480} height={650} className="absolute -bottom-10 -right-2 w-[46%] rounded-sm border border-line shadow-[0_18px_40px_rgba(0,0,0,0.6)] sm:-right-6" />
          </div>
          <div>
            <h2 data-r className="font-display text-3xl font-bold md:text-4xl">
              Potencia certificada, <span className="titulo-neon">enfriamiento sin estrés</span>
            </h2>
            <dl className="mt-8 divide-y divide-line border-y border-line">
              {CALIDAD.map((c) => (
                <div key={c.t} data-r className="py-5">
                  <dt className="font-display text-base font-bold text-white">{c.t}</dt>
                  <dd className="mt-1 text-slate-300">{c.d}</dd>
                </div>
              ))}
            </dl>
            <Link data-r href="/armar" className="btn-neon mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-sm">
              CONFIGURA TU EQUIPO <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* CÓMO COMPRAR: proceso en línea, sin tarjetas */}
      <section className="bg-panel/50 py-20">
        <Reveal className="mx-auto max-w-7xl px-5">
          <h2 data-r className="font-display text-3xl font-bold md:text-5xl">
            Cómo <span className="titulo-neon">comprar</span>
          </h2>
          <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            <span aria-hidden className="absolute left-[1.35rem] top-6 hidden h-px w-[calc(100%-5rem)] bg-gradient-to-r from-claro/70 via-claro/30 to-transparent md:block" />
            {PASOS_COMPRA.map(({ i: Icono, t, d }) => (
              <li key={t} data-r className="relative flex gap-5 md:block">
                <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-claro bg-bg text-claro"><Icono size={20} /></span>
                <div className="md:mt-6">
                  <h3 className="font-display text-xl font-bold">{t}</h3>
                  <p className="mt-2 max-w-sm text-slate-300">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* RESPALDO */}
      <section id="respaldo" className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
        <Reveal className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <h2 data-r className="font-display text-3xl font-bold md:text-5xl">
              Respaldo y <span className="titulo-neon">garantía</span>
            </h2>
            <p data-r className="mt-5 max-w-md text-lg text-slate-300">
              Nuestra relación no termina con la entrega: soporte post-venta con tiempos de respuesta optimizados y repuestos originales.
            </p>
          </div>
          <div data-r>
            <h3 className="font-display text-base font-bold text-claro">Casos de éxito</h3>
            <ul className="mt-4 grid divide-y divide-line border-y border-line md:grid-cols-2 md:divide-y-0">
              {CASOS.map((c, i) => (
                <li key={c} className={`py-4 text-slate-200 md:px-1 ${i >= 2 ? 'md:border-t md:border-line' : ''}`}>{c}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* PREGUNTAS FRECUENTES */}
      <section id="faq" className="mx-auto max-w-7xl px-5 py-24">
        <Reveal>
          <h2 data-r className="text-center font-display text-3xl font-bold md:text-5xl">
            Preguntas <span className="titulo-neon">frecuentes</span>
          </h2>
          <div data-r><Faq /></div>
        </Reveal>
      </section>

    </main>
  );
}
