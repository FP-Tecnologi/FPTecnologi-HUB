import { CalendarDays, CheckCircle2, MapPin, Plus } from 'lucide-react';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { SectionBadge } from '@/components/home/SectionBadge';
import { FormularioLanding } from './FormularioLanding';
import { imagenLanding, type LandingPublica } from '@/lib/landings';

const FONDO = {
  azul: { hero: 'bg-gradient-to-br from-brand-primary via-brand-primary to-brand-dark text-white', desc: 'text-white/80', badge: 'border-white/25 bg-white/10 text-white', chip: 'bg-white/10 text-white border-white/20', shimmer: 'title-shimmer-dark', cta: 'bg-white text-brand-dark hover:bg-brand-primary hover:text-white' },
  oscuro: { hero: 'bg-brand-700 text-white', desc: 'text-white/70', badge: 'border-white/20 bg-white/10 text-white', chip: 'bg-white/10 text-white border-white/20', shimmer: 'title-shimmer-dark', cta: 'bg-brand-primary text-white hover:bg-brand-primary' },
  claro: { hero: 'bg-white text-ink', desc: 'text-ink/65', badge: 'border-brand-primary/20 bg-brand-primary/10 text-brand-700', chip: 'bg-paper text-ink border-ink/10', shimmer: 'title-shimmer-light', cta: 'bg-brand-primary text-white hover:bg-brand-primary' },
} as const;

/*
 * Landing pública: se arma con el contenido y el formulario que el equipo editó en el dashboard
 * (Campañas → Landing pages). Tres plantillas: evento (registro al costado, como EXPOMINA), oferta
 * (imagen + beneficios + formulario) y captación (una sola pantalla). Colores/tipografía de la marca.
 */
export function LandingView({ landing, vistaPrevia = false }: { landing: LandingPublica; vistaPrevia?: boolean }) {
  const c = landing.contenido;
  const t = FONDO[c.tema] ?? FONDO.azul;
  const form = (
    <div id="registro" className="scroll-mt-24 rounded-3xl border border-ink/5 bg-white p-6 text-ink shadow-2xl shadow-brand-dark/25 sm:p-8">
      <h2 className="font-display text-xl font-bold">{c.formTitulo}</h2>
      {c.formSubtitulo && <p className="mb-5 mt-1 text-sm text-ink/65">{c.formSubtitulo}</p>}
      <FormularioLanding slug={landing.slug} formulario={landing.formulario} contenido={c} vistaPrevia={vistaPrevia} />
    </div>
  );

  const titulo = (
    <h1 className="font-display text-[clamp(2rem,4.6vw,3.4rem)] font-bold leading-[1.08] tracking-tight">
      <span className="block">{c.titulo}</span>
      {c.destacado && <span className={`block ${t.shimmer}`}>{c.destacado}</span>}
    </h1>
  );

  const chips = (c.fecha || c.lugar) && (
    <div className="mt-6 flex flex-wrap gap-3">
      {c.fecha && <span className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${t.chip}`}><CalendarDays className="h-4 w-4" strokeWidth={2} />{c.fecha}</span>}
      {c.lugar && <span className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${t.chip}`}><MapPin className="h-4 w-4" strokeWidth={2} />{c.lugar}</span>}
    </div>
  );

  const insignia = c.badge && (
    <span className={`mb-5 inline-flex w-fit items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wide backdrop-blur-md ${t.badge}`}>{c.badge}</span>
  );

  const beneficios = c.beneficios.length > 0 && (
    <section className="bg-paper py-20">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal direction="up" className="mb-10 flex flex-col items-center text-center">
          <SectionBadge>{c.beneficiosTitulo}</SectionBadge>
        </ScrollReveal>
        <div className={`grid gap-6 ${c.beneficios.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {c.beneficios.map((b, i) => (
            <ScrollReveal key={i} direction="up" delayMs={i * 100} className="h-full">
              <div className="group hover-lift relative h-full rounded-2xl bg-white p-7 shadow-lg shadow-brand-dark/10 hover:shadow-2xl hover:shadow-brand-dark/25">
                <span className="icon-pop flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-dark/30"><CheckCircle2 className="h-6 w-6" strokeWidth={1.8} /></span>
                <h3 className="mt-4 font-display text-xl font-bold text-ink">{b.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{b.texto}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );

  const agenda = c.agenda.length > 0 && (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-3xl px-6">
        <ScrollReveal direction="up" className="mb-10 flex flex-col items-center text-center"><SectionBadge>{c.agendaTitulo}</SectionBadge></ScrollReveal>
        <ol className="space-y-5">
          {c.agenda.map((a, i) => (
            <ScrollReveal key={i} direction={i % 2 ? 'right' : 'left'}>
              <li className="hover-slide flex gap-5 rounded-2xl border border-ink/5 bg-paper p-5">
                <span className="w-24 shrink-0 font-display text-lg font-bold text-brand-primary">{a.hora}</span>
                <span><span className="block font-bold text-ink">{a.titulo}</span>{a.texto && <span className="block text-sm text-ink/60">{a.texto}</span>}</span>
              </li>
            </ScrollReveal>
          ))}
        </ol>
      </div>
    </section>
  );

  const faqs = c.faqs.length > 0 && (
    <section className="bg-paper py-20">
      <div className="mx-auto max-w-3xl px-6">
        <ScrollReveal direction="up" className="mb-8 flex flex-col items-center text-center"><SectionBadge>Preguntas frecuentes</SectionBadge></ScrollReveal>
        <div className="space-y-3">
          {c.faqs.map((f) => (
            <details key={f.p} className="group rounded-2xl bg-white p-5 shadow-md shadow-brand-dark/10 open:shadow-lg">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                {f.p}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-700 transition-transform duration-300 group-open:rotate-45"><Plus className="h-4 w-4" strokeWidth={2.2} /></span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">{f.r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-paper">
      {vistaPrevia && <div className="sticky top-0 z-50 bg-amber-400 px-4 py-2 text-center text-sm font-semibold text-ink">Vista previa de borrador — nadie más puede verla todavía.</div>}

      <header className={`${t.hero} relative`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-6">
          <a href="https://fptecnologi.com" className="flex items-center gap-3" aria-label="FPTecnologi & System">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.logoUrl ? imagenLanding(c.logoUrl) : '/logo-fptecnologi.svg'} alt="FPTecnologi & System" className="h-10 w-auto" style={c.tema === 'claro' || c.logoUrl ? undefined : { filter: 'brightness(0) invert(1)' }} />
          </a>
        </div>

        {landing.plantilla === 'oferta' ? (
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-20 pt-12 lg:grid-cols-2">
            <ScrollReveal direction="left">
              {insignia}{titulo}
              <p className={`mt-5 max-w-xl text-lg leading-relaxed ${t.desc}`}>{c.descripcion}</p>
              <a href="#registro" className={`hover-lift mt-8 inline-flex h-12 items-center rounded-xl px-7 text-sm font-semibold uppercase tracking-wide transition-colors ${t.cta}`}>{c.ctaTexto}</a>
            </ScrollReveal>
            <ScrollReveal direction="right" delayMs={120}>
              {c.imagenUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagenLanding(c.imagenUrl)} alt={c.titulo} className="mx-auto aspect-[4/3] w-full rounded-3xl object-cover shadow-2xl shadow-black/30" />
              ) : (
                <div className="aspect-[4/3] w-full rounded-3xl bg-white/10 backdrop-blur-md" />
              )}
            </ScrollReveal>
          </div>
        ) : landing.plantilla === 'captacion' ? (
          <div className="mx-auto max-w-2xl px-6 pb-20 pt-12 text-center">
            <ScrollReveal direction="up">
              <div className="flex flex-col items-center">{insignia}{titulo}</div>
              <p className={`mx-auto mt-5 max-w-xl text-lg leading-relaxed ${t.desc}`}>{c.descripcion}</p>
            </ScrollReveal>
            <ScrollReveal direction="up" delayMs={150}><div className="mt-10 text-left">{form}</div></ScrollReveal>
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-20 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <ScrollReveal direction="left">
              {insignia}{titulo}
              <p className={`mt-5 max-w-xl text-lg leading-relaxed ${t.desc}`}>{c.descripcion}</p>
              {chips}
              {c.imagenUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagenLanding(c.imagenUrl)} alt="" className="mt-8 hidden aspect-[16/9] w-full max-w-xl rounded-2xl object-cover shadow-2xl shadow-black/30 lg:block" />
              )}
            </ScrollReveal>
            <ScrollReveal direction="right" delayMs={120}>{form}</ScrollReveal>
          </div>
        )}
      </header>

      {beneficios}
      {agenda}
      {faqs}

      {landing.plantilla === 'oferta' && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-xl px-6"><ScrollReveal direction="up">{form}</ScrollReveal></div>
        </section>
      )}

      <footer className="bg-brand-700 px-6 py-8 text-center text-sm text-white/80">
        © {new Date().getFullYear()} FPTecnologi &amp; System · <a href="/legal/privacidad" className="underline hover:text-white">Privacidad</a> · <a href="https://fptecnologi.com" className="underline hover:text-white">fptecnologi.com</a>
      </footer>
    </div>
  );
}
