import Image from 'next/image';
import { Clock, Mail, MapPin, Phone, type LucideIcon } from 'lucide-react';
import { CONTACT_INFO, COTIZADOR_URL, SOCIAL_LINKS, SOLUTIONS } from '@/lib/content';
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from '@/components/site/icons';
import { whatsappHref } from '@/lib/chatActions';

// Solo páginas (no anclas de la home): pedido del usuario.
const NAV = [
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Tienda', href: '/tienda' },
  { label: 'Contacto', href: '/contacto' },
];

const CONTACTO: { icon: LucideIcon; text: string; href?: string }[] = [
  { icon: MapPin, text: CONTACT_INFO.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.address)}` },
  { icon: Phone, text: CONTACT_INFO.phoneVentas, href: `tel:${CONTACT_INFO.phoneVentas.replace(/\s/g, '')}` },
  { icon: Mail, text: CONTACT_INFO.email, href: `mailto:${CONTACT_INFO.email}` },
  { icon: Clock, text: 'Lun a vie, 9:00 a 18:00' },
];

const SOCIAL_ICON = { facebook: FacebookIcon, instagram: InstagramIcon, linkedin: LinkedinIcon, youtube: YoutubeIcon };

const LEGAL_LINKS = ['Política de privacidad', 'Devoluciones', 'Términos y condiciones', 'Libro de reclamaciones'];

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
 * 1) prefooter: frase + CTAs (Cotizar / WhatsApp),
 * 2) columnas: marca + contacto rápido, navegación (solo páginas),
 *    servicios y enlaces útiles, con separadores verticales en desktop,
 * 3) barra legal.
 * Mismo fondo que "Hablemos" (bg-ink); la línea de arriba marca dónde empieza.
 */
export function Footer() {
  const divider = <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />;

  return (
    <footer className="bg-ink text-white/60">
      <div className="mx-auto max-w-7xl px-6">
        {divider}

        {/* Prefooter */}
        <div className="flex flex-col items-start justify-between gap-6 py-10 md:flex-row md:items-center">
          <div>
            <p className="font-display text-xl font-bold text-white sm:text-2xl">¿Tienes un proyecto en mente?</p>
            <p className="mt-1 text-sm">Cotiza sin compromiso o escríbenos y te respondemos hoy mismo.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={COTIZADOR_URL}
              className="inline-flex h-11 items-center rounded-xl bg-white px-5 text-sm font-semibold uppercase tracking-wide text-brand-dark transition-colors hover:bg-brand-primary hover:text-white"
            >
              Cotizar
            </a>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center rounded-xl border border-white/20 px-5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-brand-primary hover:bg-brand-primary"
            >
              WhatsApp
            </a>
          </div>
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
            {/* Datos de contacto: ícono en chip + texto, y redes en fila. */}
            <ul className="mt-6 space-y-3 text-sm">
              {CONTACTO.map(({ icon: Icon, text, href }) => (
                <li key={text}>
                  <a
                    href={href}
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noreferrer' : undefined}
                    className={`group flex items-center gap-3 ${href ? 'transition-colors hover:text-white' : 'pointer-events-none'}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-dark text-white shadow-md shadow-brand-dark/30 transition-colors group-hover:bg-brand-primary">
                      <Icon className="h-4 w-4" strokeWidth={1.8} />
                    </span>
                    <span className="leading-snug">{text}</span>
                  </a>
                </li>
              ))}
            </ul>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-white">Síguenos</p>
            <div className="mt-3 flex items-center gap-2.5">
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
              {SOLUTIONS.slice(0, 5).map((s) => (
                <li key={s.slug}>
                  <a href={`/servicios/${s.slug}`} className="transition-colors hover:text-white">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:border-l lg:border-white/10 lg:pl-8">
            <ColumnTitle>Enlaces útiles</ColumnTitle>
            <ul className="mt-5 space-y-2.5 text-sm">
              {LEGAL_LINKS.map((label) => (
                <li key={label}>{label}</li>
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
