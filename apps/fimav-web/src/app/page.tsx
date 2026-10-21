import CtaCotizar from '@/components/home/CtaCotizar';
import Categorias from '@/components/home/Categorias';
import Hero from '@/components/home/Hero';
import LibroBadge from '@/components/LibroBadge';
import Marcas from '@/components/home/Marcas';
import Nosotros from '@/components/home/Nosotros';
import PeruCompras from '@/components/home/PeruCompras';
import PorQue from '@/components/home/PorQue';

export default function Home() {
  return (
    <main>
      <Hero />
      <div className="bg-gris py-3"><div className="mx-auto flex max-w-6xl justify-center px-4 sm:justify-end sm:px-6"><LibroBadge /></div></div>
      <Nosotros /><Categorias /><PeruCompras /><PorQue /><Marcas /><CtaCotizar />
    </main>
  );
}
