'use client';

import { useEffect, useMemo, useState } from 'react';
import { Home, Search, SlidersHorizontal, X } from 'lucide-react';
import { discountOf, type CatalogProduct } from '@/lib/catalog';
import type { Categoria } from '@/lib/catalogo';
import { useCurrency } from '@/context/CurrencyContext';
import { ProductCardFinal } from '@/components/home/ProductCardFinal';
import { CompareDock, useCompare } from '@/components/home/CompareDock';
import { StickyNav } from '@/components/home/StickyNav';
import { Navbar9 } from '@/components/home/Navbar9';
import { ParticlesBackground } from '@/components/home/ParticlesBackground';

type Sort = 'relevancia' | 'precio-asc' | 'precio-desc' | 'descuento' | 'nombre';

const SORTS: { value: Sort; label: string }[] = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'descuento', label: 'Mayor descuento' },
  { value: 'nombre', label: 'Nombre (A-Z)' },
];

// Rangos en USD (moneda base); las etiquetas se muestran en la moneda activa.
const PRICE_RANGES = [
  { id: 'r1', min: 0, max: 500 },
  { id: 'r2', min: 500, max: 1500 },
  { id: 'r3', min: 1500, max: 5000 },
  { id: 'r4', min: 5000, max: Infinity },
] as const;


/*
 * Tienda completa (/tienda y /tienda/[categoria]). Hero oscuro de marca con
 * el mismo encabezado de la home (versión tienda: moneda + carrito, sin
 * Cotizar), buscador y accesos por categoría. Debajo, filtros laterales
 * (categoría, marca, rango de precio, ofertas) + orden, chips de filtros
 * activos y la grilla con la tarjeta de producto de la home (comparar,
 * favoritos, galería, carrito). En celular los filtros van en un panel.
 */
export function StoreCatalog({
  initialCategory,
  products,
  categories,
}: {
  initialCategory?: string;
  /** Catálogo ya cargado en el servidor (API central, con respaldo local). */
  products: CatalogProduct[];
  categories: Categoria[];
}) {
  const categoryTitle = (slug: string) => categories.find((c) => c.slug === slug)?.title ?? slug;
  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))].sort(), [products]);
  const { format, currency } = useCurrency();
  const compare = useCompare();

  const [query, setQuery] = useState('');
  const [cats, setCats] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selBrands, setSelBrands] = useState<string[]>([]);
  const [range, setRange] = useState<string | null>(null);
  const [onlyDeals, setOnlyDeals] = useState(false);
  const [sort, setSort] = useState<Sort>('relevancia');
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawer]);

  const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const r = PRICE_RANGES.find((x) => x.id === range);
    const out = products.filter(
      (p) =>
        (!q || `${p.name} ${p.brand} ${p.sku}`.toLowerCase().includes(q)) &&
        (cats.length === 0 || cats.includes(p.category)) &&
        (selBrands.length === 0 || selBrands.includes(p.brand)) &&
        (!r || (p.price >= r.min && p.price < r.max)) &&
        (!onlyDeals || discountOf(p) > 0),
    );
    const sorted = [...out];
    if (sort === 'precio-asc') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'precio-desc') sorted.sort((a, b) => b.price - a.price);
    if (sort === 'descuento') sorted.sort((a, b) => discountOf(b) - discountOf(a));
    if (sort === 'nombre') sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [products, query, cats, selBrands, range, onlyDeals, sort]);

  // Conteos para cada opción (sobre el catálogo completo).
  const count = (fn: (p: CatalogProduct) => boolean) => products.filter(fn).length;
  const rangeLabel = (r: (typeof PRICE_RANGES)[number]) =>
    r.max === Infinity ? `Más de ${format(r.min)}` : r.min === 0 ? `Hasta ${format(r.max)}` : `${format(r.min)} – ${format(r.max)}`;

  const chips = [
    ...cats.map((c) => ({ key: `c-${c}`, label: categoryTitle(c), clear: () => setCats((l) => l.filter((x) => x !== c)) })),
    ...selBrands.map((b) => ({ key: `b-${b}`, label: b, clear: () => setSelBrands((l) => l.filter((x) => x !== b)) })),
    ...(range ? [{ key: 'r', label: rangeLabel(PRICE_RANGES.find((x) => x.id === range)!), clear: () => setRange(null) }] : []),
    ...(onlyDeals ? [{ key: 'd', label: 'Con descuento', clear: () => setOnlyDeals(false) }] : []),
    ...(query ? [{ key: 'q', label: `“${query}”`, clear: () => setQuery('') }] : []),
  ];
  const clearAll = () => {
    setCats([]);
    setSelBrands([]);
    setRange(null);
    setOnlyDeals(false);
    setQuery('');
  };

  const heading = initialCategory ? categoryTitle(initialCategory) : 'Tienda B2B';

  const check = (checked: boolean) =>
    `flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
      checked ? 'border-brand-primary bg-brand-primary text-white' : 'border-black/15 bg-white'
    }`;

  const filters = (
    <div className="space-y-7">
      <FilterGroup title="Categoría">
        {categories.map((c) => {
          const on = cats.includes(c.slug);
          return (
            <FilterOption key={c.slug} onClick={() => setCats((l) => toggleIn(l, c.slug))} active={on} count={count((p) => p.category === c.slug)}>
              <span className={check(on)}>{on && <CheckMark />}</span>
              {c.title}
            </FilterOption>
          );
        })}
      </FilterGroup>
      <FilterGroup title="Marca">
        {brands.map((b) => {
          const on = selBrands.includes(b);
          return (
            <FilterOption key={b} onClick={() => setSelBrands((l) => toggleIn(l, b))} active={on} count={count((p) => p.brand === b)}>
              <span className={check(on)}>{on && <CheckMark />}</span>
              {b}
            </FilterOption>
          );
        })}
      </FilterGroup>
      <FilterGroup title="Precio (sin IGV)">
        {PRICE_RANGES.map((r) => {
          const on = range === r.id;
          return (
            <FilterOption key={r.id} onClick={() => setRange(on ? null : r.id)} active={on} count={count((p) => p.price >= r.min && p.price < r.max)}>
              <span className={`${check(on)} rounded-full`}>{on && <span className="h-2 w-2 rounded-full bg-white" />}</span>
              {rangeLabel(r)}
            </FilterOption>
          );
        })}
      </FilterGroup>
      <FilterGroup title="Ofertas">
        <FilterOption onClick={() => setOnlyDeals((v) => !v)} active={onlyDeals} count={count((p) => discountOf(p) > 0)}>
          <span className={check(onlyDeals)}>{onlyDeals && <CheckMark />}</span>
          Solo con descuento
        </FilterOption>
      </FilterGroup>
      {chips.length > 0 && (
        <button type="button" onClick={clearAll} className="w-full rounded-xl border border-brand-dark/15 py-2.5 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-dark hover:text-white">
          Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <>
      <StickyNav store />

      {/* Hero de la tienda: mismo marco que el de la home (el Navbar9
          invisible reserva el lugar del encabezado fijo). */}
      <div className="bg-white p-3 md:p-5">
        <section className="relative overflow-hidden rounded-[1.25rem] bg-ink text-white md:rounded-[2.25rem]">
          {/* Foto de fondo completa (escritorio con monitor) + degradado de
              marca: oscuro a la izquierda, donde va el texto. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/categorias/monitores.jpg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover object-[center_55%]" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/65 to-ink/80" />
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,rgba(0,0,0,0.35),transparent)]" />
          {/* Efecto "TI": partículas y nodos conectados en el celeste de la marca (como en el resto de heros). */}
          <div aria-hidden className="absolute inset-0"><ParticlesBackground /></div>
          <svg aria-hidden className="pointer-events-none absolute left-6 top-24 hidden h-36 w-72 text-brand-400/70 lg:block" viewBox="0 0 288 144" fill="none">
            <path d="M8 120 L70 84 L132 98 L196 36 L280 58" stroke="currentColor" strokeWidth="1" />
            <path d="M70 84 L96 22 L196 36" stroke="currentColor" strokeWidth="1" />
            {[[8, 120], [70, 84], [132, 98], [196, 36], [280, 58], [96, 22]].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill="currentColor" />
            ))}
          </svg>
          <div className="invisible" aria-hidden>
            <Navbar9 store />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-6 md:px-10">
            {/* Migas de pan = etiqueta de vidrio con casita (igual que las páginas internas). */}
            <nav
              aria-label="Migas de pan"
              className="relative flex w-fit flex-wrap items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm text-white/75 backdrop-blur-md"
            >
              <span className="spin-border spin-border--thin" aria-hidden />
              <a href="/" className="relative flex items-center gap-1.5 transition-colors hover:text-white">
                <Home className="h-4 w-4 text-white" strokeWidth={2} />
                Inicio
              </a>
              <span className="relative text-white/80">/</span>
              {initialCategory ? (
                <>
                  <a href="/tienda" className="relative transition-colors hover:text-white">Tienda</a>
                  <span className="relative text-white/80">/</span>
                  <span className="relative font-semibold text-white">{heading}</span>
                </>
              ) : (
                <span className="relative font-semibold text-white">Tienda</span>
              )}
            </nav>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-5xl">
              <span className="text-white">{initialCategory ? heading : 'Equipamiento TI'}</span>{' '}
              <span className="title-shimmer-dark">{initialCategory ? 'con stock local' : 'listo para despachar'}</span>
            </h1>
            <p className="mt-3 max-w-xl text-white/90">
              Precios en {currency === 'PEN' ? 'soles' : 'dólares'} sin IGV. El IGV (18%) se suma en el carrito.
            </p>

            {/* Buscador */}
            <label className="mt-7 flex max-w-2xl items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md focus-within:border-white/40 focus-within:bg-white/15">
              <Search className="h-5 w-5 shrink-0 text-white/70" strokeWidth={2} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca por producto, marca o SKU"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/80"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} aria-label="Borrar búsqueda" className="text-white/70 hover:text-white">
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              )}
            </label>

            {/* Accesos rápidos por categoría */}
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCats([])}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${cats.length === 0 ? 'bg-white text-brand-dark' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                Todo ({products.length})
              </button>
              {categories.map((c) => {
                const on = cats.length === 1 && cats[0] === c.slug;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => setCats([c.slug])}
                    className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${on ? 'bg-white text-brand-dark' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {c.title} ({count((p) => p.category === c.slug)})
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <div className="relative overflow-hidden bg-white">
      {/* Fondo de la tienda: blanco con los mismos puntitos del resto del sitio + resplandores suaves. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand-600)_16%,transparent)_1px,transparent_1px)] bg-[size:22px_22px]" />
      <div aria-hidden className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -left-24 top-1/2 h-80 w-80 rounded-full bg-brand-300/20 blur-3xl" />
      <main className="relative mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[260px_1fr]">
        {/* Filtros (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-2xl bg-brand-100 p-5">
            <p className="mb-5 flex items-center gap-2 font-display text-base font-bold text-ink">
              <SlidersHorizontal className="h-4 w-4 text-brand-700" strokeWidth={2} />
              Filtros
            </p>
            {filters}
          </div>
        </aside>

        <div>
          {/* Barra: resultados + filtros (celular) + orden */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink/60">
              <span className="font-display text-lg font-bold text-ink">{results.length}</span> {results.length === 1 ? 'producto' : 'productos'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDrawer(true)}
                className="flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-3.5 text-sm font-semibold text-ink lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
                Filtros {chips.length > 0 && <span className="rounded-md bg-brand-primary px-1.5 text-xs text-white">{chips.length}</span>}
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                aria-label="Ordenar productos"
                className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm font-medium text-ink outline-none focus:border-brand-primary"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtros activos */}
          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={c.clear}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold text-brand-dark transition-colors hover:bg-brand-primary/20"
                >
                  {c.label}
                  <X className="h-3.5 w-3.5" strokeWidth={2.4} />
                </button>
              ))}
              <button type="button" onClick={clearAll} className="px-2 text-xs font-semibold text-brand-700 hover:underline">
                Limpiar todo
              </button>
            </div>
          )}

          {results.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <ProductCardFinal key={p.sku} product={p} compared={compare.skus.includes(p.sku)} onToggleCompare={compare.toggle} />
              ))}
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-brand-dark/20 bg-white px-6 py-16 text-center">
              <Search className="h-10 w-10 text-brand-700/40" strokeWidth={1.5} />
              <p className="mt-4 font-display text-lg font-bold text-ink">No encontramos productos con esos filtros</p>
              <p className="mt-1 text-sm text-ink/65">Prueba quitar algún filtro o buscar otra palabra.</p>
              <button type="button" onClick={clearAll} className="mt-5 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </main>
      </div>

      {/* Filtros en celular: panel lateral */}
      {drawer && (
        <div className="fixed inset-0 z-[70] flex bg-brand-primary/40 backdrop-blur-sm lg:hidden" onClick={() => setDrawer(false)}>
          <div className="animate-pop-in flex h-full w-[min(340px,88vw)] flex-col bg-white shadow-2xl shadow-brand-dark/30" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <p className="flex items-center gap-2 font-display text-base font-bold text-ink">
                <SlidersHorizontal className="h-4 w-4 text-brand-700" strokeWidth={2} />
                Filtros
              </p>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Cerrar filtros" className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-black/5">
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{filters}</div>
            <div className="border-t border-black/5 p-4">
              <button type="button" onClick={() => setDrawer(false)} className="h-11 w-full rounded-xl bg-brand-primary text-sm font-semibold text-white transition-colors hover:bg-brand-primary">
                Ver {results.length} {results.length === 1 ? 'producto' : 'productos'}
              </button>
            </div>
          </div>
        </div>
      )}

      <CompareDock products={products} compare={compare} />
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-ink/65">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterOption({ children, onClick, active, count }: { children: React.ReactNode; onClick: () => void; active: boolean; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-brand-primary/5 ${active ? 'font-semibold text-brand-dark' : 'text-ink/75'}`}
    >
      {children}
      <span className="ml-auto text-xs text-ink/65">{count}</span>
    </button>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
