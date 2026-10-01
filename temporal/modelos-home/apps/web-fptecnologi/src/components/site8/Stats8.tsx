import { STATS } from '@/lib/content';

/**
 * Footer de 3 stats -- misma posición/mecánica que el spec de Vesper.ai,
 * pero los 3 números salen de STATS (content.ts): nada de "4.2M+ workflows"
 * / "180+ operational teams" del spec original.
 */
export function Stats8() {
  return (
    <footer className="flex flex-col items-center justify-center gap-5 px-6 pb-9 pt-2 text-[#d8d8d8] sm:flex-row sm:justify-between sm:gap-6 lg:px-18">
      {STATS.map((s, i) => (
        <div
          key={s.label}
          className="v8-appear v8-appear--stat flex items-center gap-3.5 text-[13.5px] tracking-[-0.015em]"
          style={{ animationDelay: `${1120 + i * 160}ms` }}
        >
          <StatIcon index={i} />
          <span>
            {s.value}
            {s.suffix} {s.label}
          </span>
        </div>
      ))}
    </footer>
  );
}

function StatIcon({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
        <rect x="3.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="#e8e8e8" fillOpacity="0.5" />
        <rect x="13.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="#e8e8e8" fillOpacity="0.85" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
        <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="6.2" fill="#ffffff" />
        <path d="M8.15 12.35 12 16.2l3.85-3.85M12 7.1v7.4" stroke="#111" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <circle cx="8" cy="12" r="6.2" fill="#e8e8e8" fillOpacity="0.85" />
      <circle cx="15" cy="12" r="6.2" fill="#e8e8e8" fillOpacity="0.5" />
    </svg>
  );
}
