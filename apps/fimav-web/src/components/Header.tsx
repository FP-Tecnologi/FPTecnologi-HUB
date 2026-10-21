import Link from 'next/link';
import Logo from './Logo';
import MenuMovil from './MenuMovil';

const enlaces = [
  { href: '/', texto: 'Inicio' },
  { href: '/catalogo', texto: 'Catálogo' },
  { href: '/nosotros', texto: 'Nosotros' },
  { href: '/contacto', texto: 'Contacto' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gris bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label="Fimav Perú, inicio">
          <Logo className="h-14 w-auto object-contain" />
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {enlaces.map((e) => (
            <Link key={e.href} href={e.href} className="font-medium text-carbon hover:text-rojo">
              {e.texto}
            </Link>
          ))}
          <Link href="/cotizar" className="rounded-full bg-boton px-5 py-2 font-semibold text-white">
            Cotizar
          </Link>
        </nav>
        <MenuMovil enlaces={enlaces} />
      </div>
    </header>
  );
}
