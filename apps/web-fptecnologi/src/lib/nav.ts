import { SOLUTIONS, TIENDA_CATEGORIES } from './content';

// Cada item va a su página (antes eran anclas de la home: desde otra página
// no llevaban a ningún lado).

export function buildNavLinks(servicios: readonly { title: string; slug: string }[]) {
  return [
  { label: 'Inicio', href: '/' },
  {
    label: 'Nosotros',
    href: '/nosotros',
  },
  {
    label: 'Servicios',
    href: '/servicios',
    children: servicios.map((s) => ({ label: s.title, href: `/servicios/${s.slug}` })),
    viewAllHref: '/servicios',
    viewAllLabel: 'Ver todos los servicios',
  },
  {
    label: 'Tienda',
    href: '/tienda',
    children: TIENDA_CATEGORIES.map((c) => ({ label: c.title, href: `/tienda/${c.slug}` })),
    viewAllHref: '/tienda',
    viewAllLabel: 'Ver catálogo completo',
  },
  { label: 'Blog', href: '/blog' },
  {
    label: 'Contacto',
    href: '/contacto',
    children: [
      { label: 'Contáctanos', href: '/contacto' },
      { label: 'Cotizador', href: '/cotizador' },
    ],
  },
] as const;
}

/** Menú con los servicios fijos de respaldo; la web usa `useNavLinks()` (servicios de la base de datos). */
export const NAV_LINKS = buildNavLinks(SOLUTIONS);
export type NavLinks = ReturnType<typeof buildNavLinks>;
