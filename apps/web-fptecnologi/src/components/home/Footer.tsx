import Image from 'next/image';
import { getSitio } from '@/lib/sitio';
import { getServicios } from '@/lib/servicios';
import { LEGAL_LINKS } from '@/lib/legal';
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from '@/components/site/icons';
import { NewsletterForm } from './NewsletterForm';

// Solo páginas (no anclas de la home): pedido del usuario.
const NAV = [
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Tienda', href: '/tienda' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contacto', href: '/contacto' },
];


const SOCIAL_ICON = { facebook: FacebookIcon, instagram: InstagramIcon, linkedin: LinkedinIcon, youtube: YoutubeIcon };


function ColumnTitle({ children }: { children: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white">
      {children}
      <span className="mt-2 block h-0.5 w-8 rounded-full bg-brand-primary" />
    </p>
  );
}

/*
 * Footer en 3 franjas separadas por líneas con degradé:
 * 1) prefooter: suscripción al boletín (correo),
 * 2) columnas: marca + contacto rápido, navegación (solo páginas),
 *    servicios y enlaces útiles, con separadores verticales en desktop,
 * 3) barra legal.
 * Mismo fondo que "Hablemos" (bg-ink); la línea de arriba marca dónde empieza.
 */
export async function Footer() {
  const [servicios, { social: SOCIAL_LINKS }] = await Promise.all([getServicios(), getSitio()]);
  const divider = <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />;

  return (
    <footer className="bg-ink text-white/80">
      <div className="mx-auto max-w-7xl px-6">
        {divider}

        {/* Prefooter: suscripción al boletín */}
        <div className="flex flex-col items-start justify-between gap-6 py-10 lg:flex-row lg:items-center">
          <div className="max-w-md">
            <p className="font-display text-xl font-bold text-white sm:text-2xl">Recibe ofertas y novedades</p>
            <p className="mt-1 text-sm">Suscríbete a nuestro boletín y entérate primero de promociones, lanzamientos y consejos de tecnología para tu empresa.</p>
          </div>
          <NewsletterForm />
        </div>

        {divider}

        {/* Columnas */}
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-0">
          <div className="lg:pr-10">
            <Image src="/logo-fptecnologi.svg" alt="FPTecnologi & System" width={168} height={40} className="h-10 w-auto brightness-0 invert" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Equipamiento TI y soluciones tecnológicas para empresas, con distribución autorizada de las principales
              marcas del mercado.
            </p>
            {/* Solo redes sociales (los datos de contacto ya están en la sección Contacto). */}
            <div className="mt-6 flex items-center gap-2.5">
              {SOCIAL_LINKS.map((s) => {
                const Icon = SOCIAL_ICON[s.red];
                return (
                  <a
                    key={s.red}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`FPTecnologi en ${s.label}`}
                    title={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-primary hover:bg-brand-primary hover:text-white hover:shadow-lg hover:shadow-brand-primary/30"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="lg:border-l lg:border-white/10 lg:px-8">
            <ColumnTitle>Navegación</ColumnTitle>
            <ul className="mt-5 space-y-2.5 text-sm">
              {NAV.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="transition-colors hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:border-l lg:border-white/10 lg:px-8">
            <ColumnTitle>Servicios</ColumnTitle>
            <ul className="mt-5 space-y-2.5 text-sm">
              {servicios.slice(0, 5).map((s) => (
                <li key={s.slug}>
                  <a href={`/servicios/${s.slug}`} className="transition-colors hover:text-white">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:border-l lg:border-white/10 lg:pl-8">
            <ColumnTitle>Legales</ColumnTitle>
            <ul className="mt-5 space-y-2.5 text-sm">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="transition-colors hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {divider}

        {/* Barra legal */}
        <div className="flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FP Tecnologi &amp; System. Todos los derechos reservados.</p>
          <p>Distribuidor autorizado de equipamiento TI · Lima, Perú</p>
        </div>
      </div>
    </footer>
  );
}
