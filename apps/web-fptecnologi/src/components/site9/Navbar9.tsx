import Image from 'next/image';
import { COTIZADOR_URL } from '@/lib/content';
import { ArrowUpRightIcon } from '@/components/site/icons';

/* Secciones reales (ver src/lib/nav.ts) -- nada de
   Ecosystem/Economics/Developers/Governance del spec original de RIVR. */
const NAV = [
  { label: 'Servicios', href: '/#servicios' },
  { label: 'Tienda', href: '/#catalogo' },
  { label: 'Marcas', href: '/#marcas' },
  { label: 'Nosotros', href: '/#nosotros' },
];

/**
 * Navbar del Modelo 9 -- misma estructura de 3 zonas del spec de RIVR (logo
 * a la izquierda, nav centrado, botón redondeado a la derecha), con el logo
 * real de FPTecnologi en vez del wordmark "RIVR" (el spec original ni
 * siquiera mostraba logo en desktop, solo un spacer -- para un cliente real
 * eso deja el header sin marca, así que acá el logo se ve siempre).
 */
export function Navbar9() {
  return (
    <nav className="relative z-10 flex w-full items-center justify-between px-6 py-6 md:px-10">
      <div className="flex flex-1 items-center">
        <a href="/" aria-label="FPTecnologi & System">
          <Image src="/logo-fptecnologi.svg" alt="FPTecnologi & System" width={130} height={30} className="h-6 w-auto md:h-7" />
        </a>
      </div>

      <ul className="hidden items-center gap-8 text-sm text-[rgb(45,45,45)] md:flex">
        {NAV.map((item) => (
          <li key={item.href}>
            <a href={item.href} className="transition-opacity hover:opacity-70">
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex flex-1 justify-end">
        <a
          href={COTIZADOR_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-full bg-[rgba(30,50,90,0.8)] py-1.5 pl-2 pr-4 text-white transition-[background-color,transform] duration-200 hover:bg-[rgba(30,50,90,1)] active:scale-[0.98] md:gap-3 md:py-2 md:pr-6"
        >
          <span className="flex items-center justify-center rounded-full bg-white/20 p-1 md:p-1.5">
            <ArrowUpRightIcon className="h-4 w-4 text-white md:h-5 md:w-5" />
          </span>
          <span className="text-xs font-normal md:text-sm">Cotizar ahora</span>
        </a>
      </div>
    </nav>
  );
}
