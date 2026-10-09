import { Download } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { LegalLayout } from '@/components/site/LegalLayout';
import { Footer } from '@/components/home/Footer';
import { COMPLIANCE, COMPLIANCE_DOCS } from '@/lib/compliance';

export const metadata = {
  title: 'Compliance',
  description: 'Procesos y cumplimiento de FP Tecnologi & System: normas de conducta, política anticorrupción y compromiso con la ética.',
};

export default function CompliancePage() {
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Compliance', href: '/compliance' },
        ]}
        titulo="Procesos y"
        destacado="cumplimiento"
        descripcion="Nuestro sistema de Compliance Empresarial: ética, transparencia y prevención de riesgos en cada proceso."
        imagen="/images/modelo9/hero-office.jpg"
      />
      <main>
        <LegalLayout actual="/compliance" indice={[...COMPLIANCE.map(({ id, titulo }) => ({ id, titulo })), { id: 'documentos', titulo: 'Documentos para descargar' }]}>
          <div className="space-y-10">
            {COMPLIANCE.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className="flex items-baseline gap-3 font-display text-xl font-bold text-ink sm:text-2xl">
                  <span className="title-shimmer-light text-base">{String(i + 1).padStart(2, '0')}</span>
                  {s.titulo}
                </h2>
                <div className="mt-3 space-y-3 border-l-2 border-brand-primary/15 pl-5 text-[15px] leading-relaxed text-ink/70">
                  {s.parrafos?.map((p) => <p key={p}>{p}</p>)}
                  {s.subsecciones?.map((x) => (
                    <p key={x.titulo}>
                      <strong className="text-ink">{x.titulo}. </strong>
                      {x.texto}
                    </p>
                  ))}
                </div>
              </section>
            ))}
            <section id="documentos" className="scroll-mt-28">
              <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">Documentos para descargar</h2>
              <ul className="mt-3 space-y-2">
                {COMPLIANCE_DOCS.map((d) => (
                  <li key={d.href}>
                    <a href={d.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline">
                      <Download className="h-4 w-4" /> {d.titulo}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </LegalLayout>
      </main>
      <Footer />
    </>
  );
}
