'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { COTIZADOR_URL } from '@/lib/content';

/* Secciones reales del sitio (ver src/lib/nav.ts) -- nada de
   Benefits/How It Works/FAQs/Pricing del spec original de Vesper.ai. */
const NAV = [
  { label: 'Servicios', href: '/#servicios' },
  { label: 'Tienda', href: '/#catalogo' },
  { label: 'Marcas', href: '/#marcas' },
  { label: 'Contacto', href: '/#contacto' },
];

/**
 * Header del Modelo 8 -- nav en "pastillas" de metal líquido (degradé gris +
 * brillo diagonal al pasar el mouse), mismo lenguaje visual del spec de
 * referencia (Vesper.ai) pero con logo/links/CTA reales de FPTecnologi. El
 * "metal líquido" y el brillo son solo gradientes + `before:` de Tailwind
 * (arbitrary values), sin canvas ni librería de animación.
 */
export function Header8() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onResize() {
      if (window.innerWidth >= 901) setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <header className="relative z-50 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-5 lg:px-10">
      <a href="#top" className="v8-appear v8-appear--scale flex items-center gap-2 justify-self-start" style={{ animationDelay: '80ms' }}>
        <Image src="/logo-fptecnologi.svg" alt="FPTecnologi & System" width={150} height={36} priority className="h-7 w-auto brightness-0 invert" />
      </a>

      <nav className="hidden items-center gap-2 justify-self-center lg:flex" aria-label="Principal">
        {NAV.map((item, i) => (
          <a
            key={item.href}
            href={item.href}
            className="v8-appear v8-appear--scale group relative isolate flex h-10 items-center overflow-hidden rounded-[7px] border border-white/35 px-[18px] text-sm text-white/90 transition-[border-color,box-shadow] duration-300 before:absolute before:inset-0 before:-z-10 before:-translate-x-[120%] before:bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.16)_50%,transparent_70%)] before:transition-transform before:duration-500 hover:border-white/70 hover:shadow-[0_0_18px_rgba(200,210,230,0.18)] hover:before:translate-x-[120%]"
            style={{
              animationDelay: `${160 + i * 120}ms`,
              background: 'linear-gradient(105deg, #050505 0%, #2a2a2a 48%, #4a4a4a 100%)',
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center justify-self-end gap-3">
        <a
          href={COTIZADOR_URL}
          target="_blank"
          rel="noreferrer"
          className="v8-appear v8-appear--scale hidden h-10 items-center rounded-md border border-white/35 bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(0,0,0,0.45)_50%,rgba(160,175,200,0.08))] px-5 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-shadow duration-300 hover:border-white/70 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_0_20px_rgba(170,200,255,0.22)] lg:inline-flex"
          style={{ animationDelay: '340ms' }}
        >
          Cotizar ahora
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-controls="site8-nav"
          aria-expanded={open}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          className="v8-appear v8-appear--scale flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-black/40 lg:hidden"
          style={{ animationDelay: '340ms' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            {open ? (
              <path d="M6 6l12 12M18 6 6 18" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div id="site8-nav" className="absolute inset-x-0 top-full z-40 flex flex-col gap-2 border-t border-white/10 bg-black/95 p-4 backdrop-blur-xl lg:hidden">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg px-4 py-3 text-sm text-white/85 hover:bg-white/5">
              {item.label}
            </a>
          ))}
          <a
            href={COTIZADOR_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="mt-1 rounded-lg bg-white px-4 py-3 text-center text-sm font-semibold text-black"
          >
            Cotizar ahora
          </a>
        </div>
      )}
    </header>
  );
}
