import { STATS } from '@/lib/content';
import { Counter } from './Counter';

export function StatsBar() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 pt-16">
      <div className="grid grid-cols-1 divide-y divide-black/5 rounded-2xl border border-black/5 bg-white shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1 px-6 py-8 text-center">
            <p className="font-display text-4xl font-bold text-brand-primary">
              <Counter end={stat.value} suffix={stat.suffix} />
            </p>
            <p className="text-sm text-ink/60">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
