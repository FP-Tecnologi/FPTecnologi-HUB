import Link from 'next/link';
import Logo from './Logo';

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
        <nav className="hidden items-center gap-8 md:flex">
          {enlaces.map((e) => (
            <Link key={e.href} href={e.href} className="font-medium text-carbon hover:text-rojo">
              {e.texto}
            </Link>
          ))}
          <Link href="/cotizar" className="rounded-full bg-boton px-5 py-2 font-semibold text-white">
            Cotizar
          </Link>
        </nav>
        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-full border border-gris px-4 py-2 font-medium text-carbon">Menú</summary>
          <div className="absolute right-0 top-full mt-2 flex w-56 flex-col gap-1 rounded-2xl border border-gris bg-white p-3 shadow-lg">
            {enlaces.map((e) => (
              <Link key={e.href} href={e.href} className="rounded-lg px-3 py-2 text-carbon hover:text-rojo">
                {e.texto}
              </Link>
            ))}
            <Link href="/cotizar" className="mt-1 rounded-full bg-boton px-5 py-2 text-center font-semibold text-white">
              Cotizar
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
