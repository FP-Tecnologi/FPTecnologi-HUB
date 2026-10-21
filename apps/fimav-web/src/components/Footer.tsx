import Link from 'next/link';
import Logo from './Logo';
import { contacto } from '@/lib/contacto';
import { contenido } from '@/lib/contenido';

const legales = [
  { href: '/legal/privacidad', texto: 'Política de privacidad' },
  { href: '/legal/terminos', texto: 'Términos y condiciones' },
  { href: '/legal/devoluciones', texto: 'Devoluciones' },
  { href: '/legal/reclamaciones', texto: 'Libro de reclamaciones' },
  { href: '/legal/preguntas-frecuentes', texto: 'Preguntas frecuentes' },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-carbon pt-24 text-white" style={{ clipPath: 'polygon(0 0, 50% 18%, 100% 0, 100% 100%, 0 100%)' }}>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-10 md:grid-cols-3">
        <div>
          <span className="inline-block rounded-xl bg-white px-3">
            <Logo className="h-14 w-auto object-contain" />
          </span>
          <p className="mt-4 text-sm leading-relaxed">{contenido.frase}</p>
        </div>
        <div className="space-y-2 text-sm">
          <h3 className="font-semibold">Contacto</h3>
          <p>{contacto.direccion}</p>
          <p><a href={contacto.telefonoHref} className="hover:underline">{contacto.telefono}</a></p>
          <p>Ventas: <a href={`mailto:${contacto.ventas}`} className="hover:underline">{contacto.ventas}</a></p>
          <p>Comercial: <a href={`mailto:${contacto.comercial}`} className="hover:underline">{contacto.comercial}</a></p>
        </div>
        <div className="text-sm">
          <h3 className="mb-2 font-semibold">Información legal</h3>
          <ul className="space-y-2">
            {legales.map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:underline">{l.texto}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <p className="border-t border-white/20 py-4 text-center text-sm">© {new Date().getFullYear()} {contacto.razonSocial}</p>
    </footer>
  );
}
