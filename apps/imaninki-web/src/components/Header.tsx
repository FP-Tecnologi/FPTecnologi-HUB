'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';
import { type Linea } from '@/lib/contenido';
import { IconoWhatsApp } from './WhatsApp';
import { useContacto } from './ContactoContext';

const enlaces = [
  { href: '/', texto: 'Inicio' },
  { href: '/nosotros', texto: 'Nosotros' },
  { href: '/contacto', texto: 'Contacto' },
];
const activo = (ruta: string, href: string) => (href === '/' ? ruta === '/' : ruta.startsWith(href));
const link = 'cabecera-link relative flex min-h-11 items-center gap-1 text-[13px] font-bold uppercase tracking-[0.12em] text-white after:absolute after:inset-x-0 after:bottom-1.5 after:h-0.5 after:origin-left after:rounded-full after:bg-rojo after:transition-transform after:duration-300 hover:after:scale-x-100';

/** Cabecera fija: transparente sobre el banner y blanca al bajar (marca html[data-scrolled]). Líneas abre un submenú. */
export default function Header({ lineas, conCatalogos = false }: { lineas: Linea[]; conCatalogos?: boolean }) {
  const { waUrl } = useContacto();
  const cotizar = waUrl('Hola Imaninki, quisiera cotizar productos para mi proyecto.');
  const ruta = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const h = document.documentElement;
    const f = () => h.toggleAttribute('data-scrolled', window.scrollY > 40);
    f();
    window.addEventListener('scroll', f, { passive: true });
    menu.current?.removeAttribute('open');
    const cerrar = (e: Event) => {
      const m = menu.current;
      if (!m?.open) return;
      if (e instanceof KeyboardEvent) { if (e.key !== 'Escape') return; m.querySelector('summary')?.focus(); }
      else if (m.contains(e.target as Node)) return;
      m.removeAttribute('open');
    };
    document.addEventListener('mousedown', cerrar);
    document.addEventListener('keydown', cerrar);
    return () => { window.removeEventListener('scroll', f); document.removeEventListener('mousedown', cerrar); document.removeEventListener('keydown', cerrar); };
  }, [ruta]);

  const Item = ({ href, texto }: { href: string; texto: string }) => (
    <Link href={href} aria-current={activo(ruta, href) ? 'page' : undefined} className={`${link} ${activo(ruta, href) ? 'after:scale-x-100' : 'after:scale-x-0'}`}>{texto}</Link>
  );

  return (
    <header className="cabecera fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-[var(--alto-cabecera)] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" aria-label="Imaninki, inicio" className="flex h-full shrink-0 items-center self-stretch rounded-b-md bg-rojo px-5 shadow-lg shadow-black/40 transition-colors hover:bg-rojo-hondo">
          <img src="/brand/imaninki-blanco.svg" alt="" width="148" height="36" fetchPriority="high" className="h-8 w-auto" />
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          <Item {...enlaces[0]} />
          {/* Submenú de líneas: se abre al pasar el mouse o con el foco del teclado. */}
          <div className="group/sub relative">
            <Link href="/#lineas" className={`${link} ${ruta.startsWith('/lineas') ? 'after:scale-x-100' : 'after:scale-x-0'}`}>
              Líneas <ChevronDown aria-hidden="true" size={16} className="transition-transform duration-300 group-hover/sub:rotate-180" />
            </Link>
            <div className="invisible absolute left-1/2 top-full w-80 -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition duration-300 group-focus-within/sub:visible group-focus-within/sub:translate-y-0 group-focus-within/sub:opacity-100 group-hover/sub:visible group-hover/sub:translate-y-0 group-hover/sub:opacity-100">
              <ul className="rounded-md bg-white p-2 shadow-2xl shadow-tinta/20 ring-1 ring-rojo/10">
                {lineas.map((l) => (
                  <li key={l.id}>
                    <Link href={`/lineas/${l.id}`} className="group flex items-center gap-3 rounded-md p-2.5 transition duration-300 hover:bg-niebla">
                      <span className="icono-caja grid size-12 shrink-0 place-items-center rounded-md bg-niebla group-hover:bg-white">
                        <img src={l.productos[0].img} alt="" className="max-h-10 max-w-10 object-contain" />
                      </span>
                      <span>
                        <b className="block text-sm text-tinta group-hover:text-rojo-hondo">{l.nombre}</b>
                        <span className="block text-xs leading-snug text-carbon/70">{l.productos.length} productos</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Item {...enlaces[1]} />
          {conCatalogos && <Item href="/catalogos" texto="Catálogos" />}
          <Item {...enlaces[2]} />
          <a href={cotizar} target="_blank" rel="noopener noreferrer" className="boton inline-flex h-11 items-center gap-2 rounded-md bg-rojo px-5 text-[13px] font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-black/30 hover:bg-rojo-hondo">
            <IconoWhatsApp className="icono-sacude size-[18px]"/>Cotizar
          </a>
        </nav>
        <details ref={menu} className="group relative lg:hidden">
          <summary className="boton grid size-11 cursor-pointer list-none place-items-center rounded-md bg-rojo text-white [&::-webkit-details-marker]:hidden [&_svg]:transition-transform group-open:[&_svg]:rotate-90">
            <Menu aria-hidden="true" className="group-open:hidden" />
            <X aria-hidden="true" className="hidden group-open:block" />
            <span className="sr-only">Abrir menú</span>
          </summary>
          <nav aria-label="Principal" className="absolute right-0 top-full mt-3 flex w-72 origin-top-right flex-col gap-1 rounded-md bg-white p-3 shadow-xl shadow-tinta/20 motion-safe:animate-[entrada_0.35s_var(--suave)]">
            {[enlaces[0], ...lineas.map((l) => ({ href: `/lineas/${l.id}`, texto: l.nombre })), enlaces[1], ...(conCatalogos ? [{ href: '/catalogos', texto: 'Catálogos' }] : []), enlaces[2]].map((e) => (
              <Link key={e.href} href={e.href} aria-current={activo(ruta, e.href) ? 'page' : undefined} className={`flex min-h-12 items-center rounded-lg border-l-4 px-3 font-semibold hover:bg-niebla hover:text-rojo-hondo ${activo(ruta, e.href) ? 'border-rojo text-rojo-hondo' : 'border-transparent text-carbon'} ${e.href.startsWith('/lineas') ? 'pl-6 text-sm' : ''}`}>
                {e.texto}
              </Link>
            ))}
            <a href={cotizar} target="_blank" rel="noopener noreferrer" className="mt-1 flex min-h-12 items-center justify-center gap-2 rounded-md bg-rojo font-semibold text-white">
              <IconoWhatsApp className="size-[18px]"/>Cotizar por WhatsApp
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}
