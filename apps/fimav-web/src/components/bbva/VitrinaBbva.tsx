'use client';
import { useEffect, useState, type PointerEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { GAMAS, TARJETAS, TarjetaBbva } from './Tarjetas';

/** Inclina la tarjeta hacia el cursor (efecto 3D); vuelve a su sitio al salir. */
function inclinar(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  el.style.transform = `perspective(900px) rotateY(${x * 22}deg) rotateX(${-y * 16}deg)`;
}
const soltar = (e: PointerEvent<HTMLElement>) => (e.currentTarget.style.transform = '');

type Tarjeta = (typeof TARJETAS)[number];

/** Barra de 5 segmentos con la gama de la tarjeta. */
function BarraGama({ gama, claro = false }: { gama: number; claro?: boolean }) {
  return (
    <span className="flex gap-1" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= gama ? (claro ? 'bg-[#85C8FF]' : 'bg-rojo') : claro ? 'bg-white/15' : 'bg-carbon/15'}`} />
      ))}
    </span>
  );
}

/* Vitrina: escenario con la tarjeta elegida (grande, se inclina con el cursor) y la lista para elegir, por red.
   Avanza sola cada 4 s hasta que el visitante elige una. */
export default function VitrinaBbva() {
  const [red, setRed] = useState<'visa' | 'mastercard'>('visa');
  const lista = TARJETAS.filter((t) => t.red === red);
  const [sel, setSel] = useState<Tarjeta>(lista[0]);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setSel((s) => lista[(lista.findIndex((x) => x.id === s.id) + 1) % lista.length]), 4000);
    return () => clearInterval(t);
  }, [auto, lista]);

  const cambiarRed = (r: 'visa' | 'mastercard') => {
    setRed(r);
    setSel(TARJETAS.find((t) => t.red === r)!);
  };
  const elegir = (t: Tarjeta) => {
    setAuto(false);
    setSel(t);
  };

  return (
    <div>
      <div role="group" aria-label="Red de la tarjeta" className="inline-flex gap-2">
        {(['visa', 'mastercard'] as const).map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={red === r}
            onClick={() => cambiarRed(r)}
            className={`min-h-11 rounded-lg px-6 font-display text-lg font-bold uppercase tracking-widest transition-colors ${red === r ? 'bg-carbon text-white' : 'bg-gris text-carbon hover:text-rojo-hondo'}`}
          >
            {r === 'visa' ? 'Visa' : 'Mastercard'}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
        <div className="relative flex items-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#070E46] via-[#001391] to-[#004481] p-6 text-white sm:p-10">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-[#85C8FF]/25 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-16 size-72 rounded-full bg-[#1973e8]/35 blur-3xl" />
          <div className="relative grid w-full items-center gap-8 sm:grid-cols-[auto_1fr]">
            <div className="mx-auto [perspective:900px]">
              <div onPointerMove={inclinar} onPointerLeave={soltar} className="transition-transform duration-200 ease-out">
                <TarjetaBbva key={sel.id} id={sel.id} eager className="w-32 sm:w-44 lg:w-48" />
              </div>
            </div>
            <div className="text-center sm:text-left" aria-live="polite">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-[#85C8FF]">{GAMAS[sel.gama]}</p>
              <h3 className="mt-2 font-display text-3xl font-extrabold uppercase leading-tight tracking-wide sm:text-4xl">{sel.nombre}</h3>
              <div className="mx-auto mt-4 max-w-56 sm:mx-0"><BarraGama gama={sel.gama} claro /></div>
              <p className="mt-5 text-white/85">Ingresa tu DNI y BBVA te dirá si esta u otra tarjeta está preaprobada para ti, con su línea de crédito y tasa.</p>
              <a href="#consulta" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#85C8FF] px-6 font-semibold text-[#070E46] transition-colors hover:bg-white">
                Ver si la tengo preaprobada <ArrowRight aria-hidden="true" size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Lista para elegir: en celular, carrusel horizontal; en escritorio, columna. */}
        <ol key={red} className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:justify-center lg:overflow-visible lg:px-0 lg:pb-0">
          {lista.map((t) => {
            const activa = t.id === sel.id;
            return (
              <li key={t.id} className="w-56 shrink-0 snap-start lg:w-auto">
                <button
                  type="button"
                  onClick={() => elegir(t)}
                  onMouseEnter={() => elegir(t)}
                  aria-pressed={activa}
                  className={`flex min-h-11 w-full items-center gap-4 rounded-2xl border-2 p-3 text-left transition-colors ${activa ? 'border-rojo bg-white' : 'border-transparent bg-gris hover:bg-white'}`}
                >
                  <TarjetaBbva id={t.id} className="w-10 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="titulo-menor block text-base text-carbon">{t.nombre}</span>
                    <span className="mt-0.5 block text-sm text-carbon/80">{GAMAS[t.gama]}</span>
                    <span className="mt-2 block max-w-28"><BarraGama gama={t.gama} /></span>
                  </span>
                  <ArrowRight aria-hidden="true" size={18} className={`shrink-0 ${activa ? 'text-rojo' : 'text-carbon/40'}`} />
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
