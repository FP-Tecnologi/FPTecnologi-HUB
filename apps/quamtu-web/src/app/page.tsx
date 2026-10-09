import Link from 'next/link';
import { Cpu, Gauge, Sparkles, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import PcEscena from '@/components/PcEscena';
import Reveal from '@/components/Reveal';
import { BUILDS, seleccionDe, total } from '@/lib/piezas';

const MARQUEE = ['RTX 40', 'RYZEN 7000', 'CORE i9', 'DDR5', 'NVMe PCIe 5.0', 'ARGB', 'WI-FI 6E', '4K 144 Hz'];

const PASOS = [
  { n: '01', t: 'Elige tu gabinete', d: 'Define el carácter de tu PC: tamaño, vidrio y luces.' },
  { n: '02', t: 'Suma componentes', d: 'Procesador, tarjeta de video, RAM… cada pieza entra al 3D al instante.' },
  { n: '03', t: 'Revisa y compra', d: 'Compatibilidad verificada, precio en vivo y armado por nuestros técnicos.' },
];

const POR_QUE = [
  { i: Cpu, t: 'Compatibilidad garantizada', d: 'El armador bloquea combinaciones que no funcionan: nada de sorpresas.' },
  { i: Gauge, t: 'Probada antes de enviarla', d: 'Cada PC pasa pruebas de estrés y temperatura en nuestro laboratorio.' },
  { i: ShieldCheck, t: 'Garantía real', d: 'Soporte técnico directo con quien la armó.' },
  { i: Truck, t: 'Envío a todo el Perú', d: 'Embalaje reforzado y seguimiento hasta tu puerta.' },
];

export default function Home() {
  const hero = seleccionDe(BUILDS[2].ids);
  return (
    <main>
      {/* HERO */}
      <section className="relative isolate flex min-h-screen items-center overflow-hidden pt-16">
        <div className="rejilla absolute inset-0 -z-10" />
        <div className="absolute -left-40 top-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-violet/25 blur-[140px]" />
        <div className="absolute -right-40 bottom-0 -z-10 h-[500px] w-[500px] rounded-full bg-cyan/20 blur-[140px]" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-4 px-5 lg:grid-cols-2">
          <Reveal>
            <p data-r className="mb-4 inline-block rounded-full border border-cyan/40 px-4 py-1 text-xs tracking-[0.3em] text-cyan">
              PC GAMER A TU MEDIDA
            </p>
            <h1 data-r className="titulo-neon font-display text-5xl font-black leading-[1.05] md:text-7xl">
              Tu PC.<br />Pieza por pieza.
            </h1>
            <p data-r className="mt-6 max-w-lg text-lg text-slate-400">
              Elige cada componente y mira cómo tu equipo cobra vida en 3D antes de comprarlo. Nosotros lo armamos, lo probamos y lo enviamos.
            </p>
            <div data-r className="mt-9 flex flex-wrap gap-4">
              <Link href="/armar" className="btn-neon inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm">
                ARMA TU PC <ArrowRight size={18} />
              </Link>
              <Link href="#builds" className="glass inline-flex items-center rounded-full px-8 py-4 text-sm text-slate-200 hover:border-cyan">
                Ver builds listos
              </Link>
            </div>
          </Reveal>
          <PcEscena sel={hero} className="h-[420px] md:h-[640px]" />
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-line bg-panel/60 py-4">
        <div className="flex w-max gap-12 whitespace-nowrap font-display text-sm tracking-[0.35em] text-slate-500 [animation:marquee_28s_linear_infinite]">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="flex items-center gap-12">{m}<Sparkles size={14} className="text-cyan" /></span>
          ))}
        </div>
      </div>

      {/* PASOS */}
      <section id="pasos" className="mx-auto max-w-7xl px-5 py-28">
        <Reveal>
          <h2 data-r className="font-display text-3xl font-black md:text-5xl">
            Construye tu <span className="titulo-neon">nueva PC</span>
          </h2>
          <p data-r className="mt-4 max-w-xl text-slate-400">Tres pasos. Sin saber de hardware.</p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PASOS.map((p) => (
              <div key={p.n} data-r className="glass group rounded-2xl p-8 transition hover:-translate-y-1 hover:border-cyan/60">
                <span className="font-display text-5xl font-black text-line transition group-hover:text-cyan">{p.n}</span>
                <h3 className="mt-4 text-xl font-bold">{p.t}</h3>
                <p className="mt-2 text-slate-400">{p.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* BUILDS LISTOS */}
      <section id="builds" className="relative bg-panel/50 py-28">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal>
            <h2 data-r className="font-display text-3xl font-black md:text-5xl">
              Juega como los <span className="titulo-neon">pros</span>
            </h2>
            <p data-r className="mt-4 max-w-xl text-slate-400">Builds listos para comprar. Personalízalos en el armador cuando quieras.</p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {BUILDS.map((b, i) => {
                const s = seleccionDe(b.ids);
                return (
                  <article key={b.nombre} data-r className="glass flex flex-col overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:border-violet/70">
                    <PcEscena sel={s} auto className="h-56" />
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-bold">{b.nombre}</h3>
                        <span className="rounded-full bg-violet/20 px-3 py-1 text-xs text-violet">{b.tag}</span>
                      </div>
                      <ul className="mt-4 flex-1 space-y-1 text-sm text-slate-400">
                        <li>{s.cpu?.nombre}</li>
                        <li>{s.gpu?.nombre}</li>
                        <li>{s.ram?.nombre}</li>
                        <li>{s.ssd?.nombre}</li>
                      </ul>
                      <p className="mt-5 font-display text-2xl font-black text-cyan">S/ {total(s).toLocaleString('es-PE')}</p>
                      <Link href={`/armar?build=${i}`} className="btn-neon mt-4 rounded-full py-3 text-center text-xs">PERSONALIZAR</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* POR QUÉ */}
      <section id="por-que" className="mx-auto max-w-7xl px-5 py-28">
        <Reveal>
          <h2 data-r className="font-display text-3xl font-black md:text-5xl">
            Potencia y belleza <span className="titulo-neon">en un solo case</span>
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {POR_QUE.map(({ i: Icono, t, d }) => (
              <div key={t} data-r className="rounded-2xl border border-line p-7 transition hover:border-cyan/50">
                <Icono className="text-cyan" size={30} />
                <h3 className="mt-5 font-bold">{t}</h3>
                <p className="mt-2 text-sm text-slate-400">{d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-28 text-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-violet/15 to-transparent" />
        <Reveal className="mx-auto max-w-3xl px-5">
          <h2 data-r className="titulo-neon font-display text-4xl font-black md:text-6xl">¿Listo para armar la tuya?</h2>
          <Link data-r href="/armar" className="btn-neon mt-10 inline-flex items-center gap-2 rounded-full px-10 py-4 text-sm">
            EMPEZAR AHORA <ArrowRight size={18} />
          </Link>
        </Reveal>
      </section>

      <footer className="border-t border-line py-10 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Quamtu · Una marca de FP Tecnologi
      </footer>
    </main>
  );
}
