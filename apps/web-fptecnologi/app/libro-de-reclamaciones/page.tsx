import { PageHero } from '@/components/site/PageHero';
import { LegalLayout } from '@/components/site/LegalLayout';
import { LibroReclamacionesForm } from '@/components/site/LibroReclamacionesForm';
import { Footer } from '@/components/home/Footer';

export const metadata = { title: 'Libro de reclamaciones' };

export default function LibroReclamacionesPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Legales', href: '/legal/privacidad' },
          { label: 'Libro de reclamaciones', href: '/libro-de-reclamaciones' },
        ]}
        badge="Legales"
        titulo="Libro de"
        destacado="reclamaciones"
        descripcion="Conforme al Código de Protección y Defensa del Consumidor, puedes registrar aquí tu reclamo o queja."
        imagen="/images/modelo9/hero-office.jpg"
      />
      <main>
        <LegalLayout actual="/libro-de-reclamaciones">
          <LibroReclamacionesForm />
        </LegalLayout>
      </main>
      <Footer />
    </>
  );
}
