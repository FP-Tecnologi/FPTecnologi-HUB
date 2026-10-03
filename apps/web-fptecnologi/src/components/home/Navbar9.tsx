'use client';

import Image from 'next/image';
import { User } from 'lucide-react';
import { useState } from 'react';
import { COTIZADOR_URL } from '@/lib/content';
import { ArrowUpRightIcon } from '@/components/site/icons';
import { DesktopNav, MobileNav } from './MainNav';
import { ClickConfirmButton } from './ClickConfirmButton';
import { CartButton } from './CartButton';
import { CurrencyToggle } from './CurrencyToggle';
import { useCart } from '@/context/CartContext';

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
const COTIZAR_SIZE = 'h-10 pl-2 pr-4 text-xs md:text-sm lg:h-auto lg:py-1.5 lg:pl-1.5 lg:pr-4 xl:text-[15px] 2xl:py-2 2xl:pl-2 2xl:pr-5 2xl:text-base';

export function Navbar9({ compact = false, store = false }: { compact?: boolean; store?: boolean }) {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <nav className={`relative z-10 w-full transition-[padding] duration-500 ease-in-out ${compact ? 'px-4 py-2.5 md:px-5' : 'px-6 py-6 md:px-10 2xl:px-14 2xl:py-8'}`}>
      <div className="flex w-full items-center justify-between">
        <a href="/" aria-label="FPTecnologi & System" className="flex flex-1 items-center">
          <Image
            src="/logo-fptecnologi.svg"
            alt="FPTecnologi & System"
            width={168}
            height={40}
            className={`w-auto brightness-0 invert transition-[height] duration-500 ease-in-out ${compact ? 'h-6 2xl:h-7' : 'h-8 md:h-10 2xl:h-[60px]'}`}
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
          {/* Tienda: selector de moneda + carrito siempre visible, sin
              Cotizar. Resto del sitio: carrito solo si hay algo agregado. */}
          {store && <CurrencyToggle className={`max-sm:hidden ${compact ? 'h-9' : 'h-10 lg:h-11 2xl:h-12'}`} />}
          {(store || count > 0) && <CartButton tone="dark" compact={compact} />}
          {store && (
            <a href="/cuenta" aria-label="Mi cuenta: mis pedidos y cotizaciones" title="Mi cuenta" className={`flex items-center justify-center rounded-xl border border-white/25 text-white transition-colors hover:border-white hover:bg-white/5 max-sm:hidden ${compact ? 'h-9 w-9' : 'h-10 w-10 lg:h-11 lg:w-11 2xl:h-12 2xl:w-12'}`}>
              <User className="h-5 w-5" strokeWidth={1.8} />
            </a>
          )}
          {!store && (
          <>
          {/* Efecto sweep al click (mismo patrón que "Agregar al carrito",
              ver ClickConfirmButton): el ícono viaja de izquierda a derecha
              mientras el texto se borra en su camino (900ms), recién ahí
              navega al cotizador interno (/cotizador). El fondo/chip del
              ícono no gira -- solo el glyph de adentro (90°), en hover y
              apenas arranca el sweep. Misma altura que el botón de
              hamburguesa (h-10) para que queden alineados. */}
          <ClickConfirmButton
            icon={(rotated) => (
              <span className={`flex items-center justify-center rounded-lg ${compact ? "bg-brand-primary" : "bg-white/20"} p-1 md:p-1.5`}>
                <ArrowUpRightIcon className={`h-4 w-4 text-white transition-transform duration-300 md:h-5 md:w-5 ${rotated ? 'rotate-45' : ''}`} />
              </span>
            )}
            label="Cotizar"
            doneIcon={() => (
              <span className={`flex items-center justify-center rounded-lg ${compact ? "bg-brand-primary" : "bg-white/20"} p-1 md:p-1.5`}>
                <ArrowUpRightIcon className="h-4 w-4 text-white md:h-5 md:w-5" />
              </span>
            )}
            doneLabel="Cotizar"
            onConfirm={() => {
              window.location.href = COTIZADOR_URL;
            }}
            // Sin alto/ancho fijo en desktop: el botón se ajusta al texto
            // (padding parejo). h-10 solo debajo de lg, para alinear con la
            // hamburguesa.
            className={`hidden items-center rounded-xl font-normal uppercase tracking-wide transition-colors duration-200 sm:flex ${compact ? "bg-white text-brand-700 hover:bg-brand-50" : "bg-brand-primary text-white hover:bg-[#0b68b8]"} ${COTIZAR_SIZE}`}
            doneClassName={`hidden items-center rounded-xl font-normal uppercase tracking-wide sm:flex ${compact ? "bg-white text-brand-700" : "bg-brand-primary text-white"} ${COTIZAR_SIZE}`}
          />
          </>
          )}

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
        <div className="mt-3 flex flex-col gap-1 rounded-2xl border border-white/15 bg-brand-primary p-3 lg:hidden">
          <MobileNav tone="dark" onNavigate={() => setOpen(false)} />
          {store && (
            <div className="mt-1 flex items-center justify-between gap-3 border-t border-white/15 pt-3 sm:hidden">
              <CurrencyToggle className="h-10" />
              <a href="/cuenta" className="flex h-10 items-center gap-2 whitespace-nowrap rounded-xl border border-white/25 px-3 text-sm font-semibold text-white">
                <User className="h-4 w-4" strokeWidth={1.8} /> Mi cuenta
              </a>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
