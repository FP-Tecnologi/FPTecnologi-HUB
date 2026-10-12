import Link from 'next/link';
import { ArrowRight, ClipboardList, FileSearch, MessageCircle, PackageCheck } from 'lucide-react';
import ComparaLineas from '@/components/ComparaLineas';
import Faq from '@/components/Faq';
import Reveal from '@/components/Reveal';
import { waUrl } from '@/lib/contacto';
import { CASOS, PARA_ORGANIZACIONES } from '@/lib/contenido';
import { BUILDS, CATS, seleccionDe, total } from '@/lib/piezas';

export const metadata = { title: 'Propuesta B: ficha técnica — Quamtu', robots: { index: false } };

const PASOS = [
  { i: FileSearch, t: 'Cuéntanos qué necesitas', d: 'Productos y cantidades en el cotizador, con tus datos y RUC.' },
  { i: ClipboardList, t: 'Recibe tu cotización formal', d: 'Un especialista confirma precio final, stock y entrega.' },
  { i: PackageCheck, t: 'Te entregamos el equipo', d: 'Armado bajo estándares rigurosos y soporte post-venta.' },
];

// Propuesta B: la ficha técnica como protagonista y las organizaciones primero.
export default function PropuestaB() {
  const b = BUILDS[2];
  const s = seleccionDe(b.ids);
  return (
    <main>
      <section className="zona-oscura relative isolate overflow-hidden pt-28 pb-20">
        <div className="absolute inset-0 -z-10 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url(/brand/fondo-red.jpg)' }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-bg/40 via-bg/70 to-bg" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h1 style={{ ["--i" as string]: 0 }} className="entra font-display text-4xl font-bold leading-[1.05] text-white md:text-6xl">
              Cada equipo, con su <span className="titulo-neon">ficha técnica</span>.
            </h1>
            <p style={{ ["--i" as string]: 1 }} className="entra mt-6 max-w-xl text-xl text-slate-300">
              Computadoras y workstations configuradas a medida para empresas e instituciones. Eliges piezas, ves la especificación y recibes una cotización formal con factura.
            </p>
            <div style={{ ["--i" as string]: 2 }} className="entra mt-9 flex flex-wrap gap-4">
              <Link href="/cotizar" className="btn-neon inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-sm">
                <ClipboardList size={18} /> COTIZAR AHORA
              </Link>
              <Link href="/armar" className="btn-borde inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-sm">
                ARMA TU PC <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <aside style={{ ["--i" as string]: 3 }} className="entra hud p-6 sm:p-8">
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
              <h2 className="font-display text-lg font-bold">{b.nombre}</h2>
              <span className="text-xs tracking-widest text-slate-400">FICHA · {b.linea}</span>
            </div>
            <dl className="divide-y divide-line/70">
              {CATS.map((c) => (
                <div key={c.id} className="grid grid-cols-[7rem_1fr] gap-3 py-2.5 text-sm">
                  <dt className="text-xs font-bold tracking-widest text-slate-400">{c.titulo.toUpperCase()}</dt>
                  <dd className="text-slate-200">{s[c.id]?.nombre}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
              <span className="text-xs tracking-widest text-slate-400">PRECIO REFERENCIAL</span>
              <b className="font-display text-3xl text-claro">S/ {total(s).toLocaleString('es-PE')}</b>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-line bg-panel/50 py-16">
        <Reveal className="mx-auto max-w-7xl px-5">
          <h2 data-r className="text-center font-display text-2xl font-bold md:text-3xl">Instituciones que confían en <span className="titulo-neon">Quamtu</span></h2>
          <ul data-r className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            {CASOS.map((c) => (
              <li key={c.f} className="flex flex-col items-center text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/clientes/${c.f}.webp`} alt={`Logo de ${c.n}`} width={160} height={160} loading="lazy" className="h-24 w-24 rounded-full sm:h-28 sm:w-28" />
                <span className="mt-3 text-xs leading-snug text-slate-400">{c.n}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <Reveal className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <h2 data-r className="font-display text-3xl font-bold md:text-4xl">Pensado para <span className="titulo-neon">comprar por proyecto</span></h2>
            <dl className="mt-8 divide-y divide-line border-y border-line">
              {PARA_ORGANIZACIONES.map((p) => (
                <div key={p.t} data-r className="py-4">
                  <dt className="font-display text-base font-bold text-white">{p.t}</dt>
                  <dd className="mt-1 text-slate-300">{p.d}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div data-r>
            <h3 className="font-display text-xl font-bold text-white">Turing o Turing WS: <span className="text-claro">compáralas</span></h3>
            <ComparaLineas />
          </div>
        </Reveal>
      </section>

      <section className="bg-panel/50 py-20">
        <Reveal className="mx-auto max-w-7xl px-5">
          <h2 data-r className="font-display text-3xl font-bold md:text-4xl">Cómo <span className="titulo-neon">cotizar</span></h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {PASOS.map(({ i: Icono, t, d }) => (
              <li key={t} data-r className="flex gap-5 md:block">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-claro text-claro"><Icono size={20} /></span>
                <div className="md:mt-5"><h3 className="font-display text-xl font-bold">{t}</h3><p className="mt-2 max-w-sm text-slate-300">{d}</p></div>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <Reveal>
          <h2 data-r className="text-center font-display text-3xl font-bold md:text-5xl">Preguntas <span className="titulo-neon">frecuentes</span></h2>
          <div data-r><Faq /></div>
        </Reveal>
      </section>

      <section id="contacto" className="border-t border-line py-20 text-center">
        <div className="mx-auto max-w-2xl px-5">
          <h2 className="font-display text-3xl font-bold md:text-5xl">Pide tu cotización <span className="titulo-neon">hoy</span></h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/cotizar" className="btn-neon inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-sm"><ClipboardList size={18} /> ABRIR EL COTIZADOR</Link>
            <a href={waUrl('Hola Quamtu, necesito una cotización para mi organización.')} target="_blank" rel="noreferrer" className="btn-borde inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-sm"><MessageCircle size={18} /> ESCRÍBENOS POR WHATSAPP</a>
          </div>
        </div>
      </section>
    </main>
  );
}
