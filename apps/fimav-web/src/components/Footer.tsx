import Link from 'next/link';
import { Landmark, Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';
import LibroBadge from './LibroBadge';
import CorteHex from './hex/CorteHex';
import CtaCotizar from './home/CtaCotizar';
import { contacto } from '@/lib/contacto';
import { contenido } from '@/lib/contenido';

const legales = [
  { href: '/legal/privacidad', texto: 'Política de privacidad' },
  { href: '/legal/terminos', texto: 'Términos y condiciones' },
  { href: '/legal/devoluciones', texto: 'Devoluciones' },
  { href: '/legal/preguntas-frecuentes', texto: 'Preguntas frecuentes' },
];

const enlace = 'flex min-h-11 items-center gap-3 hover:underline focus-visible:outline-white';
const Titulo = ({ children }: { children: string }) => (
  <>
    <h3 className="titulo-menor text-xl tracking-widest text-white">{children}</h3>
    <span aria-hidden="true" className="mb-3 mt-2 block h-0.5 w-8 rounded-full bg-rojo" />
  </>
);

/** Pie y CTA en un solo bloque carbón: un único borde hexagonal arriba, CTA, divisor fino y columnas. */
export default function Footer() {
  return (
    <footer className="print:hidden mt-8 text-white">
      <CorteHex lado="arriba" color="var(--color-carbon)" />
      <div className="bg-carbon pt-4">
        <CtaCotizar />
        <div className="mx-auto grid max-w-6xl divide-y divide-white/15 px-4 sm:px-6 md:grid-cols-2 md:divide-y-0 lg:grid-cols-[1.25fr_1.25fr_1fr_1fr] lg:divide-x [&>*]:py-6 lg:[&>*]:px-6 lg:[&>*:first-child]:pl-0 lg:[&>*:last-child]:pr-0">
          <div>
            <span className="inline-block rounded-xl bg-white p-2">
              <Logo className="block h-14 w-auto object-contain" />
            </span>
            <p className="mt-4 text-sm leading-relaxed text-white/90">{contenido.frase}</p>
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
            <Titulo>Información legal</Titulo>
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
