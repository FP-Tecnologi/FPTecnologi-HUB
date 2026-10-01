'use client';
/*
 * FPTecnologi-HUB — Blogs → Lista de blogs (GET /blog). Tabla con filtro por
 * estado y búsqueda; editar abre el editor (/blogs/nuevo?id=...), ver abre el
 * artículo en la web pública, eliminar pide confirmación.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

const WEB = process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'http://localhost:3002';

interface Articulo {
  id: string;
  titulo: string;
  slug: string;
  categoria: string;
  portadaUrl: string | null;
  estado: 'BORRADOR' | 'PUBLICADO';
  destacado: boolean;
  publicadoEn: string | null;
  updatedAt: string;
}

const fecha = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const src = (u: string | null) => (u ? (u.startsWith('/') ? `${WEB}${u}` : u) : null);

const ICON = { className: 'ax-btn__icon', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

export function BlogLista() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Articulo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState<'' | 'PUBLICADO' | 'BORRADOR'>('');
  const [q, setQ] = useState('');

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      setLista(await api.get<Articulo[]>('/blog'));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los artículos.');
    } finally {
      setCargando(false);
    }
  }, [activeMarcaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const visibles = useMemo(
    () => lista.filter((a) => (!filtro || a.estado === filtro) && (!q || `${a.titulo} ${a.categoria}`.toLowerCase().includes(q.toLowerCase()))),
    [lista, filtro, q],
  );

  async function eliminar(a: Articulo) {
    if (!window.confirm(`¿Eliminar "${a.titulo}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/blog/${a.id}`);
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo eliminar.');
    }
  }

  const cuenta = (e: '' | 'PUBLICADO' | 'BORRADOR') => lista.filter((a) => !e || a.estado === e).length;

  return (
    <>
      <PageHead
        title="Lista de blogs"
        subtitle="Artículos del blog de la web. Los publicados se ven al instante en /blog."
        actions={
          <a className="ax-btn ax-btn--primary" href="/blogs/nuevo">
            <svg {...ICON}><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg>
            <span className="ax-btn__label">Nuevo artículo</span>
          </a>
        }
      />

      {error && (
        <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div>
        </div>
      )}

      <section className="ax-card" role="region" aria-label="Artículos">
        <div className="ax-card__body">
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Filtrar por estado">
              {([['', 'Todos'], ['PUBLICADO', 'Publicados'], ['BORRADOR', 'Borradores']] as const).map(([v, l]) => (
                <button key={l} type="button" role="radio" aria-checked={filtro === v} className={`ax-btn ax-btn--sm${filtro === v ? ' is-selected' : ''}`} onClick={() => setFiltro(v)}>
                  {l} ({cuenta(v)})
                </button>
              ))}
            </div>
            <input type="search" className="ax-input" placeholder="Buscar artículos…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar artículos" style={{ maxWidth: 280 }} />
          </div>
        </div>
        <div className="ax-table-wrap">
          <table className="ax-table ax-table--hover">
            <thead className="ax-table__head">
              <tr>
                <th className="ax-table__th" scope="col">Artículo</th>
                <th className="ax-table__th" scope="col">Categoría</th>
                <th className="ax-table__th" scope="col">Estado</th>
                <th className="ax-table__th" scope="col">Fecha</th>
                <th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td className="ax-table__td" colSpan={5}>Cargando…</td></tr>
              ) : visibles.length === 0 ? (
                <tr><td className="ax-table__td" colSpan={5} style={{ color: 'var(--ax-text-muted)' }}>No hay artículos{filtro || q ? ' con este filtro' : ' todavía. Crea el primero.'}</td></tr>
              ) : (
                visibles.map((a) => (
                  <tr key={a.id} className="ax-table__row">
                    <td className="ax-table__td">
                      <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'nowrap' }}>
                        <span style={{ width: 64, height: 44, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: 'var(--ax-surface-subtle)' }}>
                          {src(a.portadaUrl) && <img src={src(a.portadaUrl)!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <a href={`/blogs/nuevo?id=${a.id}`} style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>
                            {a.titulo}
                          </a>
                          <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
                            /blog/{a.slug}
                            {a.destacado ? ' · ★ Destacado' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="ax-table__td"><span className="ax-badge ax-badge--soft ax-badge--neutral ax-badge--pill">{a.categoria}</span></td>
                    <td className="ax-table__td">
                      <span className={`ax-badge ax-badge--soft ax-badge--sm ${a.estado === 'PUBLICADO' ? 'ax-badge--success' : 'ax-badge--warning'}`}>
                        {a.estado === 'PUBLICADO' ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="ax-table__td" style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>
                      {a.estado === 'PUBLICADO' ? fecha(a.publicadoEn) : `Editado ${fecha(a.updatedAt)}`}
                    </td>
                    <td className="ax-table__td" style={{ textAlign: 'right' }}>
                      <div className="ax-cluster" style={{ gap: 'var(--ax-space-1)', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                        <a className="ax-btn ax-btn--ghost ax-btn--sm" href={`/blogs/nuevo?id=${a.id}`}>Editar</a>
                        {a.estado === 'PUBLICADO' && (
                          <a className="ax-btn ax-btn--ghost ax-btn--sm" href={`${WEB}/blog/${a.slug}`} target="_blank" rel="noreferrer">Ver</a>
                        )}
                        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => eliminar(a)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default BlogLista;
