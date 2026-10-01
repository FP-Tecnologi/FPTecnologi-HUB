import { ShieldCheck, Sparkles, Handshake, type LucideIcon } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { CotizadorForm } from '@/components/site/CotizadorForm';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { Footer } from '@/components/home/Footer';
import { getCotizadorContenido } from '@/lib/cotizadorContenido';

export const metadata = {
  title: 'Cotizador',
  description: 'Solicita tu cotización de servicios TI y equipamiento tecnológico en 3 pasos simples.',
};

// El contenido lo edita el equipo desde el dashboard (Cotizador → Formulario).
export const dynamic = 'force-dynamic';

const ICONOS: LucideIcon[] = [Sparkles, ShieldCheck, Handshake];

/* Cotizador -- punto de contacto con el cliente: formulario por pasos cuyos
   leads llegan al dashboard (Cotizador → Leads). */
export default async function CotizadorPage({ searchParams }: { searchParams: Promise<{ interes?: string }> }) {
  const [c, { interes }] = await Promise.all([getCotizadorContenido(), searchParams]);

  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Cotizador', href: '/cotizador' },
        ]}
        titulo={c.hero.titulo}
        destacado={c.hero.destacado}
        descripcion={c.hero.descripcion}
      />

      <main className="bg-paper pb-20 pt-10">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[1fr_20rem] lg:items-start">
          <ScrollReveal direction="up">
            <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-xl shadow-brand-dark/10 sm:p-10">
              <CotizadorForm c={c} interesInicial={interes} />
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delayMs={120}>
            <aside className="space-y-4 lg:sticky lg:top-28">
              {c.beneficios.items.map((b, i) => {
                const Icon = ICONOS[i % ICONOS.length];
                return (
                  <div key={i} className="flex gap-4 rounded-2xl border border-ink/5 bg-white p-5 shadow-lg shadow-brand-dark/5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-dark text-white">
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-ink">{b.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink/60">{b.text}</p>
                    </div>
                  </div>
                );
              })}
            </aside>
          </ScrollReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
