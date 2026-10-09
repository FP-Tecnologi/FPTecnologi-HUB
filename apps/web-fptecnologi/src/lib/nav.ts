import { SOLUTIONS, TIENDA_CATEGORIES } from './content';

// Cada item va a su página (antes eran anclas de la home: desde otra página
// no llevaban a ningún lado).

type Item = { title: string; slug: string };
const CATEGORIAS_RESPALDO: readonly Item[] = TIENDA_CATEGORIES;

/** `categorias`: las de la base de datos (menú Tienda); sin ellas, las de respaldo de content.ts. */
export function buildNavLinks(servicios: readonly Item[], categorias: readonly Item[] = CATEGORIAS_RESPALDO) {
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
    children: categorias.map((c) => ({ label: c.title, href: `/tienda/${c.slug}` })),
    viewAllHref: '/tienda',
    viewAllLabel: 'Ver catálogo completo',
  },
  { label: 'Catálogos', href: '/catalogos' },
  { label: 'Blog', href: '/blog' },
  {
    label: 'Contacto',
    href: '/contacto',
  },
] as const;
}

/** Menú con los servicios fijos de respaldo; la web usa `useNavLinks()` (servicios de la base de datos). */
export const NAV_LINKS = buildNavLinks(SOLUTIONS);
export type NavLinks = ReturnType<typeof buildNavLinks>;
