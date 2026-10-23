'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export const enlaces = [
  { href: '/', texto: 'Inicio' },
  { href: '/catalogo', texto: 'Catálogo' },
  { href: '/nosotros', texto: 'Nosotros' },
  { href: '/peru-compras', texto: 'Perú Compras' },
  { href: '/contacto', texto: 'Contacto' },
];

export const esActivo = (ruta: string, href: string) => (href === '/' ? ruta === '/' : ruta === href || ruta.startsWith(`${href}/`));

/** Enlaces de la barra de escritorio con el activo marcado (aria-current="page") y subrayado animado. También marca el scroll en <html data-scrolled>. */
export default function EnlacesNav() {
  const ruta = usePathname();
  useEffect(() => {
    const h = document.documentElement;
    const f = () => h.toggleAttribute('data-scrolled', window.scrollY > 40);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, [ruta]);
  return (
    <>
      {enlaces.map((e) => {
        const activo = esActivo(ruta, e.href);
        return (
          <Link
            key={e.href}
            href={e.href}
            aria-current={activo ? 'page' : undefined}
            className={`cabecera-link relative flex min-h-11 items-center font-display text-lg font-bold uppercase tracking-widest after:absolute after:inset-x-0 after:bottom-1.5 after:h-0.5 after:origin-left after:rounded-full after:bg-rojo after:transition-transform after:duration-300 hover:text-rojo-hondo hover:after:scale-x-100 focus-visible:after:scale-x-100 ${activo ? 'text-rojo-hondo after:scale-x-100' : 'text-carbon after:scale-x-0'}`}
          >
            {e.texto}
          </Link>
        );
      })}
    </>
  );
}
