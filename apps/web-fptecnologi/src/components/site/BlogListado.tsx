'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight, CalendarDays, Search, X } from 'lucide-react';
import { fechaLarga, PORTADA_DEFECTO, type ArticuloResumen } from '@/lib/blog';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';

export function ArticuloCard({ a }: { a: ArticuloResumen }) {
  return (
    <a
      href={`/blog/${a.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-lg shadow-brand-dark/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-dark/25"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a.portadaUrl || PORTADA_DEFECTO} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:rotate-1 group-hover:scale-110" />
        <span className="absolute left-3 top-3 rounded-lg border border-white/30 bg-brand-primary/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">{a.categoria}</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex items-center gap-1.5 text-xs text-ink/50">
          <CalendarDays className="h-3.5 w-3.5" strokeWidth={2} />
          {fechaLarga(a.publicadoEn)}
        </p>
        <h3 className="mt-2 font-display text-lg font-bold leading-snug text-ink transition-colors group-hover:text-brand-primary">{a.titulo}</h3>
        {a.etiquetas.length > 0 && (
          <p className="mt-2 flex flex-wrap gap-1.5">
            {a.etiquetas.slice(0, 3).map((t) => (
              <span key={t} className="rounded-md bg-brand-primary/10 px-2 py-0.5 text-[11px] font-semibold text-brand-700">#{t}</span>
            ))}
          </p>
        )}
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/60">{a.resumen}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-brand-700">
          Leer artículo
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" strokeWidth={2} />
        </span>
      </div>
    </a>
  );
}

/* Artículos por página: 9 = 3 filas de 3 en escritorio (2 columnas en tablet, 1 en móvil). */
const POR_PAGINA = 9;

/* Destacado arriba (o el más reciente) + grilla con filtro por categoría y paginación. */
export function BlogListado({ articulos, inicial }: { articulos: ArticuloResumen[]; inicial?: { categoria?: string; etiqueta?: string; q?: string } }) {
  const [cat, setCat] = useState<string | null>(inicial?.categoria ?? null);
  const [etiqueta, setEtiqueta] = useState<string | null>(inicial?.etiqueta ?? null);
  const [q, setQ] = useState(inicial?.q ?? '');
  const [pagina, setPagina] = useState(1);
  const destacado = articulos.find((a) => a.destacado) ?? articulos[0];
  const categorias = useMemo(() => [...new Set(articulos.map((a) => a.categoria))], [articulos]);
  const texto = q.trim().toLowerCase();
  const filtrando = !!(cat || etiqueta || texto);
  const coincide = (a: ArticuloResumen) =>
    (!cat || a.categoria === cat) &&
    (!etiqueta || a.etiquetas.includes(etiqueta)) &&
    (!texto || `${a.titulo} ${a.resumen} ${a.etiquetas.join(' ')}`.toLowerCase().includes(texto));
  // Con filtros activos se listan todos los que coinciden (el destacado también); sin filtros va arriba aparte.
  const resto = articulos.filter((a) => (filtrando ? coincide(a) : a !== destacado));
  const paginas = Math.max(1, Math.ceil(resto.length / POR_PAGINA));
  const visibles = resto.slice((Math.min(pagina, paginas) - 1) * POR_PAGINA, Math.min(pagina, paginas) * POR_PAGINA);
  const elegirCategoria = (c: string | null) => {
    setCat(c);
    setPagina(1);
  };
  const limpiar = () => {
    setCat(null);
    setEtiqueta(null);
    setQ('');
    setPagina(1);
  };

  if (articulos.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <SectionBadge>Blog</SectionBadge>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink">Pronto publicaremos artículos</h2>
        <p className="mt-3 text-ink/60">Guías y novedades de tecnología para empresas. Vuelve pronto.</p>
      </section>
    );
  }

  const chip = (on: boolean) =>
    `rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
      on ? 'bg-brand-primary text-white shadow-md shadow-brand-dark/30' : 'bg-white text-ink/70 shadow-sm shadow-brand-dark/10 hover:text-brand-700'
    }`;

  return (
    <>
      {destacado && !filtrando && (
        <section className="mx-auto max-w-7xl px-6 pt-20">
          <ScrollReveal direction="up">
            <a
              href={`/blog/${destacado.slug}`}
              className="group grid overflow-hidden rounded-2xl bg-white shadow-xl shadow-brand-dark/15 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-dark/25 lg:grid-cols-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={destacado.portadaUrl || PORTADA_DEFECTO} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute left-4 top-4 rounded-lg bg-brand-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-brand-dark/30">Destacado</span>
              </div>
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
                  {destacado.categoria} · {fechaLarga(destacado.publicadoEn)}
                </p>
                <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-ink transition-colors group-hover:text-brand-primary sm:text-3xl">{destacado.titulo}</h2>
                <p className="mt-3 leading-relaxed text-ink/60">{destacado.resumen}</p>
                <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-brand-dark/30 transition-colors group-hover:bg-brand-primary">
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" strokeWidth={2} />
                  Leer artículo
                </span>
              </div>
            </a>
          </ScrollReveal>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 py-20">
        <ScrollReveal direction="up" className="mx-auto mb-10 flex max-w-2xl flex-col items-center text-center">
          <SectionBadge>Artículos</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">Últimas</span> <span className="title-shimmer-light">publicaciones</span>
          </h2>
        </ScrollReveal>
        <div className="mx-auto mb-6 max-w-xl">
          <label htmlFor="blog-buscar" className="sr-only">Buscar en el blog</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40" strokeWidth={1.8} />
            <input
              id="blog-buscar"
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar artículos, temas o etiquetas…"
              className="h-12 w-full rounded-xl border border-ink/10 bg-white pl-12 pr-4 text-sm text-ink shadow-sm shadow-brand-dark/10 outline-none transition-all placeholder:text-ink/40 focus:border-brand-dark focus:ring-4 focus:ring-brand-dark/10"
            />
          </div>
        </div>
        {etiqueta && (
          <div className="mb-6 flex justify-center">
            <button type="button" onClick={() => { setEtiqueta(null); setPagina(1); }} className="inline-flex items-center gap-2 rounded-lg bg-brand-primary/10 px-3.5 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-primary hover:text-white">
              #{etiqueta}
              <X className="h-4 w-4" strokeWidth={2.2} aria-label="Quitar etiqueta" />
            </button>
          </div>
        )}
        {categorias.length > 1 && (
          <div className="mb-10 flex flex-wrap justify-center gap-2.5">
            <button type="button" className={chip(cat === null)} onClick={() => elegirCategoria(null)}>
              Todas
            </button>
            {categorias.map((c) => (
              <button key={c} type="button" className={chip(cat === c)} onClick={() => elegirCategoria(c)}>
                {c}
              </button>
            ))}
          </div>
        )}
        {resto.length === 0 ? (
          <div className="text-center text-ink/55">
            <p>{filtrando ? 'No encontramos artículos con esos filtros.' : 'No hay más artículos en esta categoría.'}</p>
            {filtrando && (
              <button type="button" onClick={limpiar} className="mt-4 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primary">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {visibles.map((a, i) => (
              <ScrollReveal key={a.id} direction="up" delayMs={(i % 3) * 100} className="h-full">
                <ArticuloCard a={a} />
              </ScrollReveal>
            ))}
          </div>
        )}
        {paginas > 1 && (
          <nav aria-label="Páginas del blog" className="mt-12 flex flex-wrap items-center justify-center gap-2">
            <button type="button" className={chip(false)} disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>
              Anterior
            </button>
            {Array.from({ length: paginas }, (_, n) => n + 1).map((n) => (
              <button key={n} type="button" aria-current={n === pagina ? 'page' : undefined} className={chip(n === pagina)} onClick={() => setPagina(n)}>
                {n}
              </button>
            ))}
            <button type="button" className={chip(false)} disabled={pagina >= paginas} onClick={() => setPagina(pagina + 1)}>
              Siguiente
            </button>
          </nav>
        )}
      </section>
    </>
  );
}
