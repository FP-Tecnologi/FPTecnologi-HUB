import Categorias from '@/components/home/Categorias';
import DatosConfianza from '@/components/home/DatosConfianza';
import HeroSlider from '@/components/home/HeroSlider';
import Marcas from '@/components/home/Marcas';
import Nosotros from '@/components/home/Nosotros';
import PeruCompras from '@/components/home/PeruCompras';
import PorQue from '@/components/home/PorQue';

export default function Home() {
  return (
    <main>
      <HeroSlider />
      <DatosConfianza />
      <Nosotros /><Categorias /><PeruCompras /><PorQue /><Marcas />
    </main>
  );
}
