import Image from 'next/image';
import { PERFORMANCE_FEATURES } from '@/lib/content';

const ICONS = [
  <path key="speed" d="M12 3a9 9 0 0 0-9 9M12 12l4-4M20.5 12a8.5 8.5 0 1 1-8.5-8.5" />,
  <path key="compat" d="M4 6h16M4 12h16M4 18h10" />,
  <path key="durable" d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1-8.5 15a12 12 0 0 1-8.5-15A12 12 0 0 0 12 3Z" />,
  <path key="precision" d="M12 3v3m0 12v3m9-9h-3M6 12H3m13.5-6.5-2.1 2.1m-6.8 6.8-2.1 2.1m0-11 2.1 2.1m6.8 6.8 2.1 2.1M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />,
];

export function Performance7() {
  const [left, right] = [PERFORMANCE_FEATURES.slice(0, 2), PERFORMANCE_FEATURES.slice(2, 4)];
  return (
    <section className="overflow-hidden py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Pensado para durar</span>
          <h2 className="mt-2 font-display text-3xl font-bold uppercase text-ink sm:text-4xl">Diseñado para rendir</h2>
        </div>

        <div className="grid items-center gap-0 lg:grid-cols-[1fr_auto_1fr] lg:gap-0">
          <div className="grid gap-4 rounded-[2rem] bg-brand-primary/[0.06] p-5 sm:grid-cols-2 lg:grid-cols-1 lg:rounded-r-none lg:py-10 lg:pl-8 lg:pr-16">
            {left.map((f, i) => (
              <FeatureCard key={f.title} icon={ICONS[i]} title={f.title} text={f.text} />
            ))}
          </div>

          <div className="relative z-10 mx-auto -my-6 h-52 w-52 shrink-0 overflow-hidden rounded-full shadow-2xl shadow-black/20 ring-8 ring-white sm:h-64 sm:w-64 lg:-mx-10 lg:h-72 lg:w-72">
            <Image src="/images/modelo7/rendimiento.jpg" alt="Infraestructura de red FPTecnologi" fill sizes="288px" className="object-cover" />
          </div>

          <div className="grid gap-4 rounded-[2rem] bg-brand-teal-light/10 p-5 sm:grid-cols-2 lg:grid-cols-1 lg:rounded-l-none lg:py-10 lg:pl-16 lg:pr-8">
            {right.map((f, i) => (
              <FeatureCard key={f.title} icon={ICONS[i + 2]} title={f.title} text={f.text} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">{icon}</svg>
      </span>
      <h3 className="mt-3 text-sm font-semibold uppercase text-ink">{title}</h3>
      <p className="mt-1 text-sm text-ink/60">{text}</p>
    </div>
  );
}
