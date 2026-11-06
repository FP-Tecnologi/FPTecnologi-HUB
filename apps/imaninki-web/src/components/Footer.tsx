import Link from 'next/link';
import { AtSign, BookOpen, Headset, Mail, Phone } from 'lucide-react';
import { contacto, lineas } from '@/lib/contenido';

const enlace = 'inline-flex items-center gap-2 transition duration-300 hover:translate-x-1 hover:text-rojo-claro';
const Titulo = ({ children }: { children: string }) => <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">{children}</h2>;

export default function Footer() {
  return (
    <footer id="pie" className="bg-tinta text-white/80">
      <div aria-hidden="true" className="filete" />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <img loading="lazy" decoding="async" src="/brand/imaninki.svg" alt="Imaninki" className="h-10 w-auto" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed">Soluciones confiables para los sectores industrial, construcción, vial y ayuda humanitaria, con distribución a nivel nacional.</p>
        </div>
        <div>
          <Titulo>Empresa</Titulo>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/" className={enlace}>Inicio</Link></li>
            <li><Link href="/nosotros" className={enlace}>Nosotros</Link></li>
            <li><Link href="/contacto" className={enlace}>Contacto</Link></li>
            <li><Link href="/libro-de-reclamaciones" className={enlace}><BookOpen aria-hidden="true" size={16} />Libro de Reclamaciones</Link></li>
            <li><Link href="/tickets" className={enlace}><Headset aria-hidden="true" size={16} />Soporte (tickets)</Link></li>
          </ul>
        </div>
        <div>
          <Titulo>Líneas</Titulo>
          <ul className="mt-4 space-y-2 text-sm">
            {lineas.map((l) => <li key={l.id}><Link href={`/lineas/${l.id}`} className={enlace}>{l.nombre}</Link></li>)}
          </ul>
        </div>
        <div>
          <Titulo>Contacto</Titulo>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href={contacto.telefonoHref} className={enlace}><Phone aria-hidden="true" size={16} />{contacto.telefono}</a></li>
            <li><a href={`mailto:${contacto.correo}`} className={enlace}><Mail aria-hidden="true" size={16} />{contacto.correo}</a></li>
            <li className="inline-flex items-center gap-2"><AtSign aria-hidden="true" size={16} />{contacto.redes} en redes</li>
          </ul>
        </div>
      </div>
      <p className="border-t border-white/10 px-5 pb-24 pt-5 text-center text-xs text-white/75 md:pb-5">© {new Date().getFullYear()} Imaninki, marca de CORPORACION JAE SOLUTIONS E.I.R.L. · RUC 20606010886. Todos los derechos reservados. Algunas imágenes son referenciales.</p>
    </footer>
  );
}
