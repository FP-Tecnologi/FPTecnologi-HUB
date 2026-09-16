import { SOLUTIONS, TIENDA_CATEGORIES } from './content';

export const NAV_LINKS = [
  { label: 'Inicio', href: '#inicio' },
  {
    label: 'Servicios',
    href: '#servicios',
    children: SOLUTIONS.map((s) => ({ label: s.title, href: `/servicios/${s.slug}` })),
    viewAllHref: '/servicios',
    viewAllLabel: 'Ver todos los servicios',
  },
  {
    label: 'Tienda',
    href: '#catalogo',
    children: TIENDA_CATEGORIES.map((c) => ({ label: c.title, href: `/tienda/${c.slug}` })),
    viewAllHref: '/tienda',
    viewAllLabel: 'Ver catálogo completo',
  },
  { label: 'Marcas', href: '#marcas' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Contacto', href: '#contacto' },
] as const;
