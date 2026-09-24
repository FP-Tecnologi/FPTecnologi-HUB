import Image from 'next/image';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { CONTACT_INFO, COTIZADOR_URL, SOLUTIONS } from '@/lib/content';
import { whatsappHref } from '@/lib/chatActions';

// Solo páginas (no anclas de la home): pedido del usuario.
const NAV = [
  { label: 'Servicios', href: '/servicios' },
  { label: 'Tienda', href: '/tienda' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Contacto', href: '/contacto' },
];

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
            <ul className="mt-5 space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal-light" strokeWidth={1.8} />
                {CONTACT_INFO.address}
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-brand-teal-light" strokeWidth={1.8} />
                <a href={`tel:${CONTACT_INFO.phoneVentas.replace(/\s/g, '')}`} className="hover:text-white">
                  {CONTACT_INFO.phoneVentas}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-brand-teal-light" strokeWidth={1.8} />
                <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-white">
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-brand-teal-light" strokeWidth={1.8} />
                Lun a vie, 9:00 a 18:00
              </li>
            </ul>
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
