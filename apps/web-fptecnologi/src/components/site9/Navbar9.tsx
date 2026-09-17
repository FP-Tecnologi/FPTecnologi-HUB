'use client';

import Image from 'next/image';
import { useState } from 'react';
import { COTIZADOR_URL } from '@/lib/content';
import { ArrowUpRightIcon } from '@/components/site/icons';
import { DesktopNav, MobileNav } from '@/components/site/MainNav';

/**
 * Navbar del Modelo 9 -- misma estructura de 3 zonas del spec de RIVR (logo
 * a la izquierda, nav centrado, botón redondeado a la derecha), con el logo
 * real de FPTecnologi en vez del wordmark "RIVR" (el spec original ni
 * siquiera mostraba logo en desktop, solo un spacer -- para un cliente real
 * eso deja el header sin marca, así que acá el logo se ve siempre).
 *
 * El nav ahora reusa el mismo DesktopNav/MobileNav del header real del
 * sitio (site/MainNav.tsx) -- mismos links y submenús reales de Servicios/
 * Tienda (antes eran 4 links sueltos sin submenú), con tone="dark" y
 * dropdownVariant="glass" para que combine con el resto de tarjetas de
 * vidrio blanco del hero en vez del panel blanco sólido del header.
 */
export function Navbar9() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="relative z-10 w-full px-6 py-6 md:px-10">
      <div className="flex w-full items-center justify-between">
        <a href="/" aria-label="FPTecnologi & System" className="flex flex-1 items-center">
          <Image
            src="/logo-fptecnologi.svg"
            alt="FPTecnologi & System"
            width={168}
            height={40}
            className="h-8 w-auto brightness-0 invert md:h-10"
          />
        </a>

        <div className="hidden md:flex">
          <DesktopNav tone="dark" dropdownVariant="glass" />
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <a
            href={COTIZADOR_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full bg-[rgba(30,50,90,0.8)] py-1.5 pl-2 pr-4 text-white transition-[background-color,transform] duration-200 hover:bg-[rgba(30,50,90,1)] active:scale-[0.98] sm:flex md:gap-3 md:py-2 md:pr-6"
          >
            <span className="flex items-center justify-center rounded-full bg-white/20 p-1 md:p-1.5">
              <ArrowUpRightIcon className="h-4 w-4 text-white md:h-5 md:w-5" />
            </span>
            <span className="text-xs font-normal md:text-sm">Cotizar ahora</span>
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 backdrop-blur-md md:hidden"
            aria-label="Abrir menú"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
              {open ? (
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 flex flex-col gap-1 rounded-2xl border border-white/15 bg-black/70 p-3 backdrop-blur-xl md:hidden">
          <MobileNav tone="dark" onNavigate={() => setOpen(false)} />
        </div>
      )}
    </nav>
  );
}
