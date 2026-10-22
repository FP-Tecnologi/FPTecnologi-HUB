import { PageHero } from '@/components/site/PageHero';
import { LegalLayout } from '@/components/site/LegalLayout';
import { LibroReclamacionesForm } from '@/components/site/LibroReclamacionesForm';
import { ConsultaReclamo } from '@/components/site/ConsultaReclamo';
import { Footer } from '@/components/home/Footer';
import { getProveedor } from '@/lib/proveedorLibro';

export const metadata = {
  title: 'Libro de Reclamaciones',
  description: 'Registra un reclamo o una queja conforme a la Ley 29571 y consulta su estado. Respondemos en un máximo de 15 días hábiles.',
};

export default async function LibroReclamacionesPage() {
  const p = await getProveedor();
  const fiscal = [p.razonSocial, p.ruc && `RUC ${p.ruc}`].filter(Boolean).join(' — ');
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Legales', href: '/legal/privacidad' },
          { label: 'Libro de Reclamaciones', href: '/libro-de-reclamaciones' },
        ]}
        badge="Legales"
        titulo="Libro de"
        destacado="Reclamaciones"
        descripcion="Registra un reclamo o una queja conforme a la Ley 29571, Código de Protección y Defensa del Consumidor."
        imagen="/images/modelo9/hero-office.jpg"
      />
      <main>
        <LegalLayout actual="/libro-de-reclamaciones">
          <p className="leading-relaxed text-ink/80">
            Conforme a la Ley 29571, Código de Protección y Defensa del Consumidor, y su reglamento, puedes registrar aquí un reclamo o una queja.
            Responderemos en un plazo máximo de 15 días hábiles. Presentar un reclamo no impide acudir a Indecopi.
          </p>
          <section aria-labelledby="h-prov" className="mt-6 rounded-2xl bg-paper p-5 shadow-lg shadow-brand-dark/10">
            <h2 id="h-prov" className="font-display text-base font-bold text-ink">Datos del proveedor</h2>
            <p className="mt-2 text-sm text-ink/80">{fiscal || p.nombreComercial}</p>
            {fiscal && <p className="text-sm text-ink/80">{p.nombreComercial}</p>}
            <p className="text-sm text-ink/80">{p.direccion}</p>
            <p className="break-all text-sm text-ink/80">{p.email}</p>
          </section>
          <div className="mt-8"><LibroReclamacionesForm proveedor={p} /></div>
          <section aria-labelledby="h-consulta" className="mt-12">
            <h2 id="h-consulta" className="mb-4 font-display text-2xl font-bold text-ink">Consulta el estado de tu hoja</h2>
            <ConsultaReclamo />
          </section>
        </LegalLayout>
      </main>
      <Footer />
    </>
  );
}
