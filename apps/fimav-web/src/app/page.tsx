import CtaCotizar from '@/components/home/CtaCotizar';
import Categorias from '@/components/home/Categorias';
import Hero from '@/components/home/Hero';
import Marcas from '@/components/home/Marcas';
import Nosotros from '@/components/home/Nosotros';
import PeruCompras from '@/components/home/PeruCompras';
import PorQue from '@/components/home/PorQue';

export default function Home() {
  return (
    <main>
      <Hero /><Nosotros /><Categorias /><PeruCompras /><PorQue /><Marcas /><CtaCotizar />
    </main>
  );
}
