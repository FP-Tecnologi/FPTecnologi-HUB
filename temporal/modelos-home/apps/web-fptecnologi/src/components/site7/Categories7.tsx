import Image from 'next/image';
import { TIENDA_CATEGORIES } from '@/lib/content';

type TiendaCategoria = (typeof TIENDA_CATEGORIES)[number];

// Composición asimétrica (no grilla pareja) desde lg: 1 card grande + 2
// medianas + 1 ancha, vía grid-template-areas. Con exactamente 4 categorías
// reales (TIENDA_CATEGORIES) -- no se inventa una 5ta para rellenar.
// En mobile/tablet, grid parejo de 2 columnas: la misma composición
// achicada no entra bien en una pantalla angosta.
const AREAS = ['a', 'b', 'c', 'd'];

function Tile({ c, style }: { c: TiendaCategoria; style?: React.CSSProperties }) {
  return (
    <a
      href={`/tienda/${c.slug}`}
      style={style}
      className="group relative aspect-square overflow-hidden rounded-[1.75rem] bg-ink/5 lg:aspect-auto"
    >
      <Image
        src={c.image}
        alt={c.title}
        fill
        sizes="(min-width: 1024px) 30vw, 50vw"
        className={`transition-transform duration-500 group-hover:scale-110 ${c.imageFit === 'contain' ? 'object-contain p-6' : 'object-cover'}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent transition-opacity group-hover:from-ink/95" />
      <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
        {c.title}
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary text-white shadow-sm transition-transform group-hover:scale-110">
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
      </span>
    </a>
  );
}

export function Categories7() {
  return (
    <section id="categorias" className="mx-auto max-w-7xl px-6 py-20">
      <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Explora nuestra colección</span>
      <h2 className="mt-2 font-display text-3xl font-bold uppercase text-ink sm:text-4xl">Categorías de producto</h2>

      <div className="mt-10 grid grid-cols-2 gap-4 lg:hidden">
        {TIENDA_CATEGORIES.map((c) => <Tile key={c.slug} c={c} />)}
      </div>

      <div
        className="mt-10 hidden gap-4 lg:grid"
        style={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: '180px 180px',
          gridTemplateAreas: '"a b c" "a d d"',
        }}
      >
        {TIENDA_CATEGORIES.map((c, i) => (
          <Tile key={c.slug} c={c} style={{ gridArea: AREAS[i] }} />
        ))}
      </div>
    </section>
  );
}
