import Image from 'next/image';
import { CONTACT_INFO, TIENDA_CATEGORIES } from '@/lib/content';

/* Sin newsletter (no hay backend de captura de correo) ni íconos de medios
   de pago (el checkout real termina en "Contactar", no hay pasarela de
   tarjetas todavía) -- la referencia tenía ambos, pero mostrarlos sería
   prometer algo que el sitio no hace. Íconos de redes sociales decorativos
   (mismo criterio ya usado en Header3/Header5: no hay redes confirmadas). */
export function Footer11() {
  return (
    <footer className="border-t border-white/10 bg-[#0d0b14] py-14 text-white/50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image src="/logo-fptecnologi.svg" alt="FPTecnologi & System" width={150} height={36} className="h-7 w-auto brightness-0 invert" />
            <p className="mt-4 max-w-xs text-sm">
              Equipamiento TI de alto rendimiento con distribución autorizada de las principales marcas del mercado.
            </p>
            <div className="mt-4 flex items-center gap-2">
              {['X', 'in', 'ig'].map((s) => (
                <span key={s} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-[11px] text-white/50">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/30">Tienda</p>
            <ul className="mt-4 space-y-2 text-sm">
              {TIENDA_CATEGORIES.map((c) => (
                <li key={c.slug}><a href={`/tienda/${c.slug}`} className="transition-colors hover:text-white">{c.title}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/30">Soporte</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#soporte" className="transition-colors hover:text-white">Preguntas frecuentes</a></li>
              <li><a href="#contacto" className="transition-colors hover:text-white">Contacto</a></li>
              <li><a href={`mailto:${CONTACT_INFO.email}`} className="transition-colors hover:text-white">{CONTACT_INFO.email}</a></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/30">Empresa</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#nosotros" className="transition-colors hover:text-white">Sobre nosotros</a></li>
              <li><a href="#marcas" className="transition-colors hover:text-white">Marcas</a></li>
              <li><a href="#contacto" className="transition-colors hover:text-white">Trabajá con nosotros</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FP Tecnologi &amp; System. Todos los derechos reservados.</p>
          <p>{CONTACT_INFO.address}</p>
        </div>
      </div>
    </footer>
  );
}
