import { PageHero } from '@/components/site/PageHero';
import { CatalogosVisor } from '@/components/site/CatalogosVisor';
import { Footer } from '@/components/home/Footer';
import { getPagina, urlArchivo } from '@/lib/paginasContenido';
import { metaSeo } from '@/lib/seo';

export const generateMetadata = () => metaSeo('catalogos', { title: 'Catálogos', description: 'Hojea los catálogos de FPTecnologi como un folleto.' });
export const dynamic = 'force-dynamic';

export default async function CatalogosPage() {
  const c = await getPagina('catalogos');
  const catalogos = c.lista.items.filter((x) => x.titulo && x.archivo).map((x) => ({ titulo: x.titulo, src: urlArchivo(x.archivo) }));
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Catálogos', href: '/catalogos' },
        ]}
        titulo={c.hero.titulo}
        destacado={c.hero.destacado}
        descripcion={c.hero.descripcion}
        imagen="/images/modelo9/hero-office.jpg"
      />
      <main>
        <CatalogosVisor catalogos={catalogos} />
      </main>
      <Footer />
    </>
  );
}
