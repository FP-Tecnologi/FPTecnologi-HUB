import Image from 'next/image';
import { CONTACT_INFO, TIENDA_CATEGORIES } from '@/lib/content';

export function FooterRiteflow() {
  return (
    <footer className="bg-[#0e1422] py-14 text-[#fbfbfb]/50">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12 xl:px-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image src="/logo-fptecnologi.svg" alt="FPTecnologi & System" width={150} height={36} className="h-7 w-auto brightness-0 invert" />
            <p className="mt-4 max-w-xs text-sm">
              Equipamiento TI y soluciones tecnológicas para empresas, con distribución autorizada de las
              principales marcas del mercado.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#fbfbfb]/30">Tienda</p>
            <ul className="mt-4 space-y-2 text-sm">
              {TIENDA_CATEGORIES.map((c) => (
                <li key={c.slug}><a href={`/tienda/${c.slug}`} className="transition-colors hover:text-white">{c.title}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#fbfbfb]/30">Empresa</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#nosotros" className="transition-colors hover:text-white">Sobre nosotros</a></li>
              <li><a href="#marcas" className="transition-colors hover:text-white">Marcas</a></li>
              <li><a href="#contacto" className="transition-colors hover:text-white">Contacto</a></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#fbfbfb]/30">Contacto</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href={`mailto:${CONTACT_INFO.email}`} className="transition-colors hover:text-white">{CONTACT_INFO.email}</a></li>
              <li>{CONTACT_INFO.phoneVentas}</li>
              <li>{CONTACT_INFO.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[#2d3a57] pt-6 text-center text-xs">
          © {new Date().getFullYear()} FP Tecnologi &amp; System. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
