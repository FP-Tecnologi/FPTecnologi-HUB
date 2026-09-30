import { PageHero } from '@/components/site/PageHero';
import { BlogListado } from '@/components/site/BlogListado';
import { Contact } from '@/components/home/Contact';
import { Footer } from '@/components/home/Footer';
import { getArticulos } from '@/lib/blog';

export const metadata = { title: 'Blog' };
// Lo que se publica en el dashboard aparece al instante.
export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const articulos = await getArticulos();
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Blog', href: '/blog' },
        ]}
        titulo="Ideas y guías de"
        destacado="tecnología para empresas"
        descripcion="Consejos prácticos sobre equipamiento, seguridad, datos y trabajo híbrido, escritos por nuestro equipo."
        imagen="/images/modelo9/hero-office.jpg"
      />
      <main>
        <BlogListado articulos={articulos} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
