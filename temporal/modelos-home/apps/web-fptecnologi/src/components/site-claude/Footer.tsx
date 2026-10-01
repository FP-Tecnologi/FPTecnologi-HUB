import Image from 'next/image';
import { NAV_LINKS } from '@/lib/nav';

const LEGAL_LINKS = ['Política de privacidad', 'Devoluciones', 'Términos y condiciones', 'Libro de reclamaciones'];

export function Footer() {
  return (
    <footer className="bg-ink py-14 text-white/60">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <Image src="/logo-fptecnologi-icon.svg" alt="" width={40} height={40} className="h-9 w-9" />
            <p className="mt-4 max-w-xs text-sm">
              Equipamiento TI y soluciones tecnológicas para empresas, con distribución autorizada de las
              principales marcas del mercado.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Navegación</p>
            <ul className="mt-4 space-y-2 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Enlaces útiles</p>
            <ul className="mt-4 space-y-2 text-sm">
              {LEGAL_LINKS.map((label) => (
                <li key={label}>
                  <span className="transition-colors hover:text-white">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FP Tecnologi &amp; System. Todos los derechos reservados.</p>
          <p>Jr. Huaraz 1841, Breña — Lima, Perú</p>
        </div>
      </div>
    </footer>
  );
}
