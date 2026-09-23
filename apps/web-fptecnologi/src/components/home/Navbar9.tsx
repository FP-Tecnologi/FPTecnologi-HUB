'use client';

import Image from 'next/image';
import { useState } from 'react';
import { COTIZADOR_URL } from '@/lib/content';
import { ArrowUpRightIcon } from '@/components/site/icons';
import { DesktopNav, MobileNav } from './MainNav';
import { ClickConfirmButton } from './ClickConfirmButton';

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
export function Navbar9({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className={`relative z-10 w-full ${compact ? 'px-4 py-2.5 md:px-5' : 'px-6 py-6 md:px-10'}`}>
      <div className="flex w-full items-center justify-between">
        <a href="/" aria-label="FPTecnologi & System" className="flex flex-1 items-center">
          <Image
            src="/logo-fptecnologi.svg"
            alt="FPTecnologi & System"
            width={168}
            height={40}
            className={`w-auto brightness-0 invert ${compact ? 'h-6' : 'h-8 md:h-10'}`}
          />
        </a>

        <div className="hidden lg:flex">
          {/* tone="darkAccent" -- links del nav en celeste (no blanco liso),
              pedido explícito para el Hero. dropdownVariant="accent" -- el
              mismo submenú que usa Header5 (Modelo 5) en la guía de
              estilos, solo el estilo del submenú, no el resto del header. */}
          <DesktopNav tone="darkAccent" dropdownVariant="accent" />
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Efecto sweep al click (mismo patrón que "Agregar al carrito",
              ver ClickConfirmButton): el ícono viaja de izquierda a derecha
              mientras el texto se borra en su camino (900ms), recién ahí
              abre el cotizador en una pestaña nueva. El fondo/chip del
              ícono no gira -- solo el glyph de adentro (90°), en hover y
              apenas arranca el sweep. Misma altura que el botón de
              hamburguesa (h-10) para que queden alineados. */}
          <ClickConfirmButton
            icon={(rotated) => (
              <span className="flex items-center justify-center rounded-lg bg-white/20 p-1 md:p-1.5">
                <ArrowUpRightIcon className={`h-4 w-4 text-white transition-transform duration-300 md:h-5 md:w-5 ${rotated ? 'rotate-45' : ''}`} />
              </span>
            )}
            label="Cotizar"
            doneIcon={() => (
              <span className="flex items-center justify-center rounded-lg bg-white/20 p-1 md:p-1.5">
                <ArrowUpRightIcon className="h-4 w-4 text-white md:h-5 md:w-5" />
              </span>
            )}
            doneLabel="Cotizar"
            onConfirm={() => window.open(COTIZADOR_URL, '_blank', 'noopener,noreferrer')}
            className={`hidden items-center rounded-xl bg-brand-dark/85 font-normal uppercase tracking-wide text-white transition-colors duration-200 hover:bg-brand-dark sm:flex ${
              compact ? 'h-9 pl-1.5 pr-3 text-[11px]' : 'h-10 pl-2 pr-4 text-xs md:pr-6 md:text-sm'
            }`}
            doneClassName={`hidden items-center rounded-xl bg-brand-dark font-normal uppercase tracking-wide text-white sm:flex ${
              compact ? 'h-9 pl-1.5 pr-3 text-[11px]' : 'h-10 pl-2 pr-4 text-xs md:pr-6 md:text-sm'
            }`}
          />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`flex items-center justify-center rounded-lg border border-white/20 bg-white/10 backdrop-blur-md lg:hidden ${
              compact ? 'h-9 w-9' : 'h-10 w-10'
            }`}
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
        <div className="mt-3 flex flex-col gap-1 rounded-2xl border border-white/15 bg-black/70 p-3 backdrop-blur-xl lg:hidden">
          <MobileNav tone="dark" onNavigate={() => setOpen(false)} />
        </div>
      )}
    </nav>
  );
}
