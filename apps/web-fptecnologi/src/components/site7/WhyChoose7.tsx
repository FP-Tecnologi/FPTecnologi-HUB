import Image from 'next/image';
import { WHY_CHOOSE_US } from '@/lib/content';

// Un color de acento distinto por fila (como la referencia), ciclado sobre
// los 4 beneficios reales -- no se inventa un 5to para completar una paleta.
const COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { bg: 'bg-violet-100', text: 'text-violet-600' },
  { bg: 'bg-amber-100', text: 'text-amber-600' },
];

export function WhyChoose7() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">¿Por qué elegirnos?</span>
          <h2 className="mt-2 font-display text-3xl font-bold uppercase text-ink sm:text-4xl">Por qué elegir FPTecnologi</h2>

          <ul className="mt-8 flex flex-col gap-6">
            {WHY_CHOOSE_US.map((item, i) => (
              <li key={item.title} className="flex gap-4">
                <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${COLORS[i % COLORS.length].bg} ${COLORS[i % COLORS.length].text}`}>
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <div>
                  <p className="font-semibold uppercase text-ink">{item.title}</p>
                  <p className="mt-0.5 text-sm text-ink/60">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-brand-teal-light/25 blur-2xl" aria-hidden />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-brand-primary/15 blur-2xl" aria-hidden />
          <div className="relative overflow-hidden rounded-[2rem] shadow-xl shadow-black/10">
            <Image
              src="/images/modelo7/equipo.jpg"
              alt="Equipo comercial FPTecnologi en reunión"
              width={900}
              height={506}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
