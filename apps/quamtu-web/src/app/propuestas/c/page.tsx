import Link from 'next/link';
import { ArrowRight, MessageCircle, MousePointerClick, PackageCheck } from 'lucide-react';
import Faq from '@/components/Faq';
import ImgPieza from '@/components/ImgPieza';
import PcEscena from '@/components/PcEscena';
import Reveal from '@/components/Reveal';
import SelectorUso from '@/components/SelectorUso';
import { waUrl } from '@/lib/contacto';
import { BUILDS, porId, seleccionDe } from '@/lib/piezas';

export const metadata = { title: 'Propuesta C: armador primero — Quamtu', robots: { index: false } };

const DESTACADOS = ['c2', 'r2', 'v3', 's2'];
const PASOS = [
  { i: MousePointerClick, t: 'Arma o elige', d: 'Pieza por pieza en 3D o parte de una configuración recomendada.' },
  { i: MessageCircle, t: 'Confirma por WhatsApp', d: 'Un especialista revisa tu pedido y confirma precio final y entrega.' },
  { i: PackageCheck, t: 'Recibe tu PC', d: 'Armada bajo estándares rigurosos y con soporte post-venta.' },
];

// Propuesta C: la PC a pantalla completa y el armado como puerta de entrada.
export default function PropuestaC() {
  const hero = seleccionDe(BUILDS[2].ids);
  return (
    <main>
      <section className="zona-oscura relative isolate min-h-[100svh] overflow-hidden">
        <div className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[62%]">
          <PcEscena sel={hero} poster="/brand/hero-poster.webp" diferir className="h-full w-full" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-bg via-bg/75 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-bg to-transparent" />
        <div className="mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-5 pb-16 pt-28">
          <h1 style={{ ["--i" as string]: 0 }} className="entra max-w-3xl font-display text-5xl font-bold leading-[1.02] text-white md:text-7xl">
            Mira tu PC <span className="titulo-neon">antes de comprarla</span>.
          </h1>
          <p style={{ ["--i" as string]: 1 }} className="entra mt-6 max-w-lg text-xl text-slate-300">
            Elige cada componente y mira cómo se arma en 3D. Nosotros la armamos, la probamos y te acompañamos después.
          </p>
          <div style={{ ["--i" as string]: 2 }} className="entra mt-9 flex flex-wrap gap-4">
            <Link href="/armar" className="btn-neon inline-flex items-center gap-2 rounded-full px-10 py-5 font-display text-base">
              ARMA TU PC <ArrowRight size={20} />
            </Link>
            <Link href="#uso" className="btn-borde inline-flex items-center rounded-full px-8 py-5 font-display text-sm">NO SÉ POR DÓNDE EMPEZAR</Link>
          </div>
        </div>
      </section>

      <section id="uso" className="mx-auto max-w-7xl px-5 py-24">
        <Reveal>
          <h2 data-r className="font-display text-3xl font-bold md:text-5xl">¿Para qué usarás <span className="titulo-neon">tu PC?</span></h2>
          <div data-r><SelectorUso /></div>
        </Reveal>
      </section>

      <section className="bg-panel/50 py-20">
        <Reveal className="mx-auto max-w-7xl px-5">
          <div data-r className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-bold md:text-5xl">Los más <span className="titulo-neon">elegidos</span></h2>
            <Link href="/tienda" className="btn-borde inline-flex items-center gap-2 rounded-full px-6 py-3 font-display text-xs">VER LA TIENDA <ArrowRight size={15} /></Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {DESTACADOS.map((id) => {
              const o = porId(id);
              if (!o) return null;
              return (
                <Link key={id} data-r href={`/producto/${id}`} className="hud flex flex-col overflow-hidden transition hover:-translate-y-1">
                  <ImgPieza id={o.id} cat={o.cat} color={o.color} className="h-44 w-full bg-gradient-to-br from-panel to-bg" />
                  <div className="p-5">
                    <h3 className="font-display text-base font-bold normal-case text-white">{o.nombre}</h3>
                    <p className="mt-1 text-sm text-slate-400">{o.spec}</p>
                    <p className="mt-3 font-display text-xl font-bold text-claro">S/ {o.precio.toLocaleString('es-PE')}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <Reveal>
          <h2 data-r className="font-display text-3xl font-bold md:text-5xl">Cómo <span className="titulo-neon">funciona</span></h2>
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

      <section className="bg-panel/50 py-20">
        <Reveal className="mx-auto max-w-7xl px-5">
          <h2 data-r className="text-center font-display text-3xl font-bold md:text-5xl">Preguntas <span className="titulo-neon">frecuentes</span></h2>
          <div data-r><Faq /></div>
        </Reveal>
      </section>

      <section id="contacto" className="py-24 text-center">
        <div className="mx-auto max-w-2xl px-5">
          <h2 className="font-display text-4xl font-bold md:text-6xl">Empieza <span className="titulo-neon">ahora</span></h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/armar" className="btn-neon inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-sm">ARMA TU PC <ArrowRight size={18} /></Link>
            <a href={waUrl('Hola Quamtu, necesito asesoría para elegir mi equipo.')} target="_blank" rel="noreferrer" className="btn-borde inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-sm"><MessageCircle size={18} /> WHATSAPP</a>
          </div>
        </div>
      </section>
    </main>
  );
}
