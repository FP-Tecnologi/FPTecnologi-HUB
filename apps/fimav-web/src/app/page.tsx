import Categorias from '@/components/home/Categorias';
import HeroSlider from '@/components/home/HeroSlider';
import Marcas from '@/components/home/Marcas';
import Nosotros from '@/components/home/Nosotros';
import PeruCompras from '@/components/home/PeruCompras';
import PorQue from '@/components/home/PorQue';
import { getCategorias, getPagina } from '@/lib/cms';

export default async function Home() {
  const [c, categorias] = await Promise.all([getPagina('inicio'), getCategorias()]);
  return (
    <main>
      <HeroSlider slides={c.hero.slides} />
      <Nosotros datos={c.nosotros} /><Categorias titulo={c.categorias} categorias={categorias} /><PeruCompras datos={c.perucompras} /><PorQue datos={c.porque} /><Marcas titulo={c.marcas} />
    </main>
  );
}
