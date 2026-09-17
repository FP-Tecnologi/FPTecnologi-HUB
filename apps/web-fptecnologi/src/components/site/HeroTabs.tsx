import { HERO_SLIDES } from '@/lib/content';

type Tone = 'light' | 'dark';

const TONE = {
  light: {
    wrap: 'bg-ink/5 ring-1 ring-black/10',
    active: 'bg-ink text-white',
    idle: 'text-ink/60 hover:text-ink',
  },
  dark: {
    wrap: 'bg-white/10 ring-1 ring-white/15',
    active: 'bg-white text-brand-dark',
    idle: 'text-white/70 hover:text-white',
  },
} as const;

export function HeroTabs({ active, onChange, tone = 'dark' }: { active: number; onChange: (i: number) => void; tone?: Tone }) {
  const t = TONE[tone];
  return (
    <div role="tablist" aria-label="Elegí qué buscás" className={`flex w-fit gap-1 rounded-full p-1 ${t.wrap}`}>
      {HERO_SLIDES.map((s, i) => (
        <button
          key={s.key}
          type="button"
          role="tab"
          aria-selected={i === active}
          onClick={() => onChange(i)}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${i === active ? t.active : t.idle}`}
        >
          {s.tabLabel}
        </button>
      ))}
    </div>
  );
}
