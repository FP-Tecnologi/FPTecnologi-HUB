'use client';

import { useEffect, useState, type PointerEvent } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, X } from 'lucide-react';
import { AbanicoBbva, HREF_BBVA, LogoBbva, TARJETAS, TarjetaBbva } from './BannerBbva';

/** Inclina la tarjeta hacia el cursor (efecto 3D); vuelve a su sitio al salir. */
function inclinar(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  el.style.transform = `perspective(700px) rotateY(${x * 18}deg) rotateX(${-y * 18}deg) translateY(-6px)`;
}
const soltar = (e: PointerEvent<HTMLElement>) => (e.currentTarget.style.transform = '');

/* Vitrina de la landing: todas las tarjetas de crédito BBVA, de menor a mayor gama, por red. */
export function TarjetasBbvaVitrina() {
  const [red, setRed] = useState<'visa' | 'mastercard'>('visa');
  const lista = TARJETAS.filter((t) => t.red === red);
  return (
    <section id="tarjetas" className="scroll-mt-28 bg-paper py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">Conoce las tarjetas</span> <span className="title-shimmer-light">que puedes obtener</span>
          </h2>
          <p className="max-w-2xl text-ink/65">De la que te ayuda a empezar a la más exclusiva. BBVA te dirá cuáles tienes preaprobadas según tu perfil.</p>
          <div role="tablist" aria-label="Red de la tarjeta" className="inline-flex rounded-xl bg-white p-1 shadow-md shadow-brand-dark/10">
            {(['visa', 'mastercard'] as const).map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={red === r}
                onClick={() => setRed(r)}
                className={`h-10 rounded-lg px-6 text-sm font-semibold transition-colors ${red === r ? 'bg-[#001391] text-white' : 'text-ink/70 hover:text-[#001391]'}`}
              >
                {r === 'visa' ? 'Visa' : 'Mastercard'}
              </button>
            ))}
          </div>
        </div>

        <ol key={red} className="mt-12 flex flex-wrap justify-center gap-5">
          {lista.map((t, i) => (
            <li key={t.id} className="w-[calc(50%-0.625rem)] animate-[fade-up_0.5s_ease-out_both] sm:w-44 lg:w-48" style={{ animationDelay: `${i * 80}ms` }}>
              <a
                href="#consulta"
                onPointerMove={inclinar}
                onPointerLeave={soltar}
                className="group flex h-full flex-col items-center rounded-2xl bg-white p-5 text-center shadow-md shadow-brand-dark/10 transition-[transform,box-shadow] duration-200 ease-out hover:shadow-xl hover:shadow-[#001391]/20"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/50">Gama {i + 1}</span>
                <TarjetaBbva id={t.id} className="mt-3 w-28 transition-transform duration-300 group-hover:scale-105" />
                <h3 className="mt-4 font-display text-base font-bold text-ink">{t.nombre}</h3>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#001391]">
                  Ver si califico <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2.2} />
                </span>
              </a>
            </li>
          ))}
        </ol>
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
