import Link from 'next/link';
import { Facebook, Instagram, Landmark, Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';
import LibroBadge from './LibroBadge';
import CorteHex from './hex/CorteHex';
import { rutaHexagono } from './hex/rutaHexagono';
import CtaCotizar from './home/CtaCotizar';
import { contacto, redes } from '@/lib/contacto';
import { contenido } from '@/lib/contenido';

const legales = [
  { href: '/legal/privacidad', texto: 'Política de privacidad' },
  { href: '/legal/terminos', texto: 'Términos y condiciones' },
  { href: '/legal/devoluciones', texto: 'Devoluciones' },
  { href: '/legal/preguntas-frecuentes', texto: 'Preguntas frecuentes' },
];

const SOCIALES = [
  { clave: 'facebook', Icono: Facebook, nombre: 'Facebook' },
  { clave: 'instagram', Icono: Instagram, nombre: 'Instagram' },
] as const;
const HEX_SOC = rutaHexagono({ orientacion: 'punta-arriba', radio: 0.12 });
const hexSocial = 'group/s relative grid h-12 w-11 place-items-center text-white';
const marco = (
  <svg viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 size-full fill-transparent stroke-white/70 transition-colors group-hover/s:fill-white group-hover/s:stroke-white">
    <path d={HEX_SOC} strokeWidth="2" vectorEffect="non-scaling-stroke" />
  </svg>
);

const enlace = 'flex min-h-11 items-center gap-3 hover:underline focus-visible:outline-white';
const Titulo = ({ children }: { children: string }) => (
  <>
    <h2 className="titulo-menor text-xl tracking-widest text-white">{children}</h2>
    <span aria-hidden="true" className="mb-3 mt-2 block h-0.5 w-8 rounded-full bg-rojo" />
  </>
);

/** Pie y CTA en un solo bloque carbón: un único borde hexagonal arriba, CTA, divisor fino y columnas. */
export default function Footer() {
  return (
    <footer id="pie" className="print:hidden mt-8 text-white">
      <CorteHex lado="arriba" color="var(--color-carbon)" />
      <div className="bg-carbon pt-4">
        <CtaCotizar />
        <div className="mx-auto grid max-w-6xl divide-y divide-white/15 px-4 sm:px-6 md:grid-cols-2 md:divide-y-0 lg:grid-cols-[1.25fr_1.25fr_1fr_1fr] lg:divide-x [&>*]:py-6 lg:[&>*]:px-6 lg:[&>*:first-child]:pl-0 lg:[&>*:last-child]:pr-0">
          <div>
            <Logo src="/brand/fimav-peru-blanco.svg" className="block h-14 w-auto object-contain" />
            <p className="mt-4 text-sm leading-relaxed text-white/90">{contenido.fraseCorta}</p>
            <p className="titulo-menor mt-5 text-sm tracking-widest text-white">Síguenos</p>
            <ul className="mt-2 flex gap-3">
              {SOCIALES.map(({ clave, Icono, nombre }) => (
                <li key={clave}>
                  {redes[clave] ? (
                    <a href={redes[clave]} target="_blank" rel="noopener noreferrer" aria-label={`${nombre} de Fimav Perú (se abre en otra pestaña)`} className={`${hexSocial} transition duration-200 hover:-translate-y-0.5 hover:text-carbon focus-visible:outline-white motion-reduce:transition-none`}>
                      {marco}<Icono aria-hidden="true" size={20} className="relative" />
                    </a>
                  ) : (
                    <span aria-disabled="true" title="Próximamente" className={`${hexSocial} opacity-60`}>
                      {marco}<Icono aria-hidden="true" size={20} className="relative" />
                      <span className="sr-only">{nombre} de Fimav Perú (próximamente)</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-sm">
            <Titulo>Contacto</Titulo>
            <ul>
              <li className="flex items-start gap-3 py-2"><MapPin aria-hidden="true" size={18} className="mt-0.5 shrink-0" /><span>{contacto.direccion}</span></li>
              <li><a href={contacto.telefonoHref} className={enlace}><Phone aria-hidden="true" size={18} className="shrink-0" />{contacto.telefono}</a></li>
              <li><a href={`mailto:${contacto.ventas}`} className={`${enlace} break-all`}><Mail aria-hidden="true" size={18} className="shrink-0" />{contacto.ventas}</a></li>
              <li><a href={`mailto:${contacto.comercial}`} className={`${enlace} break-all`}><Mail aria-hidden="true" size={18} className="shrink-0" />{contacto.comercial}</a></li>
            </ul>
          </div>
          <div className="text-sm md:border-t md:border-white/15 lg:border-t-0">
            <Titulo>Legales</Titulo>
            <nav aria-label="Enlaces legales"><ul>
              {legales.map((l) => (
                <li key={l.href}><Link href={l.href} className={enlace}>{l.texto}</Link></li>
              ))}
            </ul></nav>
          </div>
          <div className="text-sm md:border-t md:border-white/15 lg:border-t-0">
            <Titulo>Acceso</Titulo>
            <LibroBadge />
            <Link href="/peru-compras" className={`${enlace} mt-3 font-semibold`}><Landmark aria-hidden="true" size={18} className="shrink-0" />Estamos en Perú Compras</Link>
          </div>
        </div>
        <p className="mt-6 border-t border-white/15 px-4 pb-24 pt-5 text-center text-sm text-white/90 md:pb-5">© {new Date().getFullYear()} {contacto.razonSocial}. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
