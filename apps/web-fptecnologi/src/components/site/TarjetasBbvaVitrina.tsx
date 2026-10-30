'use client';

import { useEffect, useState, type PointerEvent } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, X } from 'lucide-react';
import { AbanicoBbva, GAMAS, HREF_BBVA, LogoBbva, TARJETAS, TarjetaBbva } from './BannerBbva';

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
    <span className="flex gap-1" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${n <= gama ? (claro ? 'bg-[#85C8FF]' : 'bg-[#001391]') : claro ? 'bg-white/15' : 'bg-ink/10'}`} />
      ))}
    </span>
  );
}

/* Vitrina de la landing: escenario con la tarjeta elegida (grande, se inclina con el cursor) y la lista para
   elegir, por red. Avanza sola cada 4 s hasta que el visitante elige una. */
export function TarjetasBbvaVitrina() {
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
    <section id="tarjetas" className="scroll-mt-28 bg-paper py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              <span className="text-ink">Conoce las tarjetas</span> <span className="title-shimmer-light">que puedes obtener</span>
            </h2>
            <p className="mt-3 max-w-2xl text-ink/65">De la que te ayuda a empezar a la más exclusiva. BBVA te dirá cuáles tienes preaprobadas según tu perfil.</p>
          </div>
          <div role="tablist" aria-label="Red de la tarjeta" className="inline-flex self-start rounded-xl bg-white p-1 shadow-md shadow-brand-dark/10 lg:self-auto">
            {(['visa', 'mastercard'] as const).map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={red === r}
                onClick={() => cambiarRed(r)}
                className={`h-10 rounded-lg px-6 text-sm font-semibold transition-colors ${red === r ? 'bg-[#001391] text-white' : 'text-ink/70 hover:text-[#001391]'}`}
              >
                {r === 'visa' ? 'Visa' : 'Mastercard'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
          {/* Escenario: la tarjeta elegida, grande. */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#070E46] via-[#001391] to-[#004481] p-6 text-white shadow-2xl shadow-[#001391]/25 sm:p-10">
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#85C8FF]/25 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-[#1973e8]/35 blur-3xl" />
            <div className="relative grid items-center gap-8 sm:grid-cols-[auto_1fr]">
              <div className="mx-auto [perspective:900px]">
                <div onPointerMove={inclinar} onPointerLeave={soltar} className="transition-transform duration-200 ease-out">
                  <TarjetaBbva key={sel.id} id={sel.id} eager className="w-32 animate-[fade-up_0.5s_ease-out_both] sm:w-44 lg:w-48" />
                </div>
              </div>
              <div className="text-center sm:text-left" aria-live="polite">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#85C8FF]">{GAMAS[sel.gama]}</p>
                <h3 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">{sel.nombre}</h3>
                <div className="mx-auto mt-4 max-w-56 sm:mx-0">
                  <BarraGama gama={sel.gama} claro />
                </div>
                <p className="mt-5 text-sm text-white/80">Ingresa tu DNI y BBVA te dirá si esta u otra tarjeta está preaprobada para ti, con su línea de crédito y tasa.</p>
                <a href="#consulta" className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-[#85C8FF] px-6 text-sm font-semibold text-[#070E46] transition-colors hover:bg-white">
                  Ver si la tengo preaprobada <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                </a>
              </div>
            </div>
          </div>

          {/* Lista para elegir: en celular, carrusel horizontal; en escritorio, columna. */}
          <ol key={red} className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {lista.map((t, i) => {
              const activa = t.id === sel.id;
              return (
                <li key={t.id} className="w-56 shrink-0 snap-start animate-[fade-up_0.45s_ease-out_both] lg:w-auto" style={{ animationDelay: `${i * 70}ms` }}>
                  <button
                    type="button"
                    onClick={() => elegir(t)}
                    onMouseEnter={() => elegir(t)}
                    aria-pressed={activa}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-all duration-300 ${activa ? 'border-[#001391]/30 bg-white shadow-lg shadow-[#001391]/15 lg:translate-x-1' : 'border-transparent bg-white/60 hover:bg-white'}`}
                  >
                    <TarjetaBbva id={t.id} className={`w-10 shrink-0 transition-transform duration-300 ${activa ? '-rotate-6 scale-110' : ''}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-sm font-bold text-ink">{t.nombre}</span>
                      <span className="mt-0.5 block text-xs text-ink/60">{GAMAS[t.gama]}</span>
                      <span className="mt-2 block max-w-28">
                        <BarraGama gama={t.gama} />
                      </span>
                    </span>
                    <ArrowRight className={`h-4 w-4 shrink-0 transition-all ${activa ? 'text-[#001391]' : 'text-ink/25'}`} strokeWidth={2.2} />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

const CLAVE = 'bbva-popup-visto';
const PAGINAS = ['/tienda', '/producto', '/marcas', '/carrito'];

/* Aviso en esquina con el abanico de tarjetas: tienda, productos y carrito; una vez por sesión,
   al bajar la mitad de la página o a los 25 s. Nunca en checkout (no distraer el pago). */
export function PopupBbva() {
  const ruta = usePathname();
  const [visible, setVisible] = useState(false);
  const aplica = PAGINAS.some((p) => ruta.startsWith(p));

  useEffect(() => {
    if (!aplica) return;
    try {
      if (sessionStorage.getItem(CLAVE)) return;
    } catch {
      return;
    }
    const mostrar = () => {
      setVisible(true);
      try {
        sessionStorage.setItem(CLAVE, '1');
      } catch {
        /* sin almacenamiento: igual se muestra una vez en esta vista */
      }
      window.removeEventListener('scroll', alBajar);
      clearTimeout(t);
    };
    const alBajar = () => {
      if (window.scrollY > (document.documentElement.scrollHeight - window.innerHeight) * 0.5) mostrar();
    };
    const t = setTimeout(mostrar, 25_000);
    window.addEventListener('scroll', alBajar, { passive: true });
    return () => {
      window.removeEventListener('scroll', alBajar);
      clearTimeout(t);
    };
  }, [aplica, ruta]);

  if (!visible || !aplica) return null;
  return (
    <aside
      role="dialog"
      aria-label="Tarjetas de crédito BBVA"
      className="fixed bottom-24 left-4 z-50 w-[min(20rem,calc(100vw-2rem))] animate-[fade-up_0.4s_ease-out_both] overflow-hidden rounded-2xl bg-gradient-to-br from-[#070E46] via-[#004481] to-[#001391] p-5 text-white shadow-2xl shadow-[#001391]/40"
    >
      <button type="button" onClick={() => setVisible(false)} aria-label="Cerrar" className="absolute right-3 top-3 z-10 rounded-lg p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
        <X className="h-4 w-4" />
      </button>
      <LogoBbva blanco className="h-4" />
      <AbanicoBbva className="mx-auto mt-2 w-48" />
      <p className="mt-2 font-display text-lg font-bold leading-snug">¿Ya sabes qué tarjeta BBVA tienes preaprobada?</p>
      <p className="mt-1 text-xs text-white/80">Consulta con tu DNI en 1 minuto. Sin costo.</p>
      <a href={`${HREF_BBVA}#consulta`} onClick={() => setVisible(false)} className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#85C8FF] text-sm font-semibold text-[#070E46] transition-colors hover:bg-white">
        Ver mis tarjetas <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
      </a>
    </aside>
  );
}
