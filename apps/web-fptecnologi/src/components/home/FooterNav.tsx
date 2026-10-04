'use client';

import { usePathname } from 'next/navigation';

const NAV = [
  { label: 'Inicio', href: '/' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Tienda', href: '/tienda' },
  { label: 'Blog', href: '/blog' },
];

const esActual = (pathname: string | null, href: string) => (href === '/' ? pathname === '/' : pathname === href || !!pathname?.startsWith(`${href}/`));

/* Navegación del footer dinámica: no muestra la página donde ya estás, así
   siempre salen las otras cuatro (en Nosotros: Inicio, Servicios, Tienda, Blog). */
export function FooterNav() {
  const pathname = usePathname();
  return (
    <ul className="mt-5 space-y-2.5 text-sm">
      {NAV.filter((l) => !esActual(pathname, l.href)).map((l) => (
        <li key={l.href}>
          <a href={l.href} className="nav-underline inline-block transition-colors hover:text-white">
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
