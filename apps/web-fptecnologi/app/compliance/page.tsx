import { Download } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { LegalLayout } from '@/components/site/LegalLayout';
import { Footer } from '@/components/home/Footer';
import { seccionesDeMarkdown } from '@/lib/legal';
import { getPagina, urlArchivo } from '@/lib/paginasContenido';
import { metaSeo } from '@/lib/seo';

export const generateMetadata = () =>
  metaSeo('compliance', { title: 'Compliance', description: 'Procesos y cumplimiento de FP Tecnologi & System: normas de conducta, política anticorrupción y compromiso con la ética.' });
export const dynamic = 'force-dynamic';

/** `**texto**` → negrita (para resaltar el inicio de un párrafo). */
const conNegrita = (p: string) => p.split(/\*\*(.+?)\*\*/g).map((t, i) => (i % 2 ? <strong key={i} className="text-ink">{t}</strong> : t));

export default async function CompliancePage() {
  const c = await getPagina('compliance');
  const secciones = seccionesDeMarkdown(c.contenido.texto);
  const docs = c.documentos.items.filter((d) => d.titulo && d.archivo);
  const indice = [...secciones.map(({ id, titulo }) => ({ id, titulo })), ...(docs.length ? [{ id: 'documentos', titulo: 'Documentos para descargar' }] : [])];
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Compliance', href: '/compliance' },
        ]}
        titulo={c.hero.titulo}
        destacado={c.hero.destacado}
        descripcion={c.hero.descripcion}
        imagen="/images/modelo9/hero-office.jpg"
      />
      <main>
        <LegalLayout actual="/compliance" indice={indice}>
          <div className="space-y-10">
            {secciones.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className="flex items-baseline gap-3 font-display text-xl font-bold text-ink sm:text-2xl">
                  <span className="title-shimmer-light text-base">{String(i + 1).padStart(2, '0')}</span>
                  {s.titulo}
                </h2>
                <div className="mt-3 space-y-3 border-l-2 border-brand-primary/15 pl-5 text-[15px] leading-relaxed text-ink/70">
                  {s.parrafos.map((p) => <p key={p}>{conNegrita(p)}</p>)}
                </div>
              </section>
            ))}
            {docs.length > 0 && (
              <section id="documentos" className="scroll-mt-28">
                <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">Documentos para descargar</h2>
                <ul className="mt-3 space-y-2">
                  {docs.map((d) => (
                    <li key={d.archivo}>
                      <a href={urlArchivo(d.archivo)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline">
                        <Download className="h-4 w-4" /> {d.titulo}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </LegalLayout>
      </main>
      <Footer />
    </>
  );
}
