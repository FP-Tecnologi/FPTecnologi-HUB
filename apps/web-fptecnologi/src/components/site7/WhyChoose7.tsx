import Image from 'next/image';
import { WHY_CHOOSE_US } from '@/lib/content';

export function WhyChoose7() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Por qué elegirnos</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Por qué elegir FPTecnologi</h2>

          <ul className="mt-8 flex flex-col gap-5">
            {WHY_CHOOSE_US.map((item) => (
              <li key={item.title} className="flex gap-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <div>
                  <p className="font-semibold text-ink">{item.title}</p>
                  <p className="mt-0.5 text-sm text-ink/60">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-hidden rounded-[2rem] shadow-xl shadow-black/10">
          <Image
            src="/images/modelo7/equipo.jpg"
            alt="Equipo comercial FPTecnologi en reunión"
            width={900}
            height={506}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
