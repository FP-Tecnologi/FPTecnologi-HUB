import { AtSign, Mail, Phone } from 'lucide-react';
import { contacto, lineas } from '@/lib/contenido';

export default function Footer() {
  return (
    <footer className="bg-tinta text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <img src="/brand/kelqa-blanco.svg" alt="Kelqa" className="h-10 w-auto" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed">Soluciones confiables para los sectores industrial y construcción, con distribución a nivel nacional.</p>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">Líneas</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {lineas.map((l) => <li key={l.id}><a href={`#${l.id}`} className="inline-block transition duration-300 hover:translate-x-1 hover:text-kelqa-claro">{l.nombre}</a></li>)}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">Contacto</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href={contacto.telefonoHref} className="inline-flex items-center gap-2 transition duration-300 hover:translate-x-1 hover:text-kelqa-claro"><Phone aria-hidden="true" size={16} />{contacto.telefono}</a></li>
            <li><a href={`mailto:${contacto.correo}`} className="inline-flex items-center gap-2 transition duration-300 hover:translate-x-1 hover:text-kelqa-claro"><Mail aria-hidden="true" size={16} />{contacto.correo}</a></li>
            <li className="inline-flex items-center gap-2"><AtSign aria-hidden="true" size={16} />{contacto.redes} en redes</li>
          </ul>
        </div>
      </div>
      <p className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/60">© {new Date().getFullYear()} Kelqa. Todos los derechos reservados. Algunas imágenes son referenciales.</p>
    </footer>
  );
}
