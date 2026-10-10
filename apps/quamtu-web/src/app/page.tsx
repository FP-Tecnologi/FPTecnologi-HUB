import Link from 'next/link';
import { ArrowRight, BadgeCheck, ClipboardList, Handshake, Headset, ShieldCheck, Wrench, Cpu, Fan, Zap, MapPin, Globe, MessageCircle, PackageCheck, Gauge, MousePointerClick } from 'lucide-react';
import PcEscena from '@/components/PcEscena';
import Reveal from '@/components/Reveal';
import ComparaLineas from '@/components/ComparaLineas';
import Faq from '@/components/Faq';
import ImgPieza from '@/components/ImgPieza';
import SelectorUso from '@/components/SelectorUso';
import { BUILDS, porId, seleccionDe, total } from '@/lib/piezas';

const CLAVES = [
  { i: Wrench, t: 'Configuración a medida', d: 'Equipos ensamblados bajo estándares rigurosos para flujos de trabajo de alta demanda.' },
  { i: Headset, t: 'Asesoría especializada', d: 'Acompañamiento directo para decidir con datos técnicos, no comerciales.' },
  { i: ShieldCheck, t: 'Garantía de continuidad', d: 'Respaldo total para asegurar que tu operación nunca se detenga.' },
];

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
          <Reveal>
            <p data-r className="mb-5 inline-block border border-claro/40 px-4 py-1 font-display text-xs tracking-[0.3em] text-claro">
              CONFIGURACIÓN DE PRECISIÓN
            </p>
            <h1 data-r className="titulo-neon font-display text-5xl font-bold leading-[1.05] md:text-7xl">
              Equipos a la medida de tu trabajo.
            </h1>
            <p data-r className="mt-6 max-w-lg text-xl text-slate-300">
              No construimos hardware convencional: diseñamos herramientas de ingeniería a la medida. Arma tu equipo en 3D o cotiza para tu organización.
            </p>
            <div data-r className="mt-9 flex flex-wrap gap-4">
              <Link href="/armar" className="btn-neon inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-sm">
                ARMA TU PC <ArrowRight size={18} />
              </Link>
              <Link href="/cotizar" className="btn-borde inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-sm">
                <ClipboardList size={18} /> COTIZA PARA TU EMPRESA
              </Link>
            </div>
          </Reveal>
          <PcEscena sel={hero} className="h-[420px] md:h-[640px]" />
        </div>
      </section>

      {/* ¿PARA QUÉ USARÁS TU PC? */}
      <section id="uso" className="mx-auto max-w-7xl px-5 py-24">
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

      {/* ALIADO TECNOLÓGICO */}
      <section className="relative py-28">
        <div className="absolute inset-0 -z-10 bg-cover bg-center opacity-25" style={{ backgroundImage: 'url(/brand/fondo-red.jpg)' }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-bg via-transparent to-bg" />
        <Reveal className="mx-auto max-w-7xl px-5">
          <h2 data-r className="text-center font-display text-3xl font-bold md:text-5xl">
            El aliado tecnológico <span className="titulo-neon">de tu empresa</span>
          </h2>
          <p data-r className="mx-auto mt-5 max-w-3xl text-center text-lg text-slate-300">
            Quien decide por TI no busca solo un precio: busca continuidad y rendimiento. Cada componente se selecciona para cumplir una función específica, sin la incertidumbre del hardware genérico.
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {CLAVES.map(({ i: Icono, t, d }) => (
              <div key={t} data-r className="hud p-8 transition hover:-translate-y-1">
                <Icono className="text-claro" size={32} />
                <h3 className="mt-5 font-display text-xl font-bold text-white">{t}</h3>
                <p className="mt-2 text-slate-300">{d}</p>
              </div>
            ))}
          </div>
          <p data-r className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-3 text-center text-slate-400">
            <Handshake className="shrink-0 text-claro" /> Socio tecnológico estratégico: soluciones de alto rendimiento con respaldo experto.
          </p>
        </Reveal>
      </section>

      {/* LÍNEAS TURING */}
      <section id="lineas" className="mx-auto max-w-7xl px-5 py-24">
        <Reveal className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 data-r className="font-display text-3xl font-bold md:text-5xl">
              Soluciones de <span className="titulo-neon">rendimiento</span>
            </h2>
            <div className="mt-10 space-y-6">
              <div data-r className="hud p-7">
                <h3 className="font-display text-2xl font-bold"><span className="text-claro">Línea</span> TURING</h3>
                <p className="mt-1 text-sm text-slate-400">PC de escritorio</p>
                <p className="mt-3 text-lg text-slate-200">Diseñadas para la productividad diaria sin interrupciones.</p>
              </div>
              <div data-r className="hud p-7">
                <h3 className="font-display text-2xl font-bold"><span className="text-claro">Línea</span> TURING WS</h3>
                <p className="mt-1 text-sm text-slate-400">Workstations</p>
                <p className="mt-3 text-lg text-slate-200">Alta potencia configurada para los profesionales más exigentes.</p>
              </div>
            </div>
          </div>
          <div data-r className="relative mx-auto max-w-sm">
            <div className="absolute -inset-10 -z-10 rounded-full bg-cyan/20 blur-[90px]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/gabinete-turing.jpg" alt="Gabinete Quamtu Turing" className="w-full rounded-2xl border border-line" />
          </div>
        </Reveal>
      </section>

      {/* CONFIGURACIONES LISTAS */}
      <section id="builds" className="bg-panel/60 py-24">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal>
            <h2 data-r className="font-display text-3xl font-bold md:text-5xl">
              Configuraciones <span className="titulo-neon">listas para pedir</span>
            </h2>
            <p data-r className="mt-4 max-w-xl text-slate-400">Punto de partida: personalízalas pieza por pieza en el armador 3D. Precios referenciales.</p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {BUILDS.map((b, i) => {
                const s = seleccionDe(b.ids);
                return (
                  <article key={b.nombre} data-r className="hud flex flex-col p-6 transition hover:-translate-y-1">
                    <span className="font-display text-xs tracking-[0.25em] text-claro">{b.linea}</span>
                    <h3 className="mt-1 font-display text-xl font-bold text-white">{b.nombre}</h3>
                    <p className="mt-1 text-sm text-slate-400">{b.para}</p>
                    <ul className="mt-5 flex-1 space-y-1.5 text-slate-200">
                      <li className="flex gap-2"><Cpu size={16} className="mt-1 shrink-0 text-claro" />{s.cpu?.nombre}</li>
                      <li className="flex gap-2"><Zap size={16} className="mt-1 shrink-0 text-claro" />{s.gpu?.nombre}</li>
                      <li className="flex gap-2"><Fan size={16} className="mt-1 shrink-0 text-claro" />{s.ram?.nombre}</li>
                      <li className="pl-6 text-sm text-slate-400">{s.ssd?.nombre}</li>
                    </ul>
                    <p className="mt-5 font-display text-2xl font-bold text-claro">S/ {total(s).toLocaleString('es-PE')}</p>
                    <Link href={`/armar?build=${i}`} className="btn-neon mt-4 rounded-full py-3 text-center font-display text-xs">PERSONALIZAR</Link>
                  </article>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* COMPONENTES DESTACADOS */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <Reveal>
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

      {/* COMPARADOR DE LÍNEAS */}
      <section className="bg-panel/50 py-24">
        <Reveal className="mx-auto max-w-7xl px-5">
          <h2 data-r className="font-display text-3xl font-bold md:text-5xl">
            Turing o Turing WS: <span className="titulo-neon">¿cuál es la tuya?</span>
          </h2>
          <div data-r><ComparaLineas /></div>
        </Reveal>
      </section>

      {/* CALIDAD: 80 PLUS + REFRIGERACIÓN */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <Reveal className="grid items-center gap-10 lg:grid-cols-2">
          <div data-r className="grid grid-cols-2 gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/interior-rtx.jpg" alt="Interior de un equipo Quamtu con tarjeta de video" className="rounded-2xl border border-line" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/gabinete-fans.jpg" alt="Gabinete Quamtu con ventiladores" className="mt-10 rounded-2xl border border-line" />
          </div>
          <div>
            <h2 data-r className="font-display text-3xl font-bold md:text-4xl">
              Potencia certificada, <span className="titulo-neon">enfriamiento sin estrés</span>
            </h2>
            <p data-r className="mt-5 text-lg text-slate-300">
              Fuentes con certificación 80 Plus: eficiencia energética superior al 85%, menos calor y menor consumo eléctrico para tu infraestructura.
            </p>
            <p data-r className="mt-4 text-lg text-slate-300">
              Nuestra arquitectura de flujo de aire elimina el estrés térmico y mantiene el hardware a máxima potencia incluso en entornos de misión crítica. Los gabinetes permiten una limpieza ágil.
            </p>
            <Link data-r href="/armar" className="btn-neon mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-sm">
              CONFIGURA TU EQUIPO <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* CÓMO COMPRAR */}
      <section className="bg-panel/50 py-24">
        <Reveal className="mx-auto max-w-7xl px-5">
          <h2 data-r className="text-center font-display text-3xl font-bold md:text-5xl">
            Cómo <span className="titulo-neon">comprar</span>
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PASOS_COMPRA.map(({ i: Icono, t, d }, n) => (
              <div key={t} data-r className="hud relative p-8">
                <span className="absolute right-5 top-4 font-display text-5xl font-bold text-line">{n + 1}</span>
                <Icono size={30} className="text-claro" />
                <h3 className="mt-5 font-display text-xl font-bold">{t}</h3>
                <p className="mt-2 text-slate-300">{d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* RESPALDO */}
      <section id="respaldo" className="relative py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-cyan/10 to-transparent" />
        <Reveal className="mx-auto max-w-7xl px-5">
          <h2 data-r className="text-center font-display text-3xl font-bold md:text-5xl">
            Respaldo y <span className="titulo-neon">garantía</span>
          </h2>
          <p data-r className="mx-auto mt-5 max-w-2xl text-center text-lg text-slate-300">
            Nuestra relación no termina con la entrega: soporte post-venta con tiempos de respuesta optimizados y repuestos originales.
          </p>
          <h3 data-r className="mt-14 text-center font-display text-xl text-claro">Casos de éxito</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CASOS.map((c) => (
              <div key={c} data-r className="hud px-6 py-5 text-center text-slate-200">{c}</div>
            ))}
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

      {/* CONTACTO */}
      <section id="contacto" className="mx-auto max-w-4xl px-5 py-24">
        <Reveal>
          <div data-r className="hud p-10 text-center md:p-14">
            <h2 className="titulo-neon font-display text-3xl font-bold md:text-5xl">Consulta con nuestros especialistas</h2>
            <p className="mt-4 text-lg text-slate-300">Cotización personalizada para tu empresa, institución o proyecto.</p>
            <Link href="/cotizar" className="btn-neon mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-sm">
              <ClipboardList size={18} /> ABRIR EL COTIZADOR
            </Link>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 text-slate-200 sm:flex-row sm:gap-10">
              <span className="flex items-center gap-2"><MapPin size={18} className="text-claro" /> Jr. Huaraz 1841, Breña, Lima</span>
              <span className="flex items-center gap-2"><Globe size={18} className="text-claro" /> www.quamtu.com</span>
            </div>
          </div>
        </Reveal>
      </section>

    </main>
  );
}
