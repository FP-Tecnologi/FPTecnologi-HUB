import { notFound } from 'next/navigation';
import { LEGAL_DOCS } from '@/lib/legal';
import { PageHero } from '@/components/site/PageHero';
import { LegalLayout } from '@/components/site/LegalLayout';
import { Footer } from '@/components/home/Footer';

export function generateStaticParams() {
  return LEGAL_DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = LEGAL_DOCS.find((x) => x.slug === slug);
  return { title: d ? `${d.titulo} ${d.destacado}` : 'Legal' };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = LEGAL_DOCS.find((x) => x.slug === slug);
  if (!d) notFound();
  const nombre = `${d.titulo} ${d.destacado}`;
  const href = `/legal/${d.slug}`;

  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Legales', href: '/legal/privacidad' },
          { label: nombre.charAt(0).toUpperCase() + nombre.slice(1), href },
        ]}
        badge="Legales"
        titulo={d.titulo}
        destacado={d.destacado}
        descripcion={d.resumen}
        imagen="/images/modelo9/hero-office.jpg"
      />
      <main>
        <LegalLayout actual={href} indice={d.secciones} actualizado={d.actualizado}>
          <div className="space-y-10">
            {d.secciones.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className="flex items-baseline gap-3 font-display text-xl font-bold text-ink sm:text-2xl">
                  <span className="title-shimmer-light text-base">{String(i + 1).padStart(2, '0')}</span>
                  {s.titulo}
                </h2>
                <div className="mt-3 space-y-3 border-l-2 border-brand-primary/15 pl-5 text-[15px] leading-relaxed text-ink/70">
                  {s.parrafos.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </LegalLayout>
      </main>
      <Footer />
    </>
  );
}
