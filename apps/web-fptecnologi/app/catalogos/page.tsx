import { PageHero } from '@/components/site/PageHero';
import { CatalogosVisor } from '@/components/site/CatalogosVisor';
import { Footer } from '@/components/home/Footer';

export const metadata = { title: 'Catálogos', description: 'Hojea los catálogos de FPTecnologi como un folleto: videoconferencia y stock.' };

export default function CatalogosPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Catálogos', href: '/catalogos' },
        ]}
        titulo="Nuestros"
        destacado="catálogos"
        descripcion="Hojéalos como un folleto o descárgalos en PDF."
        imagen="/images/modelo9/hero-office.jpg"
      />
      <main>
        <CatalogosVisor />
      </main>
      <Footer />
    </>
  );
}
