import { SOLUTIONS, TIENDA_CATEGORIES } from './content';

// Cada item va a su página (antes eran anclas de la home: desde otra página
// no llevaban a ningún lado).

export const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Nosotros', href: '/nosotros' },
  {
    label: 'Servicios',
    href: '/servicios',
    children: SOLUTIONS.map((s) => ({ label: s.title, href: `/servicios/${s.slug}` })),
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
  { label: 'Contacto', href: '/contacto' },
] as const;
